import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, hashPassword } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/companies
 * Get all companies (SUPER_ADMIN only)
 */
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

    // Only SUPER_ADMIN can access
    if (decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    // Get all companies with user count
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: companies,
    })
  } catch (error) {
    console.error('Companies fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Şirketler yüklenemedi' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/companies
 * Create new company with admin user (SUPER_ADMIN only)
 */
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

    // Only SUPER_ADMIN can create companies
    if (decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { companyName, adminName, adminEmail, adminPassword, adminPhone } = body

    if (!companyName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Şirket adı, admin email ve şifre gerekli' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: adminEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Bu email zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(adminPassword)

    // Create company slug
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create company and admin user in transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug: `${slug}-${Date.now()}`,
          isActive: true,
        },
      })

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName || 'Admin',
          phone: adminPhone,
          companyId: company.id,
          role: 'COMPANY_ADMIN',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          companyId: true,
        },
      })

      return { company, adminUser }
    })

    return NextResponse.json({
      success: true,
      data: {
        company: result.company,
        adminUser: result.adminUser,
      },
      message: 'Şirket ve admin kullanıcı başarıyla oluşturuldu',
    })
  } catch (error) {
    console.error('Company creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Şirket oluşturulamadı' },
      { status: 500 }
    )
  }
}
