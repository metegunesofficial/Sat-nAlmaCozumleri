import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function validateTurkishPhone(phone: string): boolean {
  // Türk telefon numarası formatları:
  // +90 5XX XXX XX XX veya 0 5XX XXX XX XX veya 5XX XXX XX XX
  const phoneRegex = /^(\+90|0)?5\d{9}$/
  const cleanPhone = phone.replace(/\s/g, '')
  return phoneRegex.test(cleanPhone)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, companyId, role } = body

    if (!email || !password || !name || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik (email, password, name, companyId)' },
        { status: 400 }
      )
    }

    if (!phone || !validateTurkishPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir Türk telefon numarası giriniz (örn: 0555 123 4567)' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { email, companyId },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Bu email zaten kullanılıyor' },
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

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
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
        companyId: true,
        phone: true,
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
