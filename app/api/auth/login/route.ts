import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email ve şifre gerekli' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz şifre' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role)

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: { user: userWithoutPassword, token },
      message: 'Giriş başarılı',
    })
  } catch (error) {
    console.error('Login error')
    return NextResponse.json(
      { success: false, error: 'Giriş işlemi başarısız' },
      { status: 500 }
    )
  }
}
