import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { authorizeResource } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export const GET = createHandler({
  permission: 'request:read',
  handler: async (request, session, context: any) => {
    const requestId = context.params.requestId

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
          },
        },
        department: true,
        purchaseCategory: true,
        items: {
          include: {
            product: true,
          },
        },
        workflow: {
          include: {
            steps: {
              orderBy: {
                stepOrder: 'asc',
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
                position: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        order: true,
      },
    })

    if (!purchaseRequest) {
      return ApiResponse.notFound('Purchase Request')
    }

    // Verify company scope and permissions
    try {
      await authorizeResource(session, 'request:read', purchaseRequest, {
        requireOwnership: session.user.role === 'EMPLOYEE',
      })
    } catch (error: any) {
      return ApiResponse.forbidden(error.message)
    }

    return ApiResponse.success(purchaseRequest)
  },
})

export const PUT = createHandler({
  permission: 'request:update',
  auditAction: 'request.update',
  handler: async (request, session, context: any) => {
    const requestId = context.params.requestId
    const body = await request.json()

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    })

    if (!purchaseRequest) {
      return ApiResponse.notFound('Purchase Request')
    }

    // Verify authorization
    try {
      await authorizeResource(session, 'request:update', purchaseRequest, {
        requireOwnership: purchaseRequest.status === 'DRAFT',
      })
    } catch (error: any) {
      return ApiResponse.forbidden(error.message)
    }

    // Only DRAFT requests can be updated by requester
    if (purchaseRequest.status !== 'DRAFT' && session.user.role === 'EMPLOYEE') {
      return ApiResponse.badRequest('Only draft requests can be updated')
    }

    const updated = await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        requiredDate: body.requiredDate ? new Date(body.requiredDate) : null,
      },
      include: {
        items: true,
        approvalActions: true,
      },
    })

    await audit.log({
      action: 'request.update',
      resource: `PurchaseRequest:${updated.id}`,
      metadata: {
        requestNumber: updated.requestNumber,
        changes: body,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.success(updated)
  },
})

export const DELETE = createHandler({
  permission: 'request:delete',
  auditAction: 'request.delete',
  handler: async (request, session, context: any) => {
    const requestId = context.params.requestId

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    })

    if (!purchaseRequest) {
      return ApiResponse.notFound('Purchase Request')
    }

    // Verify authorization
    try {
      await authorizeResource(session, 'request:delete', purchaseRequest, {
        requireOwnership: true,
      })
    } catch (error: any) {
      return ApiResponse.forbidden(error.message)
    }

    // Only DRAFT requests can be deleted
    if (purchaseRequest.status !== 'DRAFT') {
      return ApiResponse.badRequest('Only draft requests can be deleted')
    }

    await prisma.purchaseRequest.delete({
      where: { id: requestId },
    })

    await audit.log({
      action: 'request.delete',
      resource: `PurchaseRequest:${requestId}`,
      metadata: {
        requestNumber: purchaseRequest.requestNumber,
        title: purchaseRequest.title,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.noContent()
  },
})
