import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/reports/overview
 * Dashboard overview with key metrics
 */
export const GET = createHandler({
  permission: 'report:read',
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Date range filter
    const dateFilter: Prisma.PurchaseRequestWhereInput = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.lte = new Date(endDate)
    }

    const where = withCompanyScope(session, dateFilter)

    // Get all metrics in parallel
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalSpending,
      requestsByStatus,
      requestsByPriority,
      requestsByDepartment,
      requestsByCategory,
      recentRequests,
      topProducts,
    ] = await Promise.all([
      // Total requests
      prisma.purchaseRequest.count({ where }),

      // Pending (SUBMITTED, IN_REVIEW)
      prisma.purchaseRequest.count({
        where: { ...where, status: { in: ['SUBMITTED', 'IN_REVIEW'] } },
      }),

      // Approved
      prisma.purchaseRequest.count({
        where: { ...where, status: 'APPROVED' },
      }),

      // Rejected
      prisma.purchaseRequest.count({
        where: { ...where, status: 'REJECTED' },
      }),

      // Total spending (APPROVED only)
      prisma.purchaseRequest.aggregate({
        where: { ...where, status: 'APPROVED' },
        _sum: { estimatedTotal: true },
      }),

      // Group by status
      prisma.purchaseRequest.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),

      // Group by priority
      prisma.purchaseRequest.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true },
      }),

      // Group by department
      prisma.purchaseRequest.groupBy({
        by: ['departmentId'],
        where,
        _count: { departmentId: true },
        orderBy: { _count: { departmentId: 'desc' } },
        take: 5,
      }),

      // Group by category
      prisma.purchaseRequest.groupBy({
        by: ['purchaseCategoryId'],
        where,
        _count: { purchaseCategoryId: true },
        orderBy: { _count: { purchaseCategoryId: 'desc' } },
        take: 5,
      }),

      // Recent requests
      prisma.purchaseRequest.findMany({
        where,
        include: {
          requester: {
            select: { name: true, email: true },
          },
          department: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Top products by request count
      prisma.requestItem.groupBy({
        by: ['productId'],
        where: {
          purchaseRequest: where,
        },
        _count: { productId: true },
        _sum: { quantity: true, total: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 10,
      }),
    ])

    // Fetch department names
    const departmentIds = requestsByDepartment
      .map((d) => d.departmentId)
      .filter((id): id is string => id !== null)
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true },
    })

    // Fetch category names
    const categoryIds = requestsByCategory
      .map((c) => c.purchaseCategoryId)
      .filter((id): id is string => id !== null)
    const categories = await prisma.purchaseCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    })

    // Fetch product details
    const productIds = topProducts.map((p) => p.productId).filter((id): id is string => id !== null)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    })

    const overview = {
      summary: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalSpending: totalSpending._sum.estimatedTotal?.toNumber() || 0,
        averageRequestValue:
          totalRequests > 0
            ? ((totalSpending._sum.estimatedTotal?.toNumber() || 0) / totalRequests).toFixed(2)
            : 0,
      },
      breakdown: {
        byStatus: requestsByStatus.map((item) => ({
          status: item.status,
          count: item._count.status,
        })),
        byPriority: requestsByPriority.map((item) => ({
          priority: item.priority,
          count: item._count.priority,
        })),
        byDepartment: requestsByDepartment.map((item) => ({
          departmentId: item.departmentId,
          departmentName:
            departments.find((d) => d.id === item.departmentId)?.name || 'Unknown',
          count: item._count.departmentId,
        })),
        byCategory: requestsByCategory.map((item) => ({
          categoryId: item.purchaseCategoryId,
          categoryName:
            categories.find((c) => c.id === item.purchaseCategoryId)?.name || 'Unknown',
          count: item._count.purchaseCategoryId,
        })),
      },
      topProducts: topProducts.map((item) => {
        const product = products.find((p) => p.id === item.productId)
        return {
          productId: item.productId,
          productName: product?.name || 'Unknown',
          sku: product?.sku,
          requestCount: item._count.productId,
          totalQuantity: item._sum.quantity || 0,
          totalValue: item._sum.total?.toNumber() || 0,
        }
      }),
      recentRequests: recentRequests.map((req) => ({
        id: req.id,
        requestNumber: req.requestNumber,
        title: req.title,
        status: req.status,
        priority: req.priority,
        estimatedTotal: req.estimatedTotal?.toNumber() || 0,
        requester: req.requester?.name,
        department: req.department?.name,
        createdAt: req.createdAt,
      })),
    }

    return ApiResponse.success(overview)
  },
})
