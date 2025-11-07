/**
 * Request Metadata Utilities
 *
 * Extract client information from Next.js requests for audit logging and security.
 */

import type { NextRequest } from 'next/server'

/**
 * Extract client IP address from request headers
 *
 * Checks multiple headers to handle various proxy configurations:
 * - x-forwarded-for (Vercel, most proxies)
 * - x-real-ip (Nginx, some CDNs)
 * - cf-connecting-ip (Cloudflare)
 */
export function getClientIp(request: NextRequest | Request): string | undefined {
  const headers = request.headers

  // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2...)
  // The first IP is the original client
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    return ips[0]
  }

  // x-real-ip is usually set by Nginx
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Cloudflare sets this header
  const cfIp = headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }

  // Fallback - not reliable in production
  return undefined
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(request: NextRequest | Request): string | undefined {
  return request.headers.get('user-agent') || undefined
}

/**
 * Extract request origin/referer
 */
export function getOrigin(request: NextRequest | Request): string | undefined {
  return request.headers.get('origin') || request.headers.get('referer') || undefined
}

/**
 * Extract all relevant metadata for audit logging
 */
export function getRequestMetadata(request: NextRequest | Request) {
  return {
    ip: getClientIp(request),
    userAgent: getUserAgent(request),
    origin: getOrigin(request),
  }
}

/**
 * Check if request is from a trusted proxy/CDN
 */
export function isTrustedProxy(ip: string): boolean {
  // Vercel proxy IPs
  const vercelProxies = ['76.76.21.', '76.76.22.', '76.76.23.']

  // Cloudflare IP ranges (simplified - in production use full list)
  const cloudflareProxies = ['173.245.', '103.21.', '103.22.']

  return (
    vercelProxies.some(prefix => ip.startsWith(prefix)) ||
    cloudflareProxies.some(prefix => ip.startsWith(prefix))
  )
}

/**
 * Parse user agent to detect bot/crawler
 */
export function isBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false

  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python-requests',
    'postman',
  ]

  const ua = userAgent.toLowerCase()
  return botPatterns.some(pattern => ua.includes(pattern))
}

/**
 * Get device type from user agent
 */
export function getDeviceType(userAgent: string | undefined): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  if (!userAgent) return 'unknown'

  const ua = userAgent.toLowerCase()

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet'
  }

  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    return 'mobile'
  }

  if (/chrome|safari|firefox|msie|trident/i.test(ua)) {
    return 'desktop'
  }

  return 'unknown'
}

export const requestMetadata = {
  getClientIp,
  getUserAgent,
  getOrigin,
  getRequestMetadata,
  isTrustedProxy,
  isBot,
  getDeviceType,
}

export default requestMetadata
