import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Kategoriler yüklenemedi' },
      { status: 500 }
    )
  }
}

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
      select: { companyId: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { parentId, ...categoryData } = body

    const category = await prisma.category.create({
      data: {
        ...categoryData,
        company: { connect: { id: user.companyId } },
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Kategori oluşturuldu',
    })
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json(
      { success: false, error: 'Kategori oluşturulamadı' },
      { status: 500 }
    )
  }
}
