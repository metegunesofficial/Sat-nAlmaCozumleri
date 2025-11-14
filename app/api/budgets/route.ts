import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, RoleGroups } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

// GET /api/budgets - List budgets
export async function GET(request: NextRequest) {
  try {
    const user = await withAuth(request, [...RoleGroups.ADMIN, 'FINANCE_MANAGER'])

    const searchParams = request.nextUrl.searchParams
    const departmentId = searchParams.get('departmentId')
    const year = searchParams.get('year')

    const where: any = {}

    // Build filters
    if (departmentId) {
      where.departmentId = departmentId
      // Verify department belongs to user's company
      const dept = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { companyId: true }
      })
      if (!dept || dept.companyId !== user.companyId) {
        return NextResponse.json(
          { success: false, error: 'Departman bulunamadı' },
          { status: 404 }
        )
      }
    } else {
      // Get all budgets for departments in user's company
      const depts = await prisma.department.findMany({
        where: { companyId: user.companyId },
        select: { id: true }
      })
      where.departmentId = { in: depts.map(d => d.id) }
    }

    if (year) {
      where.year = parseInt(year)
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    return NextResponse.json({ success: true, data: budgets })
  } catch (error: any) {
    console.error('Budgets fetch error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Bütçeler yüklenemedi' },
      { status: 500 }
    )
  }
}

// POST /api/budgets - Create budget
export async function POST(request: NextRequest) {
  try {
    const user = await withAuth(request, [...RoleGroups.ADMIN, 'FINANCE_MANAGER'])

    const body = await request.json()
    const { departmentId, year, month, amount, notes } = body

    // Verify department
    const dept = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { companyId: true }
    })

    if (!dept || dept.companyId !== user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Departman bulunamadı' },
        { status: 404 }
      )
    }

    // Check for existing budget
    const existing = await prisma.budget.findUnique({
      where: {
        departmentId_year_month: { departmentId, year, month: month || 0 }
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu dönem için bütçe zaten tanımlı' },
        { status: 409 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        departmentId,
        year,
        month,
        amount,
        notes
      },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        }
      }
    })

    return NextResponse.json(
      { success: true, data: budget, message: 'Bütçe oluşturuldu' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Budget create error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Bütçe oluşturulamadı' },
      { status: 500 }
    )
  }
}
