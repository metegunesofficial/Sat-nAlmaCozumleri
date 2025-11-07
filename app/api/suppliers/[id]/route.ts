import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { authorizeResource } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export const GET = createHandler({
  permission: 'supplier:read',
  handler: async (request, session, context: any) => {
    const supplierId = context.params.id

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    })

    if (!supplier) {
      return ApiResponse.notFound('Supplier')
    }

    // Verify company scope
    try {
      await authorizeResource(session, 'supplier:read', supplier)
    } catch (error: any) {
      return ApiResponse.forbidden(error.message)
    }

    return ApiResponse.success(supplier)
  },
})

export const PUT = createHandler({
  permission: 'supplier:update',
  auditAction: 'supplier.update',
  handler: async (request, session, context: any) => {
    const supplierId = context.params.id
    const body = await request.json()

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      return ApiResponse.notFound('Supplier')
    }

    // Verify authorization
    try {
      await authorizeResource(session, 'supplier:update', supplier)
    } catch (error: any) {
      return ApiResponse.forbidden(error.message)
    }

    // Check if email is being changed to an existing one
    if (body.email && body.email !== supplier.email) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          companyId: session.user.companyId,
          email: body.email,
          id: { not: supplierId },
        },
      })

      if (existingSupplier) {
        return ApiResponse.badRequest('Another supplier with this email already exists')
      }
    }

    const updated = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name: body.name,
        contactPerson: body.contactPerson,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        taxNumber: body.taxNumber,
        website: body.website,
        notes: body.notes,
        status: body.status,
        rating: body.rating ? parseFloat(body.rating) : supplier.rating,
      },
    })

    await audit.log({
      action: 'supplier.update',
      resource: `Supplier:${updated.id}`,
      metadata: {
        name: updated.name,
        changes: body,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.success(updated)
  },
})

export const DELETE = createHandler({
  permission: 'supplier:delete',
  auditAction: 'supplier.delete',
  handler: async (request, session, context: any) => {
    const supplierId = context.params.id

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    if (!supplier) {
      return ApiResponse.notFound('Supplier')
    }

    // Verify authorization
    try {
      await authorizeResource(session, 'supplier:delete', supplier)
    } catch (error: any) {
      return ApiResponse.forbidden(error.message)
    }

    // Check if supplier has products
    if (supplier._count.products > 0) {
      return ApiResponse.badRequest(
        'This supplier has products. Please delete or reassign the products first.'
      )
    }

    await prisma.supplier.delete({
      where: { id: supplierId },
    })

    await audit.log({
      action: 'supplier.delete',
      resource: `Supplier:${supplierId}`,
      metadata: {
        name: supplier.name,
        email: supplier.email,
      },
      companyId: session.user.companyId,
      actorUserId: session.user.id,
    })

    return ApiResponse.noContent()
  },
})
