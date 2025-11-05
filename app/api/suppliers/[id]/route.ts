import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/suppliers/[id] - Get single supplier
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const supplier = await prisma.supplier.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Tedarikçi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: supplier,
    })
  } catch (error) {
    console.error('Supplier fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Tedarikçi yüklenemedi' },
      { status: 500 }
    )
  }
}

// PUT /api/suppliers/[id] - Update supplier
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN and SUPER_ADMIN can update suppliers
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const supplier = await prisma.supplier.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      },
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Tedarikçi bulunamadı' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, contactPerson, email, phone, address, city, taxNumber, website, notes, status, rating } = body

    // Check if email is being changed to an existing one
    if (email && email !== supplier.email) {
      const existing = await prisma.supplier.findFirst({
        where: {
          companyId: user.companyId,
          email,
          id: { not: params.id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta ile kayıtlı başka bir tedarikçi var' },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name,
        contactPerson,
        email,
        phone,
        address,
        city,
        taxNumber,
        website,
        notes,
        status,
        rating: rating ? parseFloat(rating) : supplier.rating,
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Tedarikçi başarıyla güncellendi',
    })
  } catch (error) {
    console.error('Supplier update error:', error)
    return NextResponse.json(
      { success: false, error: 'Tedarikçi güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN and SUPER_ADMIN can delete suppliers
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const supplier = await prisma.supplier.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Tedarikçi bulunamadı' },
        { status: 404 }
      )
    }

    // Check if supplier has products
    if (supplier._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu tedarikçiye ait ürünler var. Önce ürünleri silmelisiniz.',
        },
        { status: 400 }
      )
    }

    await prisma.supplier.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Tedarikçi başarıyla silindi',
    })
  } catch (error) {
    console.error('Supplier delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Tedarikçi silinemedi' },
      { status: 500 }
    )
  }
}
