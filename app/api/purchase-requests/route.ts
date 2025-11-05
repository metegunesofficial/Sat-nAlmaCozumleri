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

    // Fetch user to get companyId for company-scoped queries
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { managedDepartments: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const departmentId = searchParams.get('departmentId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Calculate pagination
    const skip = (page - 1) * limit

    const where: any = {
      companyId: user.companyId, // Company-scoped filtering
    }

    // Role-based filtering
    if (user.role === 'EMPLOYEE') {
      where.requesterId = decoded.userId
    } else if (user.role === 'DEPARTMENT_MANAGER') {
      // Get user's managed departments
      const deptIds = user.managedDepartments.map((d: any) => d.id) || []
      where.departmentId = { in: deptIds }
    }
    // COMPANY_ADMIN, FINANCE_MANAGER, GENERAL_MANAGER, PROCUREMENT_MANAGER see all in company

    // Additional filters
    if (status) {
      where.status = status
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    // Get total count for pagination
    const total = await prisma.purchaseRequest.count({ where })

    // Fetch paginated requests
    const requests = await prisma.purchaseRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        approvalActions: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Calculate total pages
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    })
  } catch (error) {
    console.error('Purchase requests fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Talepler yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Fetch user to get companyId for company-scoped operations
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { title, description, priority, items, requiredDate, departmentId } = body

    // Calculate estimated total
    const estimatedTotal = items.reduce((sum: number, item: any) => {
      return sum + (item.unitPrice * item.quantity)
    }, 0)

    // Generate request number (company-scoped)
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const count = await prisma.purchaseRequest.count({
      where: { companyId: user.companyId }
    }) + 1
    const requestNumber = `PR${year}${month}${String(count).padStart(4, '0')}`

    // Find appropriate workflow (company-scoped)
    const workflow = await prisma.approvalWorkflow.findFirst({
      where: {
        companyId: user.companyId,
        isActive: true,
        OR: [
          {
            AND: [
              { minAmount: { lte: estimatedTotal } },
              { maxAmount: { gte: estimatedTotal } }
            ]
          },
          {
            minAmount: { lte: estimatedTotal },
            maxAmount: null
          }
        ],
        departmentIds: {
          has: departmentId || user.departmentId
        }
      },
      include: {
        steps: {
          orderBy: {
            stepOrder: 'asc'
          }
        }
      }
    })

    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        companyId: user.companyId, // Explicitly set companyId
        requestNumber,
        requesterId: decoded.userId,
        departmentId: departmentId || user.departmentId,
        title,
        description,
        priority: priority || 'NORMAL',
        status: 'SUBMITTED',
        estimatedTotal,
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        workflowId: workflow?.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes
          }))
        }
      },
      include: {
        items: true,
        workflow: {
          include: {
            steps: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: purchaseRequest,
      message: 'Satın alma talebi oluşturuldu'
    })
  } catch (error) {
    console.error('Purchase request create error:', error)
    return NextResponse.json(
      { success: false, error: 'Talep oluşturulamadı' },
      { status: 500 }
    )
  }
}
