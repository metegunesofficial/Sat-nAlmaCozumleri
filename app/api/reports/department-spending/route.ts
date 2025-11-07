import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'

export const dynamic = 'force-dynamic'

/**
 * GET /api/reports/department-spending
 * Spending breakdown by department with rankings
 */
export const GET = createHandler({
  permission: 'report:read',
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Date range filter
    const dateFilter: any = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    const where = withCompanyScope(session, {
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      status: { in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED'] },
    })

    // Get all departments
    const departments = await prisma.department.findMany({
      where: withCompanyScope(session, { isActive: true }),
      select: {
        id: true,
        name: true,
        code: true,
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Get spending by department
    const departmentReport = await Promise.all(
      departments.map(async (dept) => {
        const requests = await prisma.purchaseRequest.findMany({
          where: {
            ...where,
            departmentId: dept.id,
          },
          select: {
            id: true,
            estimatedTotal: true,
            status: true,
            priority: true,
            purchaseCategory: {
              select: {
                name: true,
              },
            },
          },
        })

        const totalSpending = requests.reduce(
          (sum, req) => sum + (req.estimatedTotal?.toNumber() || 0),
          0
        )

        const approvedSpending = requests
          .filter((req) => req.status === 'APPROVED')
          .reduce((sum, req) => sum + (req.estimatedTotal?.toNumber() || 0), 0)

        const pendingSpending = requests
          .filter((req) => ['SUBMITTED', 'IN_REVIEW'].includes(req.status))
          .reduce((sum, req) => sum + (req.estimatedTotal?.toNumber() || 0), 0)

        const urgentRequests = requests.filter((req) => req.priority === 'URGENT').length

        // Category breakdown
        const categoryBreakdown: Record<string, number> = {}
        requests.forEach((req) => {
          const categoryName = req.purchaseCategory?.name || 'Uncategorized'
          categoryBreakdown[categoryName] = (categoryBreakdown[categoryName] || 0) + (req.estimatedTotal?.toNumber() || 0)
        })

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          departmentCode: dept.code,
          manager: dept.manager,
          requestCount: requests.length,
          totalSpending,
          approvedSpending,
          pendingSpending,
          urgentRequests,
          avgRequestValue: requests.length > 0 ? totalSpending / requests.length : 0,
          topCategories: Object.entries(categoryBreakdown)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, amount]) => ({ name, amount })),
        }
      })
    )

    // Sort by total spending
    const sortedDepartments = departmentReport.sort((a, b) => b.totalSpending - a.totalSpending)

    // Calculate totals
    const totalSpending = sortedDepartments.reduce((sum, d) => sum + d.totalSpending, 0)
    const totalRequests = sortedDepartments.reduce((sum, d) => sum + d.requestCount, 0)

    // Add percentage share and rank
    const departmentsWithRank = sortedDepartments.map((dept, index) => ({
      ...dept,
      rank: index + 1,
      percentageShare: totalSpending > 0 ? ((dept.totalSpending / totalSpending) * 100).toFixed(2) : '0',
    }))

    return ApiResponse.success({
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Now',
      },
      summary: {
        totalDepartments: departments.length,
        totalSpending,
        totalRequests,
        avgSpendingPerDepartment: departments.length > 0 ? totalSpending / departments.length : 0,
        avgRequestsPerDepartment: departments.length > 0 ? totalRequests / departments.length : 0,
        topSpender: departmentsWithRank[0]?.departmentName || null,
        bottomSpender: departmentsWithRank[departmentsWithRank.length - 1]?.departmentName || null,
      },
      departments: departmentsWithRank,
    })
  },
})
