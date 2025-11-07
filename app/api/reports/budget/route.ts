import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'

export const dynamic = 'force-dynamic'

/**
 * GET /api/reports/budget
 * Budget usage and remaining by category
 */
export const GET = createHandler({
  permission: 'report:read',
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'monthly' // monthly, yearly

    // Get all categories with budget limits
    const categories = await prisma.purchaseCategory.findMany({
      where: withCompanyScope(session, {
        isActive: true,
        OR: [
          { monthlyLimit: { not: null } },
          { yearlyLimit: { not: null } },
        ],
      }),
      include: {
        children: true,
      },
      orderBy: { code: 'asc' },
    })

    // Calculate date range based on period
    const now = new Date()
    const startDate =
      period === 'monthly'
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), 0, 1)

    // Get spending per category
    const budgetReport = await Promise.all(
      categories.map(async (category) => {
        const spending = await prisma.purchaseRequest.aggregate({
          where: {
            companyId: session.user.companyId,
            purchaseCategoryId: category.id,
            createdAt: { gte: startDate },
            status: { in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED'] },
          },
          _sum: { estimatedTotal: true },
          _count: { id: true },
        })

        const spent = spending._sum.estimatedTotal?.toNumber() || 0
        const limit =
          period === 'monthly'
            ? category.monthlyLimit?.toNumber()
            : category.yearlyLimit?.toNumber()

        const remaining = limit ? limit - spent : null
        const usagePercent = limit ? ((spent / limit) * 100).toFixed(1) : null

        return {
          categoryId: category.id,
          categoryName: category.name,
          categoryCode: category.code,
          limit,
          spent,
          remaining,
          usagePercent: usagePercent ? parseFloat(usagePercent) : null,
          requestCount: spending._count.id,
          status:
            !limit
              ? 'no_limit'
              : spent > limit
              ? 'exceeded'
              : spent > limit * 0.9
              ? 'critical'
              : spent > limit * 0.75
              ? 'warning'
              : 'ok',
          hasChildren: category.children.length > 0,
        }
      })
    )

    // Calculate totals
    const totalBudget = budgetReport.reduce((sum, item) => sum + (item.limit || 0), 0)
    const totalSpent = budgetReport.reduce((sum, item) => sum + item.spent, 0)
    const totalRemaining = totalBudget - totalSpent

    return ApiResponse.success({
      period,
      startDate,
      endDate: now,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        usagePercent: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0,
        categoriesWithLimits: categories.length,
        categoriesExceeded: budgetReport.filter((r) => r.status === 'exceeded').length,
        categoriesCritical: budgetReport.filter((r) => r.status === 'critical').length,
      },
      categories: budgetReport.sort((a, b) => (b.usagePercent || 0) - (a.usagePercent || 0)),
    })
  },
})
