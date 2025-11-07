/**
 * Secure API Route Handler
 *
 * Wraps API routes with authentication, authorization, and audit logging.
 *
 * @example
 * export const GET = createHandler({
 *   permission: 'product:read',
 *   handler: async (request, session) => {
 *     const products = await prisma.product.findMany({
 *       where: withCompanyScope(session, { isActive: true }),
 *     })
 *     return Response.json({ data: products })
 *   }
 * })
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { authorize, AuthorizationError } from '@/lib/authz'
import { audit, AuditAction } from '@/lib/audit'
import { getRequestMetadata } from '@/lib/request-metadata'
import type { Session } from 'next-auth'
import type { UserRole } from '@prisma/client'

export interface HandlerOptions {
  /** Required permission key (e.g., 'product:read') */
  permission?: string

  /** Required roles (alternative to permission check) */
  roles?: UserRole[]

  /** Skip authentication (for public endpoints) */
  public?: boolean

  /** Audit action to log (e.g., 'product.create') */
  auditAction?: string

  /** Handler function */
  handler: (request: NextRequest, session: Session) => Promise<Response>
}

/**
 * Create a secure API route handler with auth, authz, and audit logging
 */
export function createHandler(options: HandlerOptions) {
  return async function (request: NextRequest): Promise<Response> {
    try {
      // 1. Authentication
      let session: Session | null = null

      if (!options.public) {
        session = await getServerSession()

        if (!session) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
          )
        }
      }

      // 2. Authorization - Check Permission
      if (options.permission && session) {
        try {
          await authorize(session, options.permission)
        } catch (error) {
          if (error instanceof AuthorizationError) {
            return NextResponse.json(
              {
                success: false,
                error: 'Forbidden',
                message: error.message,
                permission: error.permission,
              },
              { status: 403 }
            )
          }
          throw error
        }
      }

      // 2b. Authorization - Check Role
      if (options.roles && session) {
        const hasRole = options.roles.includes(session.user.role)
        if (!hasRole) {
          return NextResponse.json(
            {
              success: false,
              error: 'Forbidden',
              message: `Requires one of roles: ${options.roles.join(', ')}`,
            },
            { status: 403 }
          )
        }
      }

      // 3. Call Handler
      const response = await options.handler(request, session!)

      // 4. Audit Logging (async, non-blocking)
      if (options.auditAction && session) {
        const metadata = getRequestMetadata(request)

        // Don't await - fire and forget
        audit.log({
          action: options.auditAction,
          companyId: session.user.companyId,
          actorUserId: session.user.id,
          ip: metadata.ip,
          userAgent: metadata.userAgent,
        }).catch(err => {
          console.error('Audit log failed:', err)
        })
      }

      return response
    } catch (error: any) {
      console.error('API handler error:', error)

      // Handle known errors
      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: error.message,
          },
          { status: 403 }
        )
      }

      // Generic error
      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      )
    }
  }
}

/**
 * API response helpers for consistent formatting
 */
export const ApiResponse = {
  success: <T>(data: T, meta?: Record<string, any>) => {
    return Response.json({
      success: true,
      data,
      meta,
    })
  },

  error: (message: string, statusCode: number = 400, details?: Record<string, any>) => {
    return Response.json(
      {
        success: false,
        error: message,
        ...details,
      },
      { status: statusCode }
    )
  },

  unauthorized: (message: string = 'Unauthorized') => {
    return Response.json(
      {
        success: false,
        error: message,
      },
      { status: 401 }
    )
  },

  forbidden: (message: string = 'Forbidden', permission?: string) => {
    return Response.json(
      {
        success: false,
        error: message,
        permission,
      },
      { status: 403 }
    )
  },

  notFound: (resource: string = 'Resource') => {
    return Response.json(
      {
        success: false,
        error: `${resource} not found`,
      },
      { status: 404 }
    )
  },

  badRequest: (message: string, errors?: Record<string, string[]>) => {
    return Response.json(
      {
        success: false,
        error: message,
        errors,
      },
      { status: 400 }
    )
  },

  created: <T>(data: T, location?: string) => {
    const headers = location ? { Location: location } : undefined
    return Response.json(
      {
        success: true,
        data,
      },
      { status: 201, headers }
    )
  },

  noContent: () => {
    return new Response(null, { status: 204 })
  },
}

export default createHandler
