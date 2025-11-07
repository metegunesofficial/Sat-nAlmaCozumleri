import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/purchase-categories
 * List purchase categories with hierarchy and budget info
 */
export const GET = createHandler({
  permission: 'category:read',
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const includeUsage = searchParams.get('includeUsage') === 'true' // Include budget usage

    const where = withCompanyScope(session, {
      isActive: true,
      parentId: null, // Only get root categories
    })

    const categories = await prisma.purchaseCategory.findMany({
      where,
      include: {
        children: includeChildren
          ? {
              where: { isActive: true },
              include: {
                purchaseRequests: includeUsage
                  ? {
                      where: {
                        createdAt: {
                          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // This month
                        },
                        status: {
                          in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED'],
                        },
                      },
                      select: {
                        estimatedTotal: true,
                      },
                    }
                  : false,
              },
            }
          : false,
        purchaseRequests: includeUsage
          ? {
              where: {
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
                status: {
                  in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED'],
                },
              },
              select: {
                estimatedTotal: true,
              },
            }
          : false,
      },
      orderBy: { code: 'asc' },
    })

    // Calculate budget usage if requested
    const categoriesWithUsage = includeUsage
      ? categories.map((category) => {
          const monthlyUsed =
            category.purchaseRequests?.reduce(
              (sum, req) => sum + (req.estimatedTotal?.toNumber() || 0),
              0
            ) || 0

          return {
            ...category,
            monthlyUsed,
            monthlyRemaining: category.monthlyLimit
              ? category.monthlyLimit.toNumber() - monthlyUsed
              : null,
            children: category.children?.map((child: any) => {
              const childMonthlyUsed =
                child.purchaseRequests?.reduce(
                  (sum: number, req: any) => sum + (req.estimatedTotal?.toNumber() || 0),
                  0
                ) || 0

              return {
                ...child,
                monthlyUsed: childMonthlyUsed,
                monthlyRemaining: child.monthlyLimit
                  ? child.monthlyLimit.toNumber() - childMonthlyUsed
                  : null,
              }
            }),
          }
        })
      : categories

    return ApiResponse.success(categoriesWithUsage)
  },
})

/**
 * POST /api/purchase-categories
 * Create a new purchase category (ADMIN only)
 */
export const POST = createHandler({
  permission: 'category:create',
  auditAction: 'purchase-category.create',
  handler: async (request, session) => {
    const body = await request.json()

    // Validation
    if (!body.name || !body.code) {
      return ApiResponse.badRequest('Name and code are required')
    }

    // Check if category with same code exists in company
    const existingCategory = await prisma.purchaseCategory.findFirst({
      where: {
        code: body.code,
        companyId: session.user.companyId,
      },
    })

    if (existingCategory) {
      return ApiResponse.badRequest('Purchase category with this code already exists')
    }

    const category = await prisma.purchaseCategory.create({
      data: {
        companyId: session.user.companyId,
        name: body.name,
        code: body.code,
        description: body.description,
        parentId: body.parentId || null,
        monthlyLimit: body.monthlyLimit,
        yearlyLimit: body.yearlyLimit,
        requiresApproval: body.requiresApproval !== undefined ? body.requiresApproval : true,
        minApprovalAmount: body.minApprovalAmount,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    await audit.log({
      action: 'purchase-category.create',
      resource: `PurchaseCategory:${category.id}`,
      metadata: {
        name: category.name,
        code: category.code,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.created(category)
  },
})
