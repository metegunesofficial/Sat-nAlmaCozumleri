import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// POST - Şirket için yeni kullanıcı oluştur (Sadece SUPER_ADMIN)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }

    if (decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, role, position, phone, departmentId } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Ad, email, şifre ve rol gerekli' },
        { status: 400 }
      )
    }

    // Şirketin var olduğunu kontrol et
    const company = await prisma.company.findUnique({
      where: { id: params.id }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Şirket bulunamadı' },
        { status: 404 }
      )
    }

    // Email'in bu şirkette kullanılıp kullanılmadığını kontrol et
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        companyId: params.id
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Bu email adresi bu şirkette zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        position,
        phone,
        companyId: params.id,
        departmentId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true,
        phone: true,
        isActive: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    )
  }
}
