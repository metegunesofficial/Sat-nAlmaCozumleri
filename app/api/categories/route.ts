import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export const GET = createHandler({
  permission: 'category:read',
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const includeProducts = searchParams.get('includeProducts') === 'true'

    const where = withCompanyScope(session, {
      isActive: true,
      parentId: null, // Only get root categories
    })

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        _count: includeProducts ? { select: { products: true } } : undefined,
      },
      orderBy: { order: 'asc' },
    })

    return ApiResponse.success(categories)
  },
})

export const POST = createHandler({
  permission: 'category:create',
  auditAction: 'category.create',
  handler: async (request, session) => {
    const body = await request.json()

    // Validation
    if (!body.name || !body.slug) {
      return ApiResponse.badRequest('Name and slug are required')
    }

    // Check if category with same slug exists in company
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: body.slug,
        companyId: session.user.companyId,
      },
    })

    if (existingCategory) {
      return ApiResponse.badRequest('Category with this slug already exists')
    }

    const category = await prisma.category.create({
      data: {
        ...body,
        companyId: session.user.companyId,
      },
      include: {
        children: true,
      },
    })

    await audit.log({
      action: 'category.create',
      resource: `Category:${category.id}`,
      metadata: {
        name: category.name,
        slug: category.slug,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.created(category)
  },
})
