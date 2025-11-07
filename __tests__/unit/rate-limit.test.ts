import { rateLimit, RateLimitPresets, getClientIdentifier } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limit store between tests
    jest.clearAllMocks()
  })

  describe('rateLimit', () => {
    it('should allow requests within limit', async () => {
      const identifier = 'test-user-1'
      const limit = 5

      for (let i = 0; i < limit; i++) {
        const result = await rateLimit(identifier, limit, { interval: 60000 })
        expect(result.success).toBe(true)
        expect(result.remaining).toBe(limit - i - 1)
      }
    })

    it('should block requests exceeding limit', async () => {
      const identifier = 'test-user-2'
      const limit = 3

      // Use up the limit
      for (let i = 0; i < limit; i++) {
        await rateLimit(identifier, limit, { interval: 60000 })
      }

      // Next request should be blocked
      const result = await rateLimit(identifier, limit, { interval: 60000 })
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after interval', async () => {
      const identifier = 'test-user-3'
      const limit = 2
      const interval = 100 // 100ms

      // Use up the limit
      await rateLimit(identifier, limit, { interval })
      const blockedResult = await rateLimit(identifier, limit, { interval })
      expect(blockedResult.success).toBe(false)

      // Wait for interval to pass
      await new Promise(resolve => setTimeout(resolve, interval + 10))

      // Should be allowed again
      const allowedResult = await rateLimit(identifier, limit, { interval })
      expect(allowedResult.success).toBe(true)
    })

    it('should track different identifiers separately', async () => {
      const limit = 2

      const result1 = await rateLimit('user-1', limit, { interval: 60000 })
      const result2 = await rateLimit('user-2', limit, { interval: 60000 })

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.remaining).toBe(1)
      expect(result2.remaining).toBe(1)
    })
  })

  describe('RateLimitPresets', () => {
    it('should have correct auth preset', () => {
      expect(RateLimitPresets.auth).toEqual({
        limit: 5,
        interval: 15 * 60 * 1000, // 15 minutes
      })
    })

    it('should have correct api preset', () => {
      expect(RateLimitPresets.api).toEqual({
        limit: 100,
        interval: 60 * 1000, // 1 minute
      })
    })

    it('should have correct heavy preset', () => {
      expect(RateLimitPresets.heavy).toEqual({
        limit: 10,
        interval: 60 * 1000, // 1 minute
      })
    })
  })

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      })

      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      })

      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('192.168.1.2')
    })

    it('should extract IP from cf-connecting-ip header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'cf-connecting-ip': '192.168.1.3',
        },
      })

      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('192.168.1.3')
    })

    it('should use unknown when no IP headers present', () => {
      const request = new NextRequest('http://localhost:3000')

      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('unknown')
    })

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
          'cf-connecting-ip': '192.168.1.3',
        },
      })

      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('192.168.1.1')
    })
  })
})
