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

    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

    // Get budgets
    const budgets = await prisma.budget.findMany({
      where: {
        companyId: user.companyId,
        year,
        ...(month && { month })
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
            manager: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Calculate spending by department
    const departmentSpending = await Promise.all(
      budgets.map(async (budget: any) => {
        // Get approved requests total
        const approvedRequests = await prisma.purchaseRequest.aggregate({
          where: {
            departmentId: budget.departmentId,
            status: { in: ['APPROVED', 'COMPLETED'] },
            createdAt: {
              gte: new Date(year, month ? month - 1 : 0, 1),
              lt: new Date(year, month ? month : 12, 0, 23, 59, 59)
            }
          },
          _sum: {
            estimatedTotal: true
          }
        })

        const spent = Number(approvedRequests._sum.estimatedTotal || 0)
        const budgetAmount = Number(budget.amount)
        const reserved = Number(budget.reserved)
        const available = budgetAmount - spent - reserved
        const utilization = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0

        return {
          budget: {
            id: budget.id,
            year: budget.year,
            month: budget.month,
            amount: budgetAmount
          },
          department: budget.department,
          spent,
          reserved,
          available,
          utilization,
          status: utilization > 90 ? 'critical' : utilization > 75 ? 'warning' : 'normal'
        }
      })
    )

    // Overall summary
    const totalBudget = budgets.reduce((sum: number, b: any) => sum + Number(b.amount), 0)
    const totalSpent = departmentSpending.reduce((sum: number, d: any) => sum + d.spent, 0)
    const totalReserved = departmentSpending.reduce((sum: number, d: any) => sum + d.reserved, 0)
    const totalAvailable = totalBudget - totalSpent - totalReserved

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalBudget,
          totalSpent,
          totalReserved,
          totalAvailable,
          utilizationPercent: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
        },
        byDepartment: departmentSpending
      }
    })
  } catch (error) {
    console.error('Budget report error:', error)
    return NextResponse.json(
      { success: false, error: 'Bütçe raporu yüklenemedi' },
      { status: 500 }
    )
  }
}
