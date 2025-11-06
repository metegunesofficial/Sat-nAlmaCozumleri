import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/workflows/[id] - Get single workflow
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const workflow = await prisma.approvalWorkflow.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      },
      include: {
        steps: {
          include: {
            approvers: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            purchaseRequests: true,
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'İş akışı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: workflow,
    })
  } catch (error) {
    console.error('Workflow fetch error:')
    return NextResponse.json(
      { success: false, error: 'İş akışı yüklenemedi' },
      { status: 500 }
    )
  }
}

// PUT /api/workflows/[id] - Update workflow
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN and SUPER_ADMIN can update workflows
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const workflow = await prisma.approvalWorkflow.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      },
      include: {
        steps: true,
      },
    })

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'İş akışı bulunamadı' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, minAmount, maxAmount, isActive, steps } = body

    // Check for overlapping workflows (excluding current one)
    if (minAmount !== undefined) {
      const overlapping = await prisma.approvalWorkflow.findFirst({
        where: {
          companyId: user.companyId,
          id: { not: params.id },
          isActive: true,
          OR: [
            {
              AND: [
                { minAmount: { lte: minAmount } },
                { maxAmount: maxAmount ? { gte: minAmount } : undefined },
              ],
            },
            {
              AND: [
                { minAmount: maxAmount ? { lte: maxAmount } : undefined },
                { maxAmount: maxAmount ? { gte: maxAmount } : undefined },
              ],
            },
          ],
        },
      })

      if (overlapping) {
        return NextResponse.json(
          { success: false, error: 'Bu tutar aralığı için zaten aktif bir iş akışı var' },
          { status: 409 }
        )
      }
    }

    // If steps are provided, update them
    if (steps && steps.length > 0) {
      // Delete existing steps
      await prisma.approvalStep.deleteMany({
        where: { workflowId: params.id },
      })

      // Create new steps
      await prisma.approvalStep.createMany({
        data: steps.map((step: any, index: number) => ({
          workflowId: params.id,
          name: step.name,
          description: step.description,
          order: index + 1,
          requiredApprovals: step.requiredApprovals || 1,
          action: step.action || 'APPROVE',
        })),
      })

      // Connect approvers to steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        if (step.approverIds && step.approverIds.length > 0) {
          const createdStep = await prisma.approvalStep.findFirst({
            where: {
              workflowId: params.id,
              order: i + 1,
            },
          })

          if (createdStep) {
            await prisma.approvalStep.update({
              where: { id: createdStep.id },
              data: {
                approvers: {
                  connect: step.approverIds.map((id: string) => ({ id })),
                },
              },
            })
          }
        }
      }
    }

    const updated = await prisma.approvalWorkflow.update({
      where: { id: params.id },
      data: {
        name,
        description,
        minAmount,
        maxAmount,
        isActive,
      },
      include: {
        steps: {
          include: {
            approvers: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'İş akışı başarıyla güncellendi',
    })
  } catch (error) {
    console.error('Workflow update error:')
    return NextResponse.json(
      { success: false, error: 'İş akışı güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/workflows/[id] - Delete workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN and SUPER_ADMIN can delete workflows
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const workflow = await prisma.approvalWorkflow.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      },
      include: {
        _count: {
          select: {
            purchaseRequests: true,
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'İş akışı bulunamadı' },
        { status: 404 }
      )
    }

    // Check if workflow has active purchase requests
    if (workflow._count.purchaseRequests > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu iş akışına ait aktif talepler var. İş akışı silinemez.',
        },
        { status: 400 }
      )
    }

    // Delete steps first (cascade should handle this, but being explicit)
    await prisma.approvalStep.deleteMany({
      where: { workflowId: params.id },
    })

    await prisma.approvalWorkflow.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'İş akışı başarıyla silindi',
    })
  } catch (error) {
    console.error('Workflow delete error:')
    return NextResponse.json(
      { success: false, error: 'İş akışı silinemedi' },
      { status: 500 }
    )
  }
}
