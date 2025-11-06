import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        companyId: currentUser.companyId,
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
        address: true,
        city: true,
        district: true,
        postalCode: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            purchaseRequests: true,
            orders: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('User fetch error:')
    return NextResponse.json(
      { success: false, error: 'Kullanıcı yüklenemedi' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only COMPANY_ADMIN and SUPER_ADMIN can update users
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        companyId: currentUser.companyId,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      role,
      departmentId,
      position,
      employeeId,
      address,
      city,
      district,
      postalCode,
      password,
    } = body

    // Check if email is being changed to an existing one
    if (email && email !== user.email) {
      const existing = await prisma.user.findFirst({
        where: {
          email,
          companyId: currentUser.companyId,
          id: { not: params.id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta ile kayıtlı başka bir kullanıcı var' },
          { status: 409 }
        )
      }
    }

    const updateData: any = {
      name,
      email,
      phone,
      role,
      departmentId,
      position,
      employeeId,
      address,
      city,
      district,
      postalCode,
    }

    // If password is provided, hash it
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Kullanıcı başarıyla güncellendi',
    })
  } catch (error) {
    console.error('User update error:')
    return NextResponse.json(
      { success: false, error: 'Kullanıcı güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only SUPER_ADMIN can delete users
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'COMPANY_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    // Can't delete yourself
    if (params.id === currentUser.id) {
      return NextResponse.json(
        { success: false, error: 'Kendi hesabınızı silemezsiniz' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        companyId: currentUser.companyId,
      },
      include: {
        _count: {
          select: {
            purchaseRequests: true,
            orders: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Check if user has active data
    if (user._count.purchaseRequests > 0 || user._count.orders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu kullanıcıya ait aktif talep veya siparişler var. Kullanıcı silinemez.',
        },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi',
    })
  } catch (error) {
    console.error('User delete error:')
    return NextResponse.json(
      { success: false, error: 'Kullanıcı silinemedi' },
      { status: 500 }
    )
  }
}
