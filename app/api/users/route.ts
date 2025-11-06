import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN and SUPER_ADMIN can list users
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const departmentId = searchParams.get('departmentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {
      companyId: user.companyId,
    }

    if (role) {
      where.role = role as any
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          departmentId: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          position: true,
          employeeId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Users fetch error:')
    return NextResponse.json(
      { success: false, error: 'Kullanıcılar yüklenemedi' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN and SUPER_ADMIN can create users
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      email,
      name,
      password,
      phone,
      role,
      departmentId,
      position,
      employeeId,
      address,
      city,
      district,
      postalCode,
    } = body

    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'E-posta, isim, şifre ve rol gereklidir' },
        { status: 400 }
      )
    }

    // Check if user with same email exists in company
    const existing = await prisma.user.findFirst({
      where: {
        email,
        companyId: currentUser.companyId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta ile kayıtlı kullanıcı zaten var' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        companyId: currentUser.companyId,
        email,
        name,
        password: hashedPassword,
        phone,
        role,
        departmentId,
        position,
        employeeId,
        address,
        city,
        district,
        postalCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        position: true,
        employeeId: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Kullanıcı başarıyla oluşturuldu',
    }, { status: 201 })
  } catch (error) {
    console.error('User creation error:')
    return NextResponse.json(
      { success: false, error: 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    )
  }
}
