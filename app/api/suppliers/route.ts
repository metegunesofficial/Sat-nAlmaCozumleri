import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export const GET = createHandler({
  permission: 'supplier:read',
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where = withCompanyScope(session, {})

    if (status) {
      where.status = status as any
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return ApiResponse.success(suppliers)
  },
})

export const POST = createHandler({
  permission: 'supplier:create',
  auditAction: 'supplier.create',
  handler: async (request, session) => {
    const body = await request.json()

    // Validation
    if (!body.name || !body.email) {
      return ApiResponse.badRequest('Name and email are required')
    }

    // Check if supplier with same email exists in company
    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        email: body.email,
        companyId: session.user.companyId,
      },
    })

    if (existingSupplier) {
      return ApiResponse.badRequest('Supplier with this email already exists')
    }

    const supplier = await prisma.supplier.create({
      data: {
        companyId: session.user.companyId,
        name: body.name,
        contactPerson: body.contactPerson,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        taxNumber: body.taxNumber,
        website: body.website,
        notes: body.notes,
        status: body.status || 'ACTIVE',
      },
    })

    await audit.log({
      action: 'supplier.create',
      resource: `Supplier:${supplier.id}`,
      metadata: {
        name: supplier.name,
        email: supplier.email,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.created(supplier)
  },
})
