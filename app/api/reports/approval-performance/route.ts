import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter = startDate && endDate ? {
      actionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {}

    // Approver performance
    const approverActions = await prisma.approvalAction.groupBy({
      by: ['approverId', 'action'],
      where: dateFilter,
      _count: true
    })

    const approverIds = [...new Set(approverActions.map((a: any) => a.approverId))]
    const approvers = await prisma.user.findMany({
      where: {
        id: { in: approverIds }
      },
      select: {
        id: true,
        name: true,
        role: true,
        position: true,
        department: {
          select: {
            name: true
          }
        }
      }
    })

    const approverMap = new Map(approvers.map((a: any) => [a.id, a]))

    // Group by approver
    const performanceByApprover = approverIds.map((approverId: any) => {
      const actions = approverActions.filter((a: any) => a.approverId === approverId)
      const approved = actions.find((a: any) => a.action === 'APPROVED')?._count || 0
      const rejected = actions.find((a: any) => a.action === 'REJECTED')?._count || 0
      const returned = actions.find((a: any) => a.action === 'RETURNED')?._count || 0
      const total = approved + rejected + returned

      return {
        approver: approverMap.get(approverId),
        totalActions: total,
        approved,
        rejected,
        returned,
        approvalRate: total > 0 ? (approved / total) * 100 : 0
      }
    })

    // Average response time by approver
    const avgResponseTimes = await prisma.$queryRaw`
      SELECT
        aa."approverId",
        AVG(EXTRACT(EPOCH FROM (aa."actionDate" - pr."createdAt")) / 3600) as avg_hours
      FROM "ApprovalAction" aa
      JOIN "PurchaseRequest" pr ON aa."requestId" = pr.id
      ${startDate && endDate ? prisma.$queryRawUnsafe('WHERE aa."actionDate" BETWEEN $1 AND $2', new Date(startDate), new Date(endDate)) : prisma.$queryRaw``}
      GROUP BY aa."approverId"
    ` as any[]

    const responseTimeMap = new Map(avgResponseTimes.map((rt: any) => [rt.approverId, Number(rt.avg_hours)]))

    const performanceWithResponseTime = performanceByApprover.map((perf: any) => ({
      ...perf,
      avgResponseTimeHours: responseTimeMap.get(perf.approver?.id || '') || 0
    }))

    // Bottleneck analysis (requests stuck at certain steps)
    const requestsByStep = await prisma.purchaseRequest.groupBy({
      by: ['currentStep', 'status'],
      where: {
        status: { in: ['SUBMITTED', 'IN_REVIEW'] }
      },
      _count: true
    })

    return NextResponse.json({
      success: true,
      data: {
        approverPerformance: performanceWithResponseTime,
        requestsByStep,
        summary: {
          totalApprovers: approverIds.length,
          avgApprovalRate: performanceByApprover.reduce((sum: number, p: any) => sum + p.approvalRate, 0) / performanceByApprover.length,
          avgResponseTime: avgResponseTimes.reduce((sum: number, rt: any) => sum + Number(rt.avg_hours), 0) / avgResponseTimes.length
        }
      }
    })
  } catch (error) {
    console.error('Approval performance report error:')
    return NextResponse.json(
      { success: false, error: 'Onay performans raporu yüklenemedi' },
      { status: 500 }
    )
  }
}
