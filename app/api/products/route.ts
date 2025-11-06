import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const featured = searchParams.get('featured') === 'true'
    const isNew = searchParams.get('new') === 'true'

    const skip = (page - 1) * limit

    // Build where clause with proper typing
    const where: any = { isActive: true }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (featured) {
      where.isFeatured = true
    }

    if (isNew) {
      where.isNew = true
    }

    // Build orderBy
    const orderBy: any = {
      [sort]: order,
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Products fetch error')
    return NextResponse.json(
      { success: false, error: 'Ürünler yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has permission (admin or procurement manager)
    const allowedRoles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROCUREMENT_MANAGER']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const product = await prisma.product.create({
      data: body,
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Ürün oluşturuldu',
    })
  } catch (error) {
    console.error('Product create error')
    return NextResponse.json(
      { success: false, error: 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}
