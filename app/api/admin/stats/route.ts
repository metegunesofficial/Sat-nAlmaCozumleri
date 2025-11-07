import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { requireRole } from '@/lib/authz'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/stats
 * Get system-wide statistics (SUPER_ADMIN only)
 */
export const GET = createHandler({
  permission: 'system:admin',
  handler: async (request, session) => {
    requireRole(session, ['SUPER_ADMIN'])

    // Get overall counts
    const [
      totalCompanies,
      activeCompanies,
      demoCompanies,
      totalUsers,
      totalDepartments,
      totalPurchaseRequests,
      totalProducts,
      totalCategories,
      totalSuppliers,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.company.count({ where: { isDemo: true } }),
      prisma.user.count(),
      prisma.department.count(),
      prisma.purchaseRequest.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.supplier.count(),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              name: true,
              slug: true,
            },
          },
          actorUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ])

    // Get purchase request status breakdown
    const requestsByStatus = await prisma.purchaseRequest.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    // Get companies with most activity (by user count)
    const topCompanies = await prisma.company.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            users: true,
            purchaseRequests: true,
            products: true,
          },
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
    })

    // Get recent signups (companies created in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSignups = await prisma.company.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const stats = {
      overview: {
        totalCompanies,
        activeCompanies,
        demoCompanies,
        totalUsers,
        totalDepartments,
        totalPurchaseRequests,
        totalProducts,
        totalCategories,
        totalSuppliers,
      },
      purchaseRequests: {
        byStatus: requestsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>),
      },
      topCompanies: topCompanies.map(company => ({
        id: company.id,
        name: company.name,
        slug: company.slug,
        isActive: company.isActive,
        isDemo: company.isDemo,
        userCount: company._count.users,
        requestCount: company._count.purchaseRequests,
        productCount: company._count.products,
      })),
      growth: {
        recentSignups,
      },
      recentActivity: recentAuditLogs,
    }

    return ApiResponse.success(stats)
  },
})
