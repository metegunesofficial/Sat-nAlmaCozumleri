import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'
import { hashPassword } from '@/lib/auth'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export const GET = createHandler({
  permission: 'user:read',
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const departmentId = searchParams.get('departmentId')

    const where = withCompanyScope(session, {})

    if (role) {
      where.role = role as any
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        position: true,
        employeeId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return ApiResponse.success(users)
  },
})

export const POST = createHandler({
  permission: 'user:create',
  auditAction: 'user.create',
  handler: async (request, session) => {
    const body = await request.json()

    // Validation
    if (!body.email || !body.name || !body.password || !body.role) {
      return ApiResponse.badRequest('Email, name, password, and role are required')
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: body.email,
        companyId: session.user.companyId,
      },
    })

    if (existingUser) {
      return ApiResponse.badRequest('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password)

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        phone: body.phone,
        role: body.role,
        companyId: session.user.companyId,
        departmentId: body.departmentId || null,
        position: body.position || null,
        employeeId: body.employeeId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        position: true,
        employeeId: true,
        createdAt: true,
      },
    })

    await audit.log({
      action: 'user.create',
      resource: `User:${user.id}`,
      metadata: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.created(user)
  },
})
