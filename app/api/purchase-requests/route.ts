import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export const GET = createHandler({
  permission: 'request:read',
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const departmentId = searchParams.get('departmentId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = withCompanyScope(session, {})

    // Role-based filtering
    if (session.user.role === 'EMPLOYEE') {
      // Employees only see their own requests
      where.requesterId = session.user.id
    } else if (session.user.role === 'DEPARTMENT_MANAGER' && session.user.departmentId) {
      // Department managers see their department's requests
      where.departmentId = session.user.departmentId
    }
    // Admins and other managers see all company requests

    if (status) {
      where.status = status as any
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    const [requests, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          purchaseCategory: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
          approvalActions: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.purchaseRequest.count({ where }),
    ])

    return ApiResponse.success(requests, { total, limit, offset })
  },
})

export const POST = createHandler({
  permission: 'request:create',
  auditAction: 'request.create',
  handler: async (request, session) => {
    const body = await request.json()
    const {
      title,
      description,
      priority,
      items,
      requiredDate,
      departmentId,
      purchaseCategoryId,
    } = body

    // Validation
    if (!title || !items || items.length === 0) {
      return ApiResponse.badRequest('Title and items are required')
    }

    if (!departmentId && !session.user.departmentId) {
      return ApiResponse.badRequest('Department is required')
    }

    // Calculate estimated total
    const estimatedTotal = items.reduce((sum: number, item: any) => {
      return sum + item.unitPrice * item.quantity
    }, 0)

    // Generate unique request number
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const count = await prisma.purchaseRequest.count({
      where: { companyId: session.user.companyId },
    })
    const requestNumber = `PR${year}${month}${String(count + 1).padStart(4, '0')}`

    // Find appropriate workflow based on amount
    const targetDeptId = departmentId || session.user.departmentId
    const workflow = await prisma.approvalWorkflow.findFirst({
      where: {
        companyId: session.user.companyId,
        isActive: true,
        OR: [
          {
            AND: [
              { minAmount: { lte: estimatedTotal } },
              { maxAmount: { gte: estimatedTotal } },
            ],
          },
          {
            AND: [
              { minAmount: { lte: estimatedTotal } },
              { maxAmount: null },
            ],
          },
        ],
        departmentIds: {
          has: targetDeptId,
        },
      },
      include: {
        steps: {
          orderBy: {
            stepOrder: 'asc',
          },
        },
      },
    })

    // Create purchase request
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        companyId: session.user.companyId,
        requestNumber,
        requesterId: session.user.id,
        departmentId: targetDeptId,
        purchaseCategoryId: purchaseCategoryId || null,
        title,
        description,
        priority: priority || 'NORMAL',
        status: 'SUBMITTED',
        estimatedTotal,
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        workflowId: workflow?.id,
        currentStep: 0,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || null,
            productName: item.productName,
            productSku: item.productSku || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        items: true,
        workflow: {
          include: {
            steps: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // Log audit
    await audit.log({
      action: 'request.create',
      resource: `PurchaseRequest:${purchaseRequest.id}`,
      metadata: {
        requestNumber: purchaseRequest.requestNumber,
        title: purchaseRequest.title,
        estimatedTotal: purchaseRequest.estimatedTotal.toString(),
        itemCount: items.length,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.created(purchaseRequest)
  },
})
