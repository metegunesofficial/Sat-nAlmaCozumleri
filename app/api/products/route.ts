import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

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

    // Build where clause
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
    const orderBy: any = {}
    orderBy[sort] = order

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
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Ürünler yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, companyId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.sku || body.price === undefined) {
      return NextResponse.json(
        { error: 'Name, SKU and price are required' },
        { status: 400 }
      )
    }

    // Create product with companyId
    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        slug: body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description || null,
        price: parseFloat(body.price),
        stock: parseInt(body.stock) || 0,
        categoryId: body.categoryId || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        companyId: user.companyId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Ürün oluşturuldu',
    })
  } catch (error: any) {
    console.error('Product create error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}
