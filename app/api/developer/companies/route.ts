import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// GET - Tüm şirketleri listele (Sadece SUPER_ADMIN)
export async function GET() {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }

    // Sadece SUPER_ADMIN erişebilir
    if (decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok. Sadece Super Admin erişebilir.' },
        { status: 403 }
      )
    }

    // Tüm şirketleri getir
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        taxNumber: true,
        city: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            departments: true,
            products: true,
            purchaseRequests: true,
            orders: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: companies
    })
  } catch (error: any) {
    console.error('Developer companies error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Yeni şirket oluştur (Sadece SUPER_ADMIN)
export async function POST(request: Request) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }

    if (decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, slug, taxNumber, address, city, phone, email, website } = body

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Şirket adı ve slug gerekli' },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        taxNumber,
        address,
        city,
        phone,
        email,
        website,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: company
    })
  } catch (error: any) {
    console.error('Create company error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Şirket oluşturulamadı' },
      { status: 500 }
    )
  }
}
