import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering to skip static optimization during build
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

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { companyId: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const companyId = user.companyId

    // Get total requests count for the company
    const totalRequests = await prisma.purchaseRequest.count({
      where: { companyId }
    })

    // Get pending approvals count (SUBMITTED or IN_REVIEW status)
    const pendingApprovals = await prisma.purchaseRequest.count({
      where: {
        companyId,
        status: {
          in: ['SUBMITTED', 'IN_REVIEW']
        }
      }
    })

    // Get budget used from company budgets
    const currentYear = new Date().getFullYear()
    const budgets = await prisma.companyBudget.findMany({
      where: {
        companyId,
        year: currentYear
      },
      select: {
        spent: true
      }
    })

    const budgetUsed = budgets.reduce((total, budget) => {
      return total + Number(budget.spent)
    }, 0)

    // Get recent requests for additional context
    const recentRequests = await prisma.purchaseRequest.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        requestNumber: true,
        title: true,
        status: true,
        estimatedTotal: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalRequests,
        pendingApprovals,
        budgetUsed,
        recentRequests
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'İstatistikler yüklenemedi' },
      { status: 500 }
    )
  }
}
