/**
 * Audit Log Utilities
 *
 * This module provides functions to create audit logs for user actions.
 */

import { prisma } from './prisma'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT'
  | 'EXPORT'
  | 'IMPORT'

export interface AuditLogOptions {
  userId: string
  action: AuditAction
  entity: string
  entityId?: string
  changes?: any
  metadata?: any
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
        changes: options.changes ? JSON.parse(JSON.stringify(options.changes)) : null,
        metadata: options.metadata ? JSON.parse(JSON.stringify(options.metadata)) : null,
      },
    })
  } catch (error) {
    // Don't throw - audit logs are important but shouldn't break the app
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Helper to log user actions
 */
export const audit = {
  login: (userId: string, metadata?: any) =>
    createAuditLog({ userId, action: 'LOGIN', entity: 'User', metadata }),

  logout: (userId: string, metadata?: any) =>
    createAuditLog({ userId, action: 'LOGOUT', entity: 'User', metadata }),

  create: (userId: string, entity: string, entityId: string, changes?: any) =>
    createAuditLog({ userId, action: 'CREATE', entity, entityId, changes }),

  update: (userId: string, entity: string, entityId: string, changes?: any) =>
    createAuditLog({ userId, action: 'UPDATE', entity, entityId, changes }),

  delete: (userId: string, entity: string, entityId: string) =>
    createAuditLog({ userId, action: 'DELETE', entity, entityId }),

  approve: (userId: string, entity: string, entityId: string, metadata?: any) =>
    createAuditLog({ userId, action: 'APPROVE', entity, entityId, metadata }),

  reject: (userId: string, entity: string, entityId: string, metadata?: any) =>
    createAuditLog({ userId, action: 'REJECT', entity, entityId, metadata }),

  export: (userId: string, entity: string, metadata?: any) =>
    createAuditLog({ userId, action: 'EXPORT', entity, metadata }),
}

/**
 * Example usage:
 *
 * // Log user login
 * await audit.login(user.id, { ip: req.ip, userAgent: req.headers['user-agent'] })
 *
 * // Log product creation
 * await audit.create(user.id, 'Product', product.id, { name: product.name })
 *
 * // Log purchase request update
 * await audit.update(user.id, 'PurchaseRequest', request.id, {
 *   before: { status: 'DRAFT' },
 *   after: { status: 'SUBMITTED' }
 * })
 *
 * // Log approval
 * await audit.approve(user.id, 'PurchaseRequest', request.id, { step: 1 })
 */
