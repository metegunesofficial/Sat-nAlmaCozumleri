import { NextRequest, NextResponse } from 'next/server'
import { users, findUserByEmail, findCompanyById } from '@/lib/seedData'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, companyId, position, phone, role } = body

    // Validation
    if (!name || !email || !password || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Check if company exists
    const company = findCompanyById(companyId)
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Seçilen şirket bulunamadı' },
        { status: 400 }
      )
    }

    // Check if company is active
    if (!company.isActive) {
      return NextResponse.json(
        { success: false, error: 'Seçilen şirket aktif değil' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Şifre en az 8 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      password, // In production, this should be hashed
      role: role || 'EMPLOYEE',
      companyId,
      companyName: company.name,
      position: position || '',
      phone: phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add user to in-memory array
    users.push(newUser)

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      data: { user: userWithoutPassword },
      message: 'Kayıt başarılı! Giriş yapabilirsiniz.',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Kayıt işlemi başarısız' },
      { status: 500 }
    )
  }
}
