import { Logger, createRequestLogger } from '@/lib/logger'
import { NextRequest } from 'next/server'

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Logger instance', () => {
    it('should log info messages', () => {
      const logger = new Logger()
      logger.info('Test message', { userId: '123' })

      expect(consoleLogSpy).toHaveBeenCalled()
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.level).toBe('info')
      expect(loggedData.message).toBe('Test message')
      expect(loggedData.context.userId).toBe('123')
    })

    it('should log error messages', () => {
      const logger = new Logger()
      const error = new Error('Test error')
      logger.error('Error occurred', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0])
      expect(loggedData.level).toBe('error')
      expect(loggedData.message).toBe('Error occurred')
      expect(loggedData.error).toBeDefined()
    })

    it('should log warn messages', () => {
      const logger = new Logger()
      logger.warn('Warning message')

      expect(consoleLogSpy).toHaveBeenCalled()
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.level).toBe('warn')
    })
  })

  describe('PII Redaction', () => {
    it('should redact email addresses', () => {
      const logger = new Logger()
      logger.info('User logged in', { email: 'test@example.com' })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.context.email).not.toBe('test@example.com')
      expect(loggedData.context.email).toContain('@example.com')
      expect(loggedData.context.email).toMatch(/t\*\*\*@example\.com/)
    })

    it('should redact password fields', () => {
      const logger = new Logger()
      logger.info('User created', { password: 'secret123' })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.context.password).toBe('[REDACTED]')
    })

    it('should redact token fields', () => {
      const logger = new Logger()
      logger.info('Auth request', { token: 'abc123xyz' })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.context.token).toBe('[REDACTED]')
    })

    it('should redact JWT tokens in strings', () => {
      const logger = new Logger()
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature'
      logger.info(`Authorization: Bearer ${jwtToken}`)

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.message).not.toContain(jwtToken)
      expect(loggedData.message).toContain('[JWT_REDACTED]')
    })

    it('should redact credit card numbers', () => {
      const logger = new Logger()
      logger.info('Payment processed', { creditCard: '4532-1234-5678-9010' })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.context.creditCard).not.toBe('4532-1234-5678-9010')
      expect(loggedData.context.creditCard).toContain('****')
    })

    it('should handle nested objects', () => {
      const logger = new Logger()
      logger.info('Complex object', {
        user: {
          email: 'test@example.com',
          password: 'secret',
        },
      })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.context.user.password).toBe('[REDACTED]')
      expect(loggedData.context.user.email).not.toBe('test@example.com')
    })
  })

  describe('Request Logger', () => {
    it('should create logger with requestId', () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const logger = createRequestLogger(request)

      logger.info('Test message')

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.context.requestId).toBeDefined()
      expect(loggedData.context.requestId).toMatch(/^[a-z0-9-]+$/)
    })

    it('should log request method and path', () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
      })
      const logger = createRequestLogger(request)

      logger.request('POST', '/api/users')

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.message).toContain('POST /api/users')
      expect(loggedData.context.type).toBe('http_request')
    })

    it('should log response with status and duration', () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const logger = createRequestLogger(request)

      logger.response('GET', '/api/test', 200, 123)

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.message).toContain('GET /api/test')
      expect(loggedData.context.status).toBe(200)
      expect(loggedData.context.duration).toBe(123)
    })

    it('should log performance metrics', () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const logger = createRequestLogger(request)

      logger.performance('database_query', 45, { query: 'SELECT * FROM users' })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
      expect(loggedData.context.operation).toBe('database_query')
      expect(loggedData.context.duration).toBe(45)
    })
  })
})
