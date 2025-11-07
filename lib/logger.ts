/**
 * Structured Logger with PII Redaction
 *
 * Features:
 * - Structured JSON logging
 * - Log levels (debug, info, warn, error)
 * - PII redaction (emails, passwords, tokens, phone numbers)
 * - Request/response logging
 * - Performance timing
 * - Context propagation
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  requestId?: string
  userId?: string
  companyId?: string
  action?: string
  ip?: string
  userAgent?: string
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    message: string
    stack?: string
    code?: string
  }
  performance?: {
    duration: number
    unit: string
  }
}

/**
 * PII patterns to redact
 */
const PII_PATTERNS = {
  email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
  phone: /(\+?[0-9]{1,4}?[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  password: /(password|passwd|pwd|secret|token|api[_-]?key)["\s:=]+[^\s"'}]+/gi,
  jwt: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
}

/**
 * Sensitive field names to redact
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'accessToken',
  'refreshToken',
  'sessionId',
  'creditCard',
  'cvv',
  'ssn',
  'taxId',
  'pin',
])

/**
 * Redact PII from string
 */
function redactString(str: string): string {
  let redacted = str

  // Redact email (keep domain)
  redacted = redacted.replace(PII_PATTERNS.email, (match) => {
    const [local, domain] = match.split('@')
    return `${local[0]}***@${domain}`
  })

  // Redact phone numbers
  redacted = redacted.replace(PII_PATTERNS.phone, '***-***-****')

  // Redact credit cards
  redacted = redacted.replace(PII_PATTERNS.creditCard, '**** **** **** ****')

  // Redact SSN
  redacted = redacted.replace(PII_PATTERNS.ssn, '***-**-****')

  // Redact passwords and tokens
  redacted = redacted.replace(PII_PATTERNS.password, '$1: [REDACTED]')

  // Redact JWT tokens
  redacted = redacted.replace(PII_PATTERNS.jwt, '[JWT_TOKEN]')

  // Redact IP addresses (optional - may want to keep for security)
  // redacted = redacted.replace(PII_PATTERNS.ipv4, '***.***.***.***')

  return redacted
}

/**
 * Redact PII from objects
 */
function redactObject(obj: any, depth = 0): any {
  if (depth > 10) return '[MAX_DEPTH]' // Prevent infinite recursion

  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') return redactString(obj)
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, depth + 1))
  }

  if (typeof obj === 'object') {
    const redacted: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Check if field name is sensitive
      if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
        redacted[key] = '[REDACTED]'
      } else if (typeof value === 'string') {
        redacted[key] = redactString(value)
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = redactObject(value, depth + 1)
      } else {
        redacted[key] = value
      }
    }
    return redacted
  }

  return obj
}

/**
 * Format log entry as JSON
 */
function formatLogEntry(entry: LogEntry): string {
  // Redact PII from entire entry
  const redacted = redactObject(entry)
  return JSON.stringify(redacted)
}

/**
 * Logger class
 */
class Logger {
  private context: LogContext = {}

  /**
   * Set global context for all logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {}
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const child = new Logger()
    child.context = { ...this.context, ...context }
    return child
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: (error as any).code,
      }
    }

    const formatted = formatLogEntry(entry)

    // In production, you'd send this to a logging service (Datadog, Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Send to external logging service
      console.log(formatted)
    } else {
      // Pretty print in development
      const colors: Record<LogLevel, string> = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m', // Green
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
      }
      const reset = '\x1b[0m'
      console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`, entry.context || '')
    }
  }

  /**
   * Debug level log
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context)
    }
  }

  /**
   * Info level log
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  /**
   * Warning level log
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  /**
   * Error level log
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error)
  }

  /**
   * Log HTTP request
   */
  request(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, {
      ...context,
      type: 'http_request',
    })
  }

  /**
   * Log HTTP response
   */
  response(method: string, path: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    this.log(level, `${method} ${path} ${status}`, {
      ...context,
      type: 'http_response',
      status,
      duration_ms: duration,
    })
  }

  /**
   * Log with performance timing
   */
  performance(message: string, startTime: number, context?: LogContext): void {
    const duration = Date.now() - startTime
    this.info(message, {
      ...context,
      duration_ms: duration,
    })
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger()

/**
 * Create a request-scoped logger
 */
export function createRequestLogger(request: Request, requestId?: string): Logger {
  const url = new URL(request.url)
  return logger.child({
    requestId: requestId || crypto.randomUUID(),
    method: request.method,
    path: url.pathname,
    userAgent: request.headers.get('user-agent') || undefined,
  })
}

/**
 * Performance timer helper
 */
export function startTimer(): number {
  return Date.now()
}

/**
 * Redact PII from any value (exported for testing/external use)
 */
export function redactPII(value: any): any {
  return redactObject(value)
}

export default logger
