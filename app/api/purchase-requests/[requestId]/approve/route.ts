import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
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
    const { action, comments } = body // action: APPROVED, REJECTED, RETURNED

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: params.requestId },
      include: {
        workflow: {
          include: {
            steps: {
              orderBy: {
                stepOrder: 'asc'
              }
            }
          }
        },
        approvalActions: true
      }
    })

    if (!purchaseRequest) {
      return NextResponse.json(
        { success: false, error: 'Talep bulunamadı' },
        { status: 404 }
      )
    }

    if (!purchaseRequest.workflow) {
      return NextResponse.json(
        { success: false, error: 'Onay süreci tanımlı değil' },
        { status: 400 }
      )
    }

    // Get current step
    const currentStep = purchaseRequest.workflow.steps[purchaseRequest.currentStep]

    if (!currentStep) {
      return NextResponse.json(
        { success: false, error: 'Geçerli onay adımı bulunamadı' },
        { status: 400 }
      )
    }

    // Check if user can approve
    const canApprove =
      (currentStep.approverRole && decoded.role === currentStep.approverRole) ||
      (currentStep.approverId && decoded.userId === currentStep.approverId) ||
      decoded.role === 'ADMIN' ||
      decoded.role === 'GENERAL_MANAGER'

    if (!canApprove) {
      return NextResponse.json(
        { success: false, error: 'Bu adımı onaylama yetkiniz yok' },
        { status: 403 }
      )
    }

    // Create approval action
    await prisma.approvalAction.create({
      data: {
        requestId: params.requestId,
        stepOrder: purchaseRequest.currentStep,
        approverId: decoded.userId,
        action,
        comments
      }
    })

    let newStatus = purchaseRequest.status
    let newCurrentStep = purchaseRequest.currentStep

    if (action === 'APPROVED') {
      // Move to next step
      if (purchaseRequest.currentStep + 1 < purchaseRequest.workflow.steps.length) {
        newCurrentStep = purchaseRequest.currentStep + 1
        newStatus = 'IN_REVIEW'
      } else {
        // All steps approved
        newStatus = 'APPROVED'
      }
    } else if (action === 'REJECTED') {
      newStatus = 'REJECTED'
    } else if (action === 'RETURNED') {
      // Return to requester for revision
      newStatus = 'DRAFT'
      newCurrentStep = 0
    }

    const updated = await prisma.purchaseRequest.update({
      where: { id: params.requestId },
      data: {
        status: newStatus,
        currentStep: newCurrentStep
      },
      include: {
        items: true,
        approvalActions: {
          include: {
            approver: {
              select: {
                name: true,
                role: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: action === 'APPROVED' ? 'Talep onaylandı' :
               action === 'REJECTED' ? 'Talep reddedildi' :
               'Talep geri gönderildi'
    })
  } catch (error) {
    console.error('Approval action error:', error)
    return NextResponse.json(
      { success: false, error: 'Onay işlemi başarısız' },
      { status: 500 }
    )
  }
}
