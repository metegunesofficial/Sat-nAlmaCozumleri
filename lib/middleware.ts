import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

/**
 * Authentication middleware for API routes
 * Verifies JWT token from Authorization header
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, error: 'Missing or invalid authorization header' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix

      // Verify token
      const payload = verifyToken(token)

      if (!payload) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        )
      }

      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = payload

      // Call the actual handler
      return handler(authenticatedReq)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * Role-based authorization middleware
 * Must be used after withAuth
 */
export function withRole(allowedRoles: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: AuthenticatedRequest) => {
      if (!req.user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      if (!allowedRoles.includes(req.user.role)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      return handler(req)
    }
  }
}

/**
 * Helper to get authenticated user from request
 */
export function getAuthUser(req: NextRequest): JWTPayload | null {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    return verifyToken(token)
  } catch (error) {
    return null
  }
}
