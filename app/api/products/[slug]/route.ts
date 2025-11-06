import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Product fetch error')
    return NextResponse.json(
      { success: false, error: 'Ürün yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const user = getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has permission
    const allowedRoles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROCUREMENT_MANAGER']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const product = await prisma.product.update({
      where: { slug: params.slug },
      data: body,
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Ürün güncellendi',
    })
  } catch (error) {
    console.error('Product update error')
    return NextResponse.json(
      { success: false, error: 'Ürün güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const user = getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has permission
    const allowedRoles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROCUREMENT_MANAGER']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    await prisma.product.delete({
      where: { slug: params.slug },
    })

    return NextResponse.json({
      success: true,
      message: 'Ürün silindi',
    })
  } catch (error) {
    console.error('Product delete error')
    return NextResponse.json(
      { success: false, error: 'Ürün silinemedi' },
      { status: 500 }
    )
  }
}
