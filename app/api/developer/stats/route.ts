import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// GET - Genel platform istatistikleri (Sadece SUPER_ADMIN)
export async function GET() {
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

    // Genel sayılar
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      activeUsers,
      totalDepartments,
      totalProducts,
      totalPurchaseRequests,
      totalOrders,
      pendingRequests,
      approvedRequests,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.department.count(),
      prisma.product.count(),
      prisma.purchaseRequest.count(),
      prisma.order.count(),
      prisma.purchaseRequest.count({ where: { status: 'PENDING' } }),
      prisma.purchaseRequest.count({ where: { status: 'APPROVED' } }),
    ])

    // Toplam harcama
    const totalSpent = await prisma.purchaseRequest.aggregate({
      where: { status: 'APPROVED' },
      _sum: { totalAmount: true }
    })

    // Şirket başına istatistikler
    const companiesWithStats = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true,
            purchaseRequests: true,
            products: true,
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Son 30 günün purchase request trend'i
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentRequests = await prisma.purchaseRequest.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true
    })

    // Role dağılımı
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCompanies,
          activeCompanies,
          totalUsers,
          activeUsers,
          totalDepartments,
          totalProducts,
          totalPurchaseRequests,
          totalOrders,
          pendingRequests,
          approvedRequests,
          totalSpent: totalSpent._sum.totalAmount || 0,
        },
        recentCompanies: companiesWithStats,
        requestTrends: recentRequests,
        roleDistribution,
      }
    })
  } catch (error: any) {
    console.error('Developer stats error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
