import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export const GET = createHandler({
  permission: 'product:read',
  handler: async (request, session) => {
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

    const where = withCompanyScope(session, { isActive: true })

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

    const orderBy: any = {}
    orderBy[sort] = order

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
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return ApiResponse.success(products, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  },
})

export const POST = createHandler({
  permission: 'product:create',
  auditAction: 'product.create',
  handler: async (request, session) => {
    const body = await request.json()

    // Validation
    if (!body.name || !body.sku || !body.categoryId || !body.price) {
      return ApiResponse.badRequest('Name, SKU, category, and price are required')
    }

    const product = await prisma.product.create({
      data: {
        ...body,
        companyId: session.user.companyId,
        images: body.images || [],
        tags: body.tags || [],
      },
      include: {
        category: true,
        supplier: true,
      },
    })

    await audit.log({
      action: 'product.create',
      resource: `Product:${product.id}`,
      metadata: {
        name: product.name,
        sku: product.sku,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.created(product)
  },
})
