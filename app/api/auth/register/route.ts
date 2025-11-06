import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

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

    // Check if user exists (using findFirst because email+companyId is the unique constraint)
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

    // For multi-tenant: Create company first, then user
    // If companyName is provided, create a new company; otherwise use a default
    let companyId = ''

    if (companyName) {
      // Create a new company for this user
      const company = await prisma.company.create({
        data: {
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        },
      })
      companyId = company.id
    } else {
      // Find or create a default company for users without a company
      const defaultCompany = await prisma.company.findFirst({
        where: { slug: 'default-company' },
      })

      if (defaultCompany) {
        companyId = defaultCompany.id
      } else {
        const newDefaultCompany = await prisma.company.create({
          data: {
            name: 'Default Company',
            slug: 'default-company',
          },
        })
        companyId = newDefaultCompany.id
      }
    }

    // Create user with companyId
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        companyId,
        role: role || 'EMPLOYEE',
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
