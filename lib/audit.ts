import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export interface AuditLogOptions {
  action: string
  resource?: string
  metadata?: Record<string, any>
  ip?: string
  userAgent?: string
  companyId?: string
  actorUserId?: string
}

/**
 * Create an audit log entry
 *
 * @example
 * await audit.log({
 *   action: 'user.create',
 *   resource: `User:${user.id}`,
 *   metadata: { email: user.email, role: user.role },
 *   companyId: session.user.companyId,
 *   actorUserId: session.user.id,
 *   ip: request.headers.get('x-forwarded-for'),
 *   userAgent: request.headers.get('user-agent'),
 * })
 */
export async function log(options: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: options.action,
        resource: options.resource,
        metadata: options.metadata as Prisma.InputJsonValue,
        ip: options.ip,
        userAgent: options.userAgent,
        companyId: options.companyId,
        actorUserId: options.actorUserId,
      },
    })
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Audit log error:', error)
  }
}

/**
 * Query audit logs with filters
 */
export async function query(filters: {
  companyId?: string
  actorUserId?: string
  action?: string
  resource?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  const where: Prisma.AuditLogWhereInput = {}

  if (filters.companyId) where.companyId = filters.companyId
  if (filters.actorUserId) where.actorUserId = filters.actorUserId
  if (filters.action) where.action = { contains: filters.action }
  if (filters.resource) where.resource = { contains: filters.resource }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {}
    if (filters.startDate) where.createdAt.gte = filters.startDate
    if (filters.endDate) where.createdAt.lte = filters.endDate
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total }
}

/**
 * Audit action types (for consistency)
 */
export const AuditAction = {
  // User actions
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_PASSWORD_RESET: 'user.password_reset',

  // Company actions
  COMPANY_CREATE: 'company.create',
  COMPANY_UPDATE: 'company.update',
  COMPANY_DELETE: 'company.delete',
  COMPANY_ACTIVATE: 'company.activate',
  COMPANY_DEACTIVATE: 'company.deactivate',

  // Department actions
  DEPARTMENT_CREATE: 'department.create',
  DEPARTMENT_UPDATE: 'department.update',
  DEPARTMENT_DELETE: 'department.delete',

  // Product actions
  PRODUCT_CREATE: 'product.create',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',

  // Purchase request actions
  REQUEST_CREATE: 'request.create',
  REQUEST_UPDATE: 'request.update',
  REQUEST_DELETE: 'request.delete',
  REQUEST_SUBMIT: 'request.submit',
  REQUEST_APPROVE: 'request.approve',
  REQUEST_REJECT: 'request.reject',
  REQUEST_CANCEL: 'request.cancel',

  // Budget actions
  BUDGET_CREATE: 'budget.create',
  BUDGET_UPDATE: 'budget.update',
  BUDGET_DELETE: 'budget.delete',

  // Workflow actions
  WORKFLOW_CREATE: 'workflow.create',
  WORKFLOW_UPDATE: 'workflow.update',
  WORKFLOW_DELETE: 'workflow.delete',

  // System actions
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore',
  SYSTEM_IMPERSONATE: 'system.impersonate',
} as const

export const audit = { log, query, AuditAction }
export default audit
