import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, companyName, role } = body

    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik (email, password, name, companyName)' },
        { status: 400 }
      )
    }

    // Check if user exists (using findFirst since email is only unique within a company)
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

    // Create company and user together in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create or get company
      let company = await tx.company.findFirst({
        where: {
          name: companyName,
        },
      })

      if (!company) {
        // Create new company with a unique slug
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
        company = await tx.company.create({
          data: {
            name: companyName,
            slug,
          },
        })
      }

      // Create user with company
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          companyId: company.id,
          role: role || 'EMPLOYEE',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      return user
    })

    // Generate token
    const token = generateToken(result.id, result.email, result.role)

    return NextResponse.json({
      success: true,
      data: { user: result, token },
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
