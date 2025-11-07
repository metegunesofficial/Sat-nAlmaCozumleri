import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { requireRole } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/companies/[companyId]
 * Get single company details (SUPER_ADMIN only)
 */
export const GET = createHandler({
  permission: 'system:admin',
  handler: async (request, session, context: any) => {
    requireRole(session, ['SUPER_ADMIN'])

    const companyId = context.params.companyId

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            purchaseRequests: true,
            products: true,
            categories: true,
            suppliers: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!company) {
      return ApiResponse.notFound('Company')
    }

    return ApiResponse.success(company)
  },
})

/**
 * PUT /api/admin/companies/[companyId]
 * Update company (SUPER_ADMIN only)
 */
export const PUT = createHandler({
  permission: 'system:admin',
  auditAction: 'company.update',
  handler: async (request, session, context: any) => {
    requireRole(session, ['SUPER_ADMIN'])

    const companyId = context.params.companyId
    const body = await request.json()

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company) {
      return ApiResponse.notFound('Company')
    }

    // Check if slug is being changed to an existing one
    if (body.slug && body.slug !== company.slug) {
      const existingCompany = await prisma.company.findUnique({
        where: { slug: body.slug },
      })

      if (existingCompany) {
        return ApiResponse.badRequest('Another company with this slug already exists')
      }
    }

    const updated = await prisma.company.update({
      where: { id: companyId },
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
        isActive: body.isActive,
        subscription: body.subscription,
      },
    })

    await audit.log({
      action: 'company.update',
      resource: `Company:${updated.id}`,
      metadata: {
        name: updated.name,
        changes: body,
      },
      companyId: updated.id,
      actorUserId: session.user.id,
    })

    return ApiResponse.success(updated)
  },
})

/**
 * DELETE /api/admin/companies/[companyId]
 * Delete company and all related data (SUPER_ADMIN only)
 */
export const DELETE = createHandler({
  permission: 'system:admin',
  auditAction: 'company.delete',
  handler: async (request, session, context: any) => {
    requireRole(session, ['SUPER_ADMIN'])

    const companyId = context.params.companyId

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            purchaseRequests: true,
          },
        },
      },
    })

    if (!company) {
      return ApiResponse.notFound('Company')
    }

    // Prevent deletion of companies with active users (unless forced)
    const searchParams = request.nextUrl.searchParams
    const force = searchParams.get('force') === 'true'

    if (company._count.users > 0 && !force) {
      return ApiResponse.badRequest(
        `This company has ${company._count.users} users and ${company._count.purchaseRequests} purchase requests. Use ?force=true to delete anyway.`
      )
    }

    // Store company info for audit log before deletion
    const companyInfo = {
      name: company.name,
      slug: company.slug,
      userCount: company._count.users,
      departmentCount: company._count.departments,
      requestCount: company._count.purchaseRequests,
    }

    // Delete company (cascade will handle related data)
    await prisma.company.delete({
      where: { id: companyId },
    })

    await audit.log({
      action: 'company.delete',
      resource: `Company:${companyId}`,
      metadata: companyInfo,
      companyId: null,
      actorUserId: session.user.id,
    })

    return ApiResponse.noContent()
  },
})
