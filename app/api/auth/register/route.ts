import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, companyName, companyId, role } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    // Check if user exists
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

    // Get or create company
    let finalCompanyId = companyId

    if (!finalCompanyId && companyName) {
      // Create a new company if companyName is provided but no companyId
      const company = await prisma.company.create({
        data: {
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        },
      })
      finalCompanyId = company.id
    } else if (!finalCompanyId) {
      return NextResponse.json(
        { success: false, error: 'Şirket bilgisi gerekli' },
        { status: 400 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        companyId: finalCompanyId,
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
