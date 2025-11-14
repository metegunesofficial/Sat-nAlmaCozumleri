import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, companyName, role } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    // Check if user exists - use findFirst since email is not unique across companies
    const existingUser = await prisma.user.findFirst({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Bu email zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new company with unique slug
      const companyNameToUse = companyName || `${name} Şirketi`
      const baseSlug = generateSlug(companyNameToUse)

      // Ensure slug is unique by appending timestamp if needed
      const existingCompany = await tx.company.findUnique({
        where: { slug: baseSlug },
      })
      const finalSlug = existingCompany ? `${baseSlug}-${Date.now()}` : baseSlug

      const company = await tx.company.create({
        data: {
          name: companyNameToUse,
          slug: finalSlug,
        },
      })

      // Create user with company
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          companyId: company.id,
          role: role || 'COMPANY_ADMIN', // First user in company should be admin
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          companyId: true,
        },
      })

      return newUser
    })

    const user = result

    // Generate token
    const token = generateToken(user.id, user.email, user.role)

    return NextResponse.json({
      success: true,
      data: { user, token },
      message: 'Kayıt başarılı',
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Kayıt işlemi başarısız' },
      { status: 500 }
    )
  }
}
