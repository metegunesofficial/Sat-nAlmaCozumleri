import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { requireRole } from '@/lib/authz'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/audit-logs
 * View all audit logs with filtering (SUPER_ADMIN only)
 */
export const GET = createHandler({
  permission: 'system:admin',
  handler: async (request, session) => {
    requireRole(session, ['SUPER_ADMIN'])

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const companyId = searchParams.get('companyId')
    const actorUserId = searchParams.get('actorUserId')
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where: Prisma.AuditLogWhereInput = {}

    if (companyId) {
      where.companyId = companyId
    }

    if (actorUserId) {
      where.actorUserId = actorUserId
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' }
    }

    if (resource) {
      where.resource = { contains: resource, mode: 'insensitive' }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          actorUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return ApiResponse.success(logs, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  },
})
