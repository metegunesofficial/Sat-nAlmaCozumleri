import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
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
    const { quantity } = body

    const cartItem = await prisma.cartItem.update({
      where: { id: params.itemId, userId: decoded.userId },
      data: { quantity },
      include: { product: true },
    })

    return NextResponse.json({
      success: true,
      data: cartItem,
      message: 'Sepet güncellendi',
    })
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json(
      { success: false, error: 'Sepet güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
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

    await prisma.cartItem.delete({
      where: { id: params.itemId, userId: decoded.userId },
    })

    return NextResponse.json({
      success: true,
      message: 'Ürün sepetten kaldırıldı',
    })
  } catch (error) {
    console.error('Cart item delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Ürün sepetten kaldırılamadı' },
      { status: 500 }
    )
  }
}
