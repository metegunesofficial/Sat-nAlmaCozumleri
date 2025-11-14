import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  companyId: string
  departmentId: string | null
}

export interface AuthRequest extends NextRequest {
  user?: AuthUser
}

/**
 * Authentication middleware - Verifies JWT token and attaches user to request
 * @param request Next.js request object
 * @returns User object if authenticated, throws error otherwise
 */
export async function authenticate(request: NextRequest): Promise<AuthUser> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new Error('Token gerekli')
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    throw new Error('Geçersiz veya süresi dolmuş token')
  }

  // Fetch full user details from database
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
      departmentId: true,
    },
  })

  if (!user) {
    throw new Error('Kullanıcı bulunamadı')
  }

  return user as AuthUser
}

/**
 * Authorization middleware - Checks if user has required role
 * @param user Authenticated user
 * @param allowedRoles Array of allowed roles
 * @returns true if authorized, throws error otherwise
 */
export function authorize(user: AuthUser, allowedRoles: string[]): boolean {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Bu işlem için yetkiniz yok')
  }
  return true
}

/**
 * Combined auth middleware helper for API routes
 * @param request Next.js request
 * @param allowedRoles Optional array of allowed roles
 * @returns Authenticated user
 */
export async function withAuth(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<AuthUser> {
  try {
    const user = await authenticate(request)

    if (allowedRoles && allowedRoles.length > 0) {
      authorize(user, allowedRoles)
    }

    return user
  } catch (error: any) {
    throw new Error(error.message || 'Kimlik doğrulama hatası')
  }
}

/**
 * Optional auth - Returns user if authenticated, undefined otherwise
 * Useful for public endpoints that show different data for authenticated users
 */
export async function optionalAuth(request: NextRequest): Promise<AuthUser | undefined> {
  try {
    return await authenticate(request)
  } catch {
    return undefined
  }
}

/**
 * Helper to create standardized error responses
 */
export function authErrorResponse(error: Error, status: number = 401) {
  return NextResponse.json(
    { success: false, error: error.message },
    { status }
  )
}

/**
 * Role-based authorization helper
 */
export const Roles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  GENERAL_MANAGER: 'GENERAL_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  PROCUREMENT_MANAGER: 'PROCUREMENT_MANAGER',
  DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const

/**
 * Common role groups for authorization
 */
export const RoleGroups = {
  ADMIN: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
  MANAGER: ['GENERAL_MANAGER', 'FINANCE_MANAGER', 'PROCUREMENT_MANAGER', 'DEPARTMENT_MANAGER'],
  ALL_STAFF: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'GENERAL_MANAGER', 'FINANCE_MANAGER', 'PROCUREMENT_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'],
} as const
