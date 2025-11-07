import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { requireRole } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/companies
 * List all companies with stats (SUPER_ADMIN only)
 */
export const GET = createHandler({
  permission: 'system:admin',
  handler: async (request, session) => {
    // Double-check SUPER_ADMIN role
    requireRole(session, ['SUPER_ADMIN'])

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const status = searchParams.get('status') // 'active', 'inactive', 'all'

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              departments: true,
              purchaseRequests: true,
              products: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.company.count({ where }),
    ])

    return ApiResponse.success(companies, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  },
})

/**
 * POST /api/admin/companies
 * Create a new company (SUPER_ADMIN only)
 */
export const POST = createHandler({
  permission: 'system:admin',
  auditAction: 'company.create',
  handler: async (request, session) => {
    requireRole(session, ['SUPER_ADMIN'])

    const body = await request.json()

    // Validation
    if (!body.name || !body.slug) {
      return ApiResponse.badRequest('Name and slug are required')
    }

    // Check if company with same slug exists
    const existingCompany = await prisma.company.findUnique({
      where: { slug: body.slug },
    })

    if (existingCompany) {
      return ApiResponse.badRequest('Company with this slug already exists')
    }

    const company = await prisma.company.create({
      data: {
        name: body.name,
        slug: body.slug,
        logo: body.logo,
        website: body.website,
        industry: body.industry,
        employeeCount: body.employeeCount,
        address: body.address,
        city: body.city,
        country: body.country,
        phone: body.phone,
        taxId: body.taxId,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isDemo: body.isDemo || false,
        subscription: body.subscription || {
          plan: 'BASIC',
          startDate: new Date(),
          features: ['basic_features'],
        },
      },
    })

    await audit.log({
      action: 'company.create',
      resource: `Company:${company.id}`,
      metadata: {
        name: company.name,
        slug: company.slug,
        isDemo: company.isDemo,
      },
      companyId: company.id,
      actorUserId: session.user.id,
    })

    return ApiResponse.created(company)
  },
})
