import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { authorizeResource } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export const POST = createHandler({
  permission: 'request:approve',
  auditAction: 'request.approve',
  handler: async (request, session, context: any) => {
    const requestId = context.params.requestId
    const body = await request.json()
    const { action, comments } = body

    // Validation
    if (!action || !['APPROVED', 'REJECTED', 'RETURNED'].includes(action)) {
      return ApiResponse.badRequest('Invalid action. Must be APPROVED, REJECTED, or RETURNED')
    }

    // Get the purchase request
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
      include: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!purchaseRequest) {
      return ApiResponse.notFound('Purchase Request')
    }

    // Verify company scope
    try {
      await authorizeResource(session, 'request:approve', purchaseRequest)
    } catch (error: any) {
      return ApiResponse.forbidden(error.message)
    }

    // Check if request is in a state that can be approved
    if (!['SUBMITTED', 'IN_REVIEW'].includes(purchaseRequest.status)) {
      return ApiResponse.badRequest('Request cannot be approved in its current state')
    }

    // Check if workflow exists
    if (!purchaseRequest.workflow) {
      return ApiResponse.badRequest('No approval workflow assigned')
    }

    const currentStep = purchaseRequest.workflow.steps.find(
      (s) => s.stepOrder === purchaseRequest.currentStep
    )

    if (!currentStep) {
      return ApiResponse.badRequest('Invalid workflow step')
    }

    // Verify user can approve this step
    const canApprove =
      currentStep.approverRole === session.user.role ||
      ['SUPER_ADMIN', 'COMPANY_ADMIN'].includes(session.user.role)

    if (!canApprove) {
      return ApiResponse.forbidden('You are not authorized to approve at this step')
    }

    // Create approval action
    await prisma.approvalAction.create({
      data: {
        requestId: purchaseRequest.id,
        stepOrder: purchaseRequest.currentStep,
        approverId: session.user.id,
        action: action as any,
        comments: comments || null,
      },
    })

    // Determine new status and step
    let newStatus = purchaseRequest.status
    let newStep = purchaseRequest.currentStep

    if (action === 'APPROVED') {
      // Check if this is the last step
      const isLastStep = purchaseRequest.currentStep >= purchaseRequest.workflow.steps.length - 1

      if (isLastStep) {
        newStatus = 'APPROVED'
      } else {
        newStatus = 'IN_REVIEW'
        newStep = purchaseRequest.currentStep + 1
      }
    } else if (action === 'REJECTED') {
      newStatus = 'REJECTED'
    } else if (action === 'RETURNED') {
      newStatus = 'SUBMITTED'
      newStep = 0
    }

    // Update purchase request
    const updatedRequest = await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus as any,
        currentStep: newStep,
      },
      include: {
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
          },
        },
        workflow: {
          include: {
            steps: true,
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
    })

    // Log audit
    await audit.log({
      action: action === 'APPROVED' ? 'request.approve' : action === 'REJECTED' ? 'request.reject' : 'request.return',
      resource: `PurchaseRequest:${updatedRequest.id}`,
      metadata: {
        requestNumber: updatedRequest.requestNumber,
        action,
        comments,
        stepOrder: purchaseRequest.currentStep,
        newStatus,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.success(updatedRequest)
  },
})
