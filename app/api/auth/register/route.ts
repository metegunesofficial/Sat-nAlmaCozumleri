import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, companyName, role } = body

    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Email, şifre, isim ve şirket adı gerekli' },
        { status: 400 }
      )
    }

    // Check if user exists (use findFirst for multi-tenant)
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

    // Create company slug from company name
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
          isActive: true,
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          companyId: company.id,
          role: role || 'COMPANY_ADMIN', // First user is company admin
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          companyId: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      return { user, company }
    })

    // Generate token
    const token = generateToken(result.user.id, result.user.email, result.user.role)

    return NextResponse.json({
      success: true,
      data: { user: result.user, token },
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
