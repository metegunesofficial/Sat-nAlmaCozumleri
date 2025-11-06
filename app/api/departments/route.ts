import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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

    const departments = await prisma.department.findMany({
      where: {
        isActive: true
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            employees: true,
            purchaseRequests: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: departments
    })
  } catch (error) {
    console.error('Departments fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Departmanlar yüklenemedi' },
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

    // Get user's companyId and role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { companyId: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Check admin permissions
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.code) {
      return NextResponse.json(
        { success: false, error: 'İsim ve kod gereklidir' },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        companyId: user.companyId,
        name: body.name,
        code: body.code,
        description: body.description || null,
        monthlyBudget: body.monthlyBudget ? parseFloat(body.monthlyBudget) : null,
        yearlyBudget: body.yearlyBudget ? parseFloat(body.yearlyBudget) : null,
        managerId: body.managerId || null,
        parentId: body.parentId || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            employees: true,
            purchaseRequests: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: department,
      message: 'Departman oluşturuldu'
    })
  } catch (error) {
    console.error('Department create error:', error)
    return NextResponse.json(
      { success: false, error: 'Departman oluşturulamadı' },
      { status: 500 }
    )
  }
}
