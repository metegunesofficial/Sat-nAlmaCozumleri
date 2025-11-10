import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/companies/[id]
 * Update company (SUPER_ADMIN only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only SUPER_ADMIN can update companies
    if (decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isActive } = body

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Şirket güncellendi',
    })
  } catch (error) {
    console.error('Company update error:', error)
    return NextResponse.json(
      { success: false, error: 'Şirket güncellenemedi' },
      { status: 500 }
    )
  }
}
