/**
 * Simple in-memory rate limiter for API routes
 *
 * For production with multiple instances, use Redis-based solution like:
 * - Upstash Rate Limit
 * - Redis with rate-limit-redis
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max number of unique tokens per interval
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitStore>()

/**
 * Rate limit checker
 * @param identifier - Unique identifier (IP, user ID, email, etc.)
 * @param limit - Maximum requests allowed in interval
 * @param config - Rate limit configuration
 * @returns Promise<{ success: boolean, limit: number, remaining: number, reset: number }>
 */
export async function rateLimit(
  identifier: string,
  limit: number = 100,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
  }
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const now = Date.now()
  const key = `rate_limit:${identifier}`

  // Clean up expired entries periodically
  if (rateLimitStore.size > config.uniqueTokenPerInterval) {
    const expiredKeys: string[] = []
    rateLimitStore.forEach((value, key) => {
      if (value.resetTime < now) {
        expiredKeys.push(key)
      }
    })
    expiredKeys.forEach((key) => rateLimitStore.delete(key))
  }

  const record = rateLimitStore.get(key)

  if (!record || record.resetTime < now) {
    // Create new record or reset expired one
    const resetTime = now + config.interval
    rateLimitStore.set(key, { count: 1, resetTime })
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime,
    }
  }

  // Increment count
  record.count++
  rateLimitStore.set(key, record)

  const success = record.count <= limit

  return {
    success,
    limit,
    remaining: Math.max(0, limit - record.count),
    reset: record.resetTime,
  }
}

/**
 * Get client identifier from request (IP address or fallback)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'

  return ip
}

/**
 * Rate limit presets for different endpoint types
 */
export const RateLimitPresets = {
  // Authentication endpoints (more restrictive)
  auth: {
    limit: 5,
    interval: 15 * 60 * 1000, // 15 minutes
  },
  // General API endpoints
  api: {
    limit: 100,
    interval: 60 * 1000, // 1 minute
  },
  // Public endpoints (more permissive)
  public: {
    limit: 200,
    interval: 60 * 1000, // 1 minute
  },
  // Heavy operations (exports, reports)
  heavy: {
    limit: 10,
    interval: 60 * 1000, // 1 minute
  },
  // Admin operations
  admin: {
    limit: 500,
    interval: 60 * 1000, // 1 minute
  },
}

/**
 * Rate limit response helper
 */
export function rateLimitExceeded(reset: number): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        'X-RateLimit-Reset': String(reset),
      },
    }
  )
}
