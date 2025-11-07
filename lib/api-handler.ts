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
import { rateLimit, getClientIdentifier, RateLimitPresets, rateLimitExceeded } from '@/lib/rate-limit'
import { createRequestLogger, startTimer } from '@/lib/logger'
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

  /** Rate limit configuration */
  rateLimit?: {
    limit: number
    interval: number
  } | keyof typeof RateLimitPresets

  /** Handler function */
  handler: (request: NextRequest, session: Session, context?: any) => Promise<Response>
}

/**
 * Create a secure API route handler with auth, authz, audit logging, rate limiting, and structured logging
 */
export function createHandler(options: HandlerOptions) {
  return async function (request: NextRequest, context?: any): Promise<Response> {
    const startTime = startTimer()
    const requestLogger = createRequestLogger(request)
    const pathname = new URL(request.url).pathname

    // Rate limit result to include in response headers
    let rateLimitResult: { success: boolean; limit: number; remaining: number; reset: number } | null = null

    try {
      // 1. Rate Limiting (before authentication)
      if (options.rateLimit) {
        const identifier = getClientIdentifier(request)
        const preset = typeof options.rateLimit === 'string'
          ? RateLimitPresets[options.rateLimit]
          : options.rateLimit

        rateLimitResult = await rateLimit(identifier, preset.limit, { interval: preset.interval })

        if (!rateLimitResult.success) {
          requestLogger.warn('Rate limit exceeded', {
            identifier,
            limit: preset.limit,
            path: pathname
          })
          return rateLimitExceeded(rateLimitResult.reset)
        }
      }

      // 2. Log request start
      requestLogger.request(request.method, pathname)

      // 3. Authentication
      let session: Session | null = null

      if (!options.public) {
        session = await getServerSession()

        if (!session) {
          requestLogger.warn('Unauthorized access attempt', { path: pathname })
          return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
          )
        }
      }

      // 4. Authorization - Check Permission
      if (options.permission && session) {
        try {
          await authorize(session, options.permission)
        } catch (error) {
          if (error instanceof AuthorizationError) {
            requestLogger.warn('Authorization failed', {
              path: pathname,
              permission: error.permission,
              userId: session.user.id,
              role: session.user.role,
            })
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

      // 4b. Authorization - Check Role
      if (options.roles && session) {
        const hasRole = options.roles.includes(session.user.role)
        if (!hasRole) {
          requestLogger.warn('Role check failed', {
            path: pathname,
            requiredRoles: options.roles,
            userRole: session.user.role,
            userId: session.user.id,
          })
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

      // 5. Call Handler
      const response = await options.handler(request, session!, context)

      // 6. Audit Logging (async, non-blocking)
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
          requestLogger.error('Audit log failed', err)
        })
      }

      // 7. Log response
      const duration = Date.now() - startTime
      requestLogger.response(request.method, pathname, response.status, duration)
      requestLogger.performance(pathname, duration, {
        method: request.method,
        status: response.status,
      })

      // 8. Add rate limit headers to response
      if (rateLimitResult) {
        const headers = new Headers(response.headers)
        headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
        headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        headers.set('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString())

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })
      }

      return response
    } catch (error: any) {
      const duration = Date.now() - startTime
      requestLogger.error('API handler error', error, {
        path: pathname,
        method: request.method,
        duration,
      })

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
