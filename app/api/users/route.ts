import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, RoleGroups } from '@/lib/middleware'
import { userCreateSchema, validateRequest } from '@/lib/validations'
import bcrypt from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    // Use centralized auth middleware - only admins can list users
    const user = await withAuth(request, RoleGroups.ADMIN)

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const departmentId = searchParams.get('departmentId')

    const where: any = {
      companyId: user.companyId, // CRITICAL: Filter by company for multi-tenancy
    }

    if (role) {
      where.role = role
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        position: true,
        employeeId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error: any) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Kullanıcılar yüklenemedi' },
      { status: error.message?.includes('Token') || error.message?.includes('Yetki') ? 401 : 500 }
    )
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // Use centralized auth middleware - only admins can create users
    const currentUser = await withAuth(request, RoleGroups.ADMIN)

    const body = await request.json()

    // Validate request body with Zod schema
    const validatedData = validateRequest(userCreateSchema, body)

    // Check if user with same email exists in company
    const existing = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        companyId: currentUser.companyId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta ile kayıtlı kullanıcı zaten var' },
        { status: 409 }
      )
    }

    // Verify department belongs to company if provided
    if (validatedData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: validatedData.departmentId },
        select: { companyId: true }
      })

      if (!department || department.companyId !== currentUser.companyId) {
        return NextResponse.json(
          { success: false, error: 'Departman bulunamadı' },
          { status: 404 }
        )
      }
    }

    // Hash password (12 rounds for security)
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const newUser = await prisma.user.create({
      data: {
        companyId: currentUser.companyId, // CRITICAL: Enforce company isolation
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        phone: validatedData.phone,
        role: validatedData.role,
        departmentId: validatedData.departmentId,
        position: validatedData.position,
        employeeId: validatedData.employeeId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        position: true,
        employeeId: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Kullanıcı başarıyla oluşturuldu',
    }, { status: 201 })
  } catch (error: any) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Kullanıcı oluşturulamadı' },
      { status: error.message?.includes('Token') || error.message?.includes('Yetki') ? 401 : 500 }
    )
  }
}
