import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
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

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: params.requestId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true
          }
        },
        department: true,
        items: {
          include: {
            product: true
          }
        },
        workflow: {
          include: {
            steps: {
              orderBy: {
                stepOrder: 'asc'
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
                role: true,
                position: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        order: true
      }
    })

    if (!purchaseRequest) {
      return NextResponse.json(
        { success: false, error: 'Talep bulunamadı' },
        { status: 404 }
      )
    }

    // Check permissions
    const canView =
      decoded.role === 'ADMIN' ||
      decoded.role === 'FINANCE_MANAGER' ||
      decoded.role === 'GENERAL_MANAGER' ||
      purchaseRequest.requesterId === decoded.userId

    if (!canView) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: purchaseRequest
    })
  } catch (error) {
    console.error('Purchase request fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Talep yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: params.requestId }
    })

    if (!purchaseRequest) {
      return NextResponse.json(
        { success: false, error: 'Talep bulunamadı' },
        { status: 404 }
      )
    }

    // Only requester can update DRAFT status
    if (purchaseRequest.status === 'DRAFT' && purchaseRequest.requesterId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const updated = await prisma.purchaseRequest.update({
      where: { id: params.requestId },
      data: body,
      include: {
        items: true,
        approvalActions: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Talep güncellendi'
    })
  } catch (error) {
    console.error('Purchase request update error:', error)
    return NextResponse.json(
      { success: false, error: 'Talep güncellenemedi' },
      { status: 500 }
    )
  }
}
