import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export const GET = createHandler({
  permission: 'department:read',
  handler: async (request, session) => {
    const where = withCompanyScope(session, {
      isActive: true,
    })

    const departments = await prisma.department.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            employees: true,
            purchaseRequests: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return ApiResponse.success(departments)
  },
})

export const POST = createHandler({
  permission: 'department:create',
  auditAction: 'department.create',
  handler: async (request, session) => {
    const body = await request.json()

    // Validation
    if (!body.name || !body.code) {
      return ApiResponse.badRequest('Name and code are required')
    }

    // Check if department with same code exists in company
    const existingDepartment = await prisma.department.findFirst({
      where: {
        code: body.code,
        companyId: session.user.companyId,
      },
    })

    if (existingDepartment) {
      return ApiResponse.badRequest('Department with this code already exists')
    }

    const department = await prisma.department.create({
      data: {
        ...body,
        companyId: session.user.companyId,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await audit.log({
      action: 'department.create',
      resource: `Department:${department.id}`,
      metadata: {
        name: department.name,
        code: department.code,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.created(department)
  },
})
