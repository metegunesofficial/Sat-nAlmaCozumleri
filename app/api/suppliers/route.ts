import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/suppliers - List all suppliers
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { company: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN and SUPER_ADMIN can access suppliers
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

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
  } catch (error) {
    console.error('Suppliers fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Tedarikçiler yüklenemedi' },
      { status: 500 }
    )
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Only COMPANY_ADMIN and SUPER_ADMIN can create suppliers
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, contactPerson, email, phone, address, city, taxNumber, website, notes, status } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'İsim ve e-posta gereklidir' },
        { status: 400 }
      )
    }

    // Check if supplier with same email exists in company
    const existing = await prisma.supplier.findFirst({
      where: {
        companyId: user.companyId,
        email,
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
        companyId: user.companyId,
        name,
        contactPerson,
        email,
        phone,
        address,
        city,
        taxNumber,
        website,
        notes,
        status: status || 'ACTIVE',
      },
    })

    return NextResponse.json({
      success: true,
      data: supplier,
      message: 'Tedarikçi başarıyla oluşturuldu',
    }, { status: 201 })
  } catch (error) {
    console.error('Supplier creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Tedarikçi oluşturulamadı' },
      { status: 500 }
    )
  }
}
