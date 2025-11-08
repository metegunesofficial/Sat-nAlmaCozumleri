import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
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

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    // Check if user owns this order or is admin
    if (order.userId !== decoded.userId && !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Sipariş yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
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

    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: body,
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Sipariş güncellendi',
    })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { success: false, error: 'Sipariş güncellenemedi' },
      { status: 500 }
    )
  }
}
