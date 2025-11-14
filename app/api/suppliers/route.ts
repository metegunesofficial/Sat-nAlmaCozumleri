import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, RoleGroups, authErrorResponse } from '@/lib/middleware'
import { supplierCreateSchema, validateRequest } from '@/lib/validations'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/suppliers - List all suppliers
export async function GET(request: NextRequest) {
  try {
    // Use centralized auth middleware
    const user = await withAuth(request, [
      ...RoleGroups.ADMIN,
      'PROCUREMENT_MANAGER'
    ])

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where: any = {
      companyId: user.companyId,
    }

    if (status) {
      where.status = status
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

    return NextResponse.json({
      success: true,
      data: suppliers,
    })
  } catch (error: any) {
    console.error('Suppliers fetch error:', error)

    // Handle auth errors with proper status codes
    if (error.message?.includes('Token') || error.message?.includes('yetki')) {
      return authErrorResponse(error, error.message.includes('yetki') ? 403 : 401)
    }

    return NextResponse.json(
      { success: false, error: 'Tedarikçiler yüklenemedi' },
      { status: 500 }
    )
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: NextRequest) {
  try {
    // Use centralized auth middleware
    const user = await withAuth(request, [
      ...RoleGroups.ADMIN,
      'PROCUREMENT_MANAGER'
    ])

    const body = await request.json()

    // Validate request body with Zod
    const validatedData = validateRequest(supplierCreateSchema, body)

    // Check if supplier with same email exists in company
    const existing = await prisma.supplier.findFirst({
      where: {
        companyId: user.companyId,
        email: validatedData.email,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta ile kayıtlı tedarikçi zaten var' },
        { status: 409 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: {
        ...validatedData,
        companyId: user.companyId,
      },
    })

    return NextResponse.json({
      success: true,
      data: supplier,
      message: 'Tedarikçi başarıyla oluşturuldu',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Supplier creation error:', error)

    // Handle different error types
    if (error.message?.includes('Token') || error.message?.includes('yetki')) {
      return authErrorResponse(error, error.message.includes('yetki') ? 403 : 401)
    }

    // Validation errors
    if (error.message?.includes(':')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Tedarikçi oluşturulamadı' },
      { status: 500 }
    )
  }
}
