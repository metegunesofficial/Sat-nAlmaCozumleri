import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Optional auth - public products endpoint
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let companyId: string | undefined

    // If token provided, extract companyId for tenant filtering
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { companyId: true }
        })
        companyId = user?.companyId
      }
    }

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

    // Build where clause with company isolation
    const where: any = { isActive: true }

    // CRITICAL: Filter by company if user is authenticated
    if (companyId) {
      where.companyId = companyId
    }

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
    // Authentication required
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

    // Get user with company info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, companyId: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Authorization: Only admin roles can create products
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // CRITICAL: Always set companyId to user's company
    const product = await prisma.product.create({
      data: {
        ...body,
        companyId: user.companyId, // Enforce company isolation
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
  } catch (error) {
    console.error('Product create error:', error)
    return NextResponse.json(
      { success: false, error: 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}
