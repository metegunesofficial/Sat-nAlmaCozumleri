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

    // Check if user exists (using findFirst since email is not unique alone)
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

    // Create or find company
    let company
    if (companyName) {
      // Create a slug from company name
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Check if company exists
      company = await prisma.company.findUnique({
        where: { slug },
      })

      // If company doesn't exist, create it
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: companyName,
            slug,
          },
        })
      }
    } else {
      // Find or create default company
      company = await prisma.company.findFirst({
        where: { slug: 'default' },
      })

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: 'Default Company',
            slug: 'default',
          },
        })
      }
    }

    // Create user with companyId
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        companyId: company.id,
        role: (role as any) || 'EMPLOYEE',
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
