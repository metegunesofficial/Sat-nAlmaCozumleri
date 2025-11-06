import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
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

    // Get user's companyId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { companyId: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: decoded.userId,
        product: {
          companyId: user.companyId
        }
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: cartItems,
    })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Sepet yüklenemedi' },
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

    // Get user's companyId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { companyId: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { productId, quantity } = body

    // Verify product belongs to user's company
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        companyId: user.companyId
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: decoded.userId,
          productId,
        },
      },
    })

    let cartItem
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: decoded.userId,
          productId,
          quantity,
        },
        include: { product: true },
      })
    }

    return NextResponse.json({
      success: true,
      data: cartItem,
      message: 'Ürün sepete eklendi',
    })
  } catch (error) {
    console.error('Cart add error:', error)
    return NextResponse.json(
      { success: false, error: 'Ürün sepete eklenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    await prisma.cartItem.deleteMany({
      where: { userId: decoded.userId },
    })

    return NextResponse.json({
      success: true,
      message: 'Sepet temizlendi',
    })
  } catch (error) {
    console.error('Cart clear error:', error)
    return NextResponse.json(
      { success: false, error: 'Sepet temizlenemedi' },
      { status: 500 }
    )
  }
}
