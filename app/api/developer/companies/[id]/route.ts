import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// GET - Şirket detaylarını getir (Sadece SUPER_ADMIN)
export async function GET(
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

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            position: true,
            isActive: true,
            createdAt: true,
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
            monthlyBudget: true,
            yearlyBudget: true,
            status: true,
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            status: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        purchaseRequests: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            totalAmount: true,
            createdAt: true,
            requester: {
              select: {
                name: true,
                email: true,
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            users: true,
            departments: true,
            products: true,
            purchaseRequests: true,
            orders: true,
            categories: true,
            workflows: true,
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Şirket bulunamadı' },
        { status: 404 }
      )
    }

    // Toplam istatistikleri hesapla
    const stats = {
      totalUsers: company._count.users,
      totalDepartments: company._count.departments,
      totalProducts: company._count.products,
      totalPurchaseRequests: company._count.purchaseRequests,
      totalOrders: company._count.orders,
      totalCategories: company._count.categories,
      totalWorkflows: company._count.workflows,

      // Purchase request durumları
      pendingRequests: await prisma.purchaseRequest.count({
        where: { companyId: params.id, status: 'PENDING' }
      }),
      approvedRequests: await prisma.purchaseRequest.count({
        where: { companyId: params.id, status: 'APPROVED' }
      }),
      rejectedRequests: await prisma.purchaseRequest.count({
        where: { companyId: params.id, status: 'REJECTED' }
      }),

      // Toplam harcama
      totalSpent: await prisma.purchaseRequest.aggregate({
        where: {
          companyId: params.id,
          status: 'APPROVED'
        },
        _sum: {
          totalAmount: true
        }
      }).then(res => res._sum.totalAmount || 0),

      // Aktif kullanıcı sayısı
      activeUsers: await prisma.user.count({
        where: { companyId: params.id, isActive: true }
      }),
    }

    return NextResponse.json({
      success: true,
      data: {
        ...company,
        stats
      }
    })
  } catch (error: any) {
    console.error('Get company detail error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT - Şirket güncelle (Sadece SUPER_ADMIN)
export async function PUT(
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
    const { name, taxNumber, address, city, phone, email, website, isActive } = body

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        name,
        taxNumber,
        address,
        city,
        phone,
        email,
        website,
        isActive,
      }
    })

    return NextResponse.json({
      success: true,
      data: company
    })
  } catch (error: any) {
    console.error('Update company error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Şirket güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE - Şirket sil (Sadece SUPER_ADMIN)
export async function DELETE(
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

    await prisma.company.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Şirket başarıyla silindi'
    })
  } catch (error: any) {
    console.error('Delete company error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Şirket silinemedi' },
      { status: 500 }
    )
  }
}
