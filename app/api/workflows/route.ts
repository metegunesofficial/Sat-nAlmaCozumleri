import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/workflows - List all workflows
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
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN, SUPER_ADMIN, and managers can access workflows
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN', 'FINANCE_MANAGER', 'GENERAL_MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get('isActive')

    const where: any = {
      companyId: user.companyId,
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const workflows = await prisma.approvalWorkflow.findMany({
      where,
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
        _count: {
          select: {
            purchaseRequests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: workflows,
    })
  } catch (error) {
    console.error('Workflows fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'İş akışları yüklenemedi' },
      { status: 500 }
    )
  }
}

// POST /api/workflows - Create new workflow
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN and SUPER_ADMIN can create workflows
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, minAmount, maxAmount, isActive, steps } = body

    if (!name || minAmount === undefined) {
      return NextResponse.json(
        { success: false, error: 'İsim ve minimum tutar gereklidir' },
        { status: 400 }
      )
    }

    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { success: false, error: 'En az bir onay adımı gereklidir' },
        { status: 400 }
      )
    }

    // Check for overlapping workflows
    const overlapping = await prisma.approvalWorkflow.findFirst({
      where: {
        companyId: user.companyId,
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

    const workflow = await prisma.approvalWorkflow.create({
      data: {
        companyId: user.companyId,
        name,
        description,
        minAmount,
        maxAmount,
        departmentIds: body.departmentIds || [],
        isActive: isActive ?? true,
        steps: {
          create: steps.map((step: any, index: number) => ({
            stepName: step.stepName || step.name,
            stepOrder: index + 1,
            approverRole: step.approverRole || null,
            approverId: step.approverId || null,
            requiredAction: step.requiredAction || step.action || 'APPROVE',
            isOptional: step.isOptional || false,
            isParallel: step.isParallel || false,
          })),
        },
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'İş akışı başarıyla oluşturuldu',
    }, { status: 201 })
  } catch (error) {
    console.error('Workflow creation error:', error)
    return NextResponse.json(
      { success: false, error: 'İş akışı oluşturulamadı' },
      { status: 500 }
    )
  }
}
