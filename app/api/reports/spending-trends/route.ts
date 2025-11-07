import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'

export const dynamic = 'force-dynamic'

/**
 * GET /api/reports/spending-trends
 * Spending trends over time (daily, weekly, monthly)
 */
export const GET = createHandler({
  permission: 'report:read',
  rateLimit: 'heavy', // 10 requests per minute - reports are database-intensive
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'monthly' // daily, weekly, monthly, yearly
    const months = parseInt(searchParams.get('months') || '12')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const where = withCompanyScope(session, {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: { in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED'] },
    })

    // Get all requests in date range
    const requests = await prisma.purchaseRequest.findMany({
      where,
      select: {
        id: true,
        estimatedTotal: true,
        status: true,
        createdAt: true,
        purchaseCategoryId: true,
        departmentId: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group by period
    const trends: Record<string, {
      period: string
      count: number
      total: number
      approved: number
      pending: number
      avgValue: number
    }> = {}

    requests.forEach((req) => {
      let periodKey: string

      if (period === 'daily') {
        periodKey = req.createdAt.toISOString().split('T')[0]
      } else if (period === 'weekly') {
        const weekStart = new Date(req.createdAt)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        periodKey = weekStart.toISOString().split('T')[0]
      } else if (period === 'monthly') {
        periodKey = `${req.createdAt.getFullYear()}-${String(req.createdAt.getMonth() + 1).padStart(2, '0')}`
      } else {
        // yearly
        periodKey = req.createdAt.getFullYear().toString()
      }

      if (!trends[periodKey]) {
        trends[periodKey] = {
          period: periodKey,
          count: 0,
          total: 0,
          approved: 0,
          pending: 0,
          avgValue: 0,
        }
      }

      const value = req.estimatedTotal?.toNumber() || 0
      trends[periodKey].count++
      trends[periodKey].total += value

      if (req.status === 'APPROVED') {
        trends[periodKey].approved += value
      } else if (['SUBMITTED', 'IN_REVIEW'].includes(req.status)) {
        trends[periodKey].pending += value
      }
    })

    // Calculate averages
    Object.values(trends).forEach((trend) => {
      trend.avgValue = trend.count > 0 ? trend.total / trend.count : 0
    })

    // Sort by period
    const sortedTrends = Object.values(trends).sort((a, b) =>
      a.period.localeCompare(b.period)
    )

    // Calculate summary statistics
    const totalSpending = sortedTrends.reduce((sum, t) => sum + t.total, 0)
    const totalRequests = sortedTrends.reduce((sum, t) => sum + t.count, 0)
    const avgPerPeriod = sortedTrends.length > 0 ? totalSpending / sortedTrends.length : 0

    // Calculate growth rate (comparing first and last period)
    const firstPeriod = sortedTrends[0]
    const lastPeriod = sortedTrends[sortedTrends.length - 1]
    const growthRate = firstPeriod && lastPeriod && firstPeriod.total > 0
      ? ((lastPeriod.total - firstPeriod.total) / firstPeriod.total) * 100
      : 0

    return ApiResponse.success({
      period,
      startDate,
      endDate,
      summary: {
        totalSpending,
        totalRequests,
        avgPerPeriod,
        avgPerRequest: totalRequests > 0 ? totalSpending / totalRequests : 0,
        growthRate: growthRate.toFixed(2),
        periodsAnalyzed: sortedTrends.length,
      },
      trends: sortedTrends,
    })
  },
})
