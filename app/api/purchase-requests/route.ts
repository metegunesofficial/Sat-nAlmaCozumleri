import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { startWorkflow } from '@/lib/workflow-executor'

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

    // Get user to access companyId (multi-tenant filtering)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, companyId: true, role: true },
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

    const where: any = {
      companyId: user.companyId, // Multi-tenant: only show requests from user's company
    }

    // Role-based filtering
    if (user.role === 'EMPLOYEE') {
      where.requesterId = user.id
    } else if (user.role === 'DEPARTMENT_MANAGER') {
      // Get user's managed departments
      const deptIds = user.managedDepartments.map((d: any) => d.id) || []
      where.departmentId = { in: deptIds }
    }
    // COMPANY_ADMIN, SUPER_ADMIN, FINANCE_MANAGER, GENERAL_MANAGER see all company requests

    if (status) {
      where.status = status
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

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
      }
    })

    return NextResponse.json({
      success: true,
      data: requests
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

    const body = await request.json()
    const { title, description, priority, items, requiredDate, departmentId } = body

    // Get user to access companyId (required for multi-tenant)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, companyId: true, departmentId: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Calculate estimated total
    const estimatedTotal = items.reduce((sum: number, item: any) => {
      return sum + (item.unitPrice * item.quantity)
    }, 0)

    // Generate request number
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const count = await prisma.purchaseRequest.count() + 1
    const requestNumber = `PR${year}${month}${String(count).padStart(4, '0')}`

    // Find appropriate workflow
    const workflow = await prisma.approvalWorkflow.findFirst({
      where: {
        companyId: user.companyId, // Multi-tenant: only workflows from user's company
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
        requestNumber,
        company: {
          connect: { id: user.companyId },
        },
        requester: {
          connect: { id: user.id },
        },
        department: {
          connect: { id: departmentId || user.departmentId },
        },
        ...(workflow?.id && {
          workflow: {
            connect: { id: workflow.id },
          },
        }),
        title,
        description,
        priority: priority || 'NORMAL',
        status: 'SUBMITTED',
        estimatedTotal,
        requiredDate: requiredDate ? new Date(requiredDate) : null,
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

    // Start visual workflow if workflow is visual type
    if (workflow && workflow.isVisual) {
      const workflowResult = await startWorkflow(
        workflow.id,
        purchaseRequest.id,
        decoded.userId
      )

      if (!workflowResult.success) {
        console.error('Failed to start workflow:', workflowResult.error)
      }
    }

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
