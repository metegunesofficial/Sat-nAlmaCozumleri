/**
 * Authorization (AuthZ) Helper
 *
 * Centralized permission checking and company scoping for multi-tenant security.
 *
 * @example
 * // In API routes:
 * const session = await requireAuth()
 * await authorize(session, 'user:create')
 *
 * // With resource ownership check:
 * await authorizeResource(session, 'request:update', purchaseRequest)
 */

import { prisma } from '@/lib/prisma'
import type { Session } from 'next-auth'
import type { UserRole } from '@prisma/client'

// ============================================
// Permission Checking
// ============================================

/**
 * Check if a user has a specific permission
 *
 * Checks in order:
 * 1. User-specific overrides (UserPermission)
 * 2. Role-based permissions (RolePermission)
 */
export async function hasPermission(
  userId: string,
  role: UserRole,
  permissionKey: string
): Promise<boolean> {
  // SUPER_ADMIN has all permissions
  if (role === 'SUPER_ADMIN') {
    return true
  }

  // Check user-specific permission override
  const userPermission = await prisma.userPermission.findFirst({
    where: {
      userId,
      permission: { key: permissionKey },
    },
    include: { permission: true },
  })

  // If user has explicit override, use that
  if (userPermission) {
    return userPermission.effect === 'allow'
  }

  // Check role-based permission
  const rolePermission = await prisma.rolePermission.findFirst({
    where: {
      role,
      permission: { key: permissionKey },
    },
    include: { permission: true },
  })

  return rolePermission?.effect === 'allow' || false
}

/**
 * Check if session user has required permission
 * Throws AuthorizationError if not authorized
 */
export async function authorize(
  session: Session,
  requiredPermission: string
): Promise<void> {
  const allowed = await hasPermission(
    session.user.id,
    session.user.role,
    requiredPermission
  )

  if (!allowed) {
    throw new AuthorizationError(
      `Permission denied: ${requiredPermission}`,
      requiredPermission
    )
  }
}

/**
 * Check if user has ANY of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  role: UserRole,
  permissionKeys: string[]
): Promise<boolean> {
  for (const key of permissionKeys) {
    const allowed = await hasPermission(userId, role, key)
    if (allowed) return true
  }
  return false
}

/**
 * Check if user has ALL of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  role: UserRole,
  permissionKeys: string[]
): Promise<boolean> {
  for (const key of permissionKeys) {
    const allowed = await hasPermission(userId, role, key)
    if (!allowed) return false
  }
  return true
}

// ============================================
// Company Scoping (Multi-Tenant Isolation)
// ============================================

/**
 * Verify resource belongs to user's company
 * Throws AuthorizationError if company mismatch
 */
export function enforceCompanyScope<T extends { companyId: string }>(
  session: Session,
  resource: T
): void {
  // SUPER_ADMIN can access any company's resources
  if (session.user.role === 'SUPER_ADMIN') {
    return
  }

  if (resource.companyId !== session.user.companyId) {
    throw new AuthorizationError(
      'Access denied: Resource belongs to different company',
      'company:scope'
    )
  }
}

/**
 * Build Prisma where clause with company scoping
 *
 * @example
 * const products = await prisma.product.findMany({
 *   where: withCompanyScope(session, { isActive: true }),
 * })
 */
export function withCompanyScope<T extends Record<string, any>>(
  session: Session,
  where: T = {} as T
): T & { companyId?: string } {
  // SUPER_ADMIN can query across companies (no scope)
  if (session.user.role === 'SUPER_ADMIN') {
    return where
  }

  return {
    ...where,
    companyId: session.user.companyId,
  }
}

// ============================================
// Resource Ownership
// ============================================

/**
 * Check if user owns a resource (e.g., created it)
 */
export function isOwner<T extends { userId?: string; requesterId?: string; createdBy?: string }>(
  session: Session,
  resource: T
): boolean {
  const ownerId = resource.userId || resource.requesterId || resource.createdBy
  return ownerId === session.user.id
}

/**
 * Authorize resource action with company scope and ownership checks
 *
 * @example
 * await authorizeResource(session, 'request:update', purchaseRequest)
 */
export async function authorizeResource<T extends { companyId: string }>(
  session: Session,
  permissionKey: string,
  resource: T,
  options: {
    requireOwnership?: boolean
    customCheck?: (session: Session, resource: T) => boolean
  } = {}
): Promise<void> {
  // Check permission
  await authorize(session, permissionKey)

  // Check company scope
  enforceCompanyScope(session, resource)

  // Check ownership if required
  if (options.requireOwnership && !isOwner(session, resource)) {
    throw new AuthorizationError(
      'Access denied: You do not own this resource',
      'resource:ownership'
    )
  }

  // Custom check
  if (options.customCheck && !options.customCheck(session, resource)) {
    throw new AuthorizationError(
      'Access denied: Custom authorization check failed',
      'resource:custom'
    )
  }
}

// ============================================
// Role-Based Checks
// ============================================

/**
 * Check if user has one of the required roles
 */
export function hasRole(session: Session, roles: UserRole[]): boolean {
  return roles.includes(session.user.role)
}

/**
 * Require user to have one of the specified roles
 * Throws AuthorizationError if not authorized
 */
export function requireRole(session: Session, roles: UserRole[]): void {
  if (!hasRole(session, roles)) {
    throw new AuthorizationError(
      `Access denied: Requires one of roles: ${roles.join(', ')}`,
      'role:required'
    )
  }
}

/**
 * Check if user is admin (SUPER_ADMIN or COMPANY_ADMIN)
 */
export function isAdmin(session: Session): boolean {
  return hasRole(session, ['SUPER_ADMIN', 'COMPANY_ADMIN'])
}

/**
 * Check if user is a manager (any manager role)
 */
export function isManager(session: Session): boolean {
  return hasRole(session, [
    'SUPER_ADMIN',
    'COMPANY_ADMIN',
    'GENERAL_MANAGER',
    'DEPARTMENT_MANAGER',
    'FINANCE_MANAGER',
    'PROCUREMENT_MANAGER',
  ])
}

// ============================================
// Department Scoping
// ============================================

/**
 * Check if user belongs to a specific department
 */
export function isInDepartment(session: Session, departmentId: string): boolean {
  return session.user.departmentId === departmentId
}

/**
 * Check if user is manager of a specific department
 *
 * Note: This requires additional DB query to verify managerId
 */
export async function isDepartmentManager(
  session: Session,
  departmentId: string
): Promise<boolean> {
  if (session.user.role !== 'DEPARTMENT_MANAGER') {
    return false
  }

  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { managerId: true },
  })

  return department?.managerId === session.user.id
}

// ============================================
// Batch Permission Check
// ============================================

/**
 * Get all permissions for a user (for UI rendering)
 *
 * @example
 * const permissions = await getUserPermissions(session.user.id, session.user.role)
 * const canCreateUsers = permissions.includes('user:create')
 */
export async function getUserPermissions(
  userId: string,
  role: UserRole
): Promise<string[]> {
  // SUPER_ADMIN has all permissions
  if (role === 'SUPER_ADMIN') {
    const allPerms = await prisma.permission.findMany({
      select: { key: true },
    })
    return allPerms.map(p => p.key)
  }

  // Get user-specific permissions
  const userPermissions = await prisma.userPermission.findMany({
    where: { userId, effect: 'allow' },
    include: { permission: true },
  })

  // Get role-based permissions
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role, effect: 'allow' },
    include: { permission: true },
  })

  // Get denied permissions (for overrides)
  const deniedPermissions = await prisma.userPermission.findMany({
    where: { userId, effect: 'deny' },
    include: { permission: true },
  })

  const deniedKeys = new Set(deniedPermissions.map(p => p.permission.key))

  // Combine user and role permissions, excluding denied ones
  const allPermissions = new Set<string>()

  userPermissions.forEach(p => {
    if (!deniedKeys.has(p.permission.key)) {
      allPermissions.add(p.permission.key)
    }
  })

  rolePermissions.forEach(p => {
    if (!deniedKeys.has(p.permission.key)) {
      allPermissions.add(p.permission.key)
    }
  })

  return Array.from(allPermissions)
}

// ============================================
// Permission Matrix (for Admin UI)
// ============================================

/**
 * Get permission matrix for all roles (for admin UI)
 */
export async function getPermissionMatrix() {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ category: 'asc' }, { key: 'asc' }],
  })

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { effect: 'allow' },
    include: { permission: true },
  })

  // Group by role
  const matrix: Record<string, string[]> = {}
  const roles: UserRole[] = [
    'SUPER_ADMIN',
    'COMPANY_ADMIN',
    'GENERAL_MANAGER',
    'DEPARTMENT_MANAGER',
    'FINANCE_MANAGER',
    'PROCUREMENT_MANAGER',
    'EMPLOYEE',
  ]

  roles.forEach(role => {
    matrix[role] = rolePermissions
      .filter(rp => rp.role === role)
      .map(rp => rp.permission.key)
  })

  return {
    permissions,
    matrix,
    roles,
  }
}

// ============================================
// Error Class
// ============================================

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public permission: string,
    public code: string = 'AUTHORIZATION_ERROR'
  ) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

// ============================================
// Exports
// ============================================

export const authz = {
  // Permission checks
  hasPermission,
  authorize,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,

  // Company scoping
  enforceCompanyScope,
  withCompanyScope,

  // Resource authorization
  isOwner,
  authorizeResource,

  // Role checks
  hasRole,
  requireRole,
  isAdmin,
  isManager,

  // Department checks
  isInDepartment,
  isDepartmentManager,

  // Utilities
  getPermissionMatrix,
  AuthorizationError,
}

export default authz
