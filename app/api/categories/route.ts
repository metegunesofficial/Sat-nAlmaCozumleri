import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeProducts = searchParams.get('includeProducts') === 'true'

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Only get root categories
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        _count: includeProducts ? { select: { products: true } } : undefined,
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Categories fetch error')
    return NextResponse.json(
      { success: false, error: 'Kategoriler yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has permission
    const allowedRoles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROCUREMENT_MANAGER']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const category = await prisma.category.create({
      data: body,
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Kategori oluşturuldu',
    })
  } catch (error) {
    console.error('Category create error')
    return NextResponse.json(
      { success: false, error: 'Kategori oluşturulamadı' },
      { status: 500 }
    )
  }
}
