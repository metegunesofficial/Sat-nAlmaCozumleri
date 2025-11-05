import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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
    const departmentId = searchParams.get('departmentId')

    const where: any = {}

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    // Total requests by status
    const requestsByStatus = await prisma.purchaseRequest.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: {
        estimatedTotal: true
      }
    })

    // Requests by department
    const requestsByDepartment = await prisma.purchaseRequest.groupBy({
      by: ['departmentId'],
      where,
      _count: true,
      _sum: {
        estimatedTotal: true
      }
    })

    // Get department names
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true
      }
    })

    const departmentMap = new Map(departments.map(d => [d.id, d]))

    const requestsByDeptWithNames = requestsByDepartment.map(item => ({
      department: departmentMap.get(item.departmentId),
      count: item._count,
      totalAmount: item._sum.estimatedTotal || 0
    }))

    // Requests by priority
    const requestsByPriority = await prisma.purchaseRequest.groupBy({
      by: ['priority'],
      where,
      _count: true
    })

    // Average approval time
    const approvedRequests = await prisma.purchaseRequest.findMany({
      where: {
        ...where,
        status: 'APPROVED'
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })

    const avgApprovalTime = approvedRequests.length > 0
      ? approvedRequests.reduce((sum, req) => {
          const diff = new Date(req.updatedAt).getTime() - new Date(req.createdAt).getTime()
          return sum + diff
        }, 0) / approvedRequests.length / (1000 * 60 * 60) // hours
      : 0

    // Top requested products
    const topProducts = await prisma.purchaseRequestItem.groupBy({
      by: ['productId'],
      where: {
        request: where
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc'
        }
      },
      take: 10
    })

    const productIds = topProducts.map(p => p.productId).filter(Boolean) as string[]
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        sku: true,
        images: true
      }
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    const topProductsWithDetails = topProducts
      .filter(p => p.productId)
      .map(item => ({
        product: productMap.get(item.productId!),
        totalQuantity: item._sum.quantity || 0,
        totalAmount: item._sum.totalPrice || 0
      }))

    return NextResponse.json({
      success: true,
      data: {
        byStatus: requestsByStatus,
        byDepartment: requestsByDeptWithNames,
        byPriority: requestsByPriority,
        avgApprovalTimeHours: avgApprovalTime,
        topProducts: topProductsWithDetails
      }
    })
  } catch (error) {
    console.error('Report fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Rapor yüklenemedi' },
      { status: 500 }
    )
  }
}
