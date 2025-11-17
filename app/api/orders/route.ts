import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'

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

    const where: any = {}

    // Admin can see all orders
    if (decoded.role !== 'ADMIN') {
      where.userId = decoded.userId
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Siparişler yüklenemedi' },
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

    const body = await request.json()

    // Get user to access companyId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, companyId: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: decoded.userId },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sepetiniz boş' },
        { status: 400 }
      )
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = cartItems.map((item: any) => {
      const price = Number(item.product.discountPrice || item.product.price)
      const total = price * item.quantity
      subtotal += total

      return {
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        price,
        total,
      }
    })

    const shippingCost = body.shippingCost || 0
    const tax = subtotal * 0.18 // 18% KDV
    const total = subtotal + shippingCost + tax

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        companyId: user.companyId,
        userId: decoded.userId,
        billingName: body.billingName,
        billingEmail: body.billingEmail,
        billingPhone: body.billingPhone,
        billingAddress: body.billingAddress,
        billingCity: body.billingCity,
        billingDistrict: body.billingDistrict,
        billingPostal: body.billingPostal,
        shippingName: body.shippingName || body.billingName,
        shippingPhone: body.shippingPhone || body.billingPhone,
        shippingAddress: body.shippingAddress || body.billingAddress,
        shippingCity: body.shippingCity || body.billingCity,
        shippingDistrict: body.shippingDistrict || body.billingDistrict,
        shippingPostal: body.shippingPostal || body.billingPostal,
        subtotal,
        shippingCost,
        tax,
        discount: 0,
        total,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: decoded.userId },
    })

    // Update stock and sales count
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          salesCount: { increment: item.quantity },
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Sipariş oluşturuldu',
    })
  } catch (error) {
    console.error('Order create error:', error)
    return NextResponse.json(
      { success: false, error: 'Sipariş oluşturulamadı' },
      { status: 500 }
    )
  }
}
