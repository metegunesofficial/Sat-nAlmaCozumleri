import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, companyId, departmentId, role } = body

    if (!email || !password || !name || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Email, şifre, isim ve şirket ID gereklidir' },
        { status: 400 }
      )
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz şirket ID' },
        { status: 400 }
      )
    }

    // Check if user exists in this company (email+companyId must be unique)
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        companyId
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Bu email bu şirkette zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        companyId,
        departmentId: departmentId || null,
        role: role || 'EMPLOYEE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        companyId: true,
        departmentId: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
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
