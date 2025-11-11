/**
 * Error Handling Utilities
 *
 * This module provides consistent error handling across the application.
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Kimlik doğrulama başarısız') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Bu işlem için yetkiniz yok') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string = 'Kayıt') {
    super(`${entity} bulunamadı`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

/**
 * Error response helper for API routes
 */
export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      ...(error instanceof ValidationError && error.fields ? { fields: error.fields } : {}),
      statusCode: error.statusCode,
    }
  }

  // Default error response
  console.error('Unhandled error:', error)
  return {
    success: false,
    error: 'Bir hata oluştu',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  }
}

/**
 * Try-catch wrapper for async functions
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<[T | null, Error | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    const err = error instanceof Error ? error : new Error(errorMessage || 'Unknown error')
    return [null, err]
  }
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  required: string[]
): void {
  const missing = required.filter(field => !data[field])

  if (missing.length > 0) {
    throw new ValidationError(
      'Gerekli alanlar eksik',
      Object.fromEntries(missing.map(field => [field, 'Bu alan gereklidir']))
    )
  }
}

/**
 * Error messages in Turkish
 */
export const ErrorMessages = {
  // Authentication
  INVALID_CREDENTIALS: 'Geçersiz email veya şifre',
  TOKEN_REQUIRED: 'Token gerekli',
  INVALID_TOKEN: 'Geçersiz token',
  TOKEN_EXPIRED: 'Token süresi dolmuş',

  // Authorization
  UNAUTHORIZED: 'Bu işlem için yetkiniz yok',
  INSUFFICIENT_PERMISSIONS: 'Yetersiz izin',

  // Validation
  REQUIRED_FIELD: 'Bu alan gereklidir',
  INVALID_EMAIL: 'Geçersiz email adresi',
  INVALID_PHONE: 'Geçersiz telefon numarası',
  PASSWORD_TOO_SHORT: 'Şifre en az 8 karakter olmalıdır',
  PASSWORDS_DONT_MATCH: 'Şifreler eşleşmiyor',

  // Not Found
  USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  PRODUCT_NOT_FOUND: 'Ürün bulunamadı',
  REQUEST_NOT_FOUND: 'Talep bulunamadı',
  DEPARTMENT_NOT_FOUND: 'Departman bulunamadı',
  CATEGORY_NOT_FOUND: 'Kategori bulunamadı',

  // Business Logic
  INSUFFICIENT_BUDGET: 'Yetersiz bütçe',
  INSUFFICIENT_STOCK: 'Yetersiz stok',
  WORKFLOW_NOT_FOUND: 'Onay iş akışı bulunamadı',
  ALREADY_APPROVED: 'Bu talep zaten onaylanmış',
  ALREADY_REJECTED: 'Bu talep zaten reddedilmiş',
  CANNOT_APPROVE_OWN_REQUEST: 'Kendi talebinizi onaylayamazsınız',

  // Generic
  SOMETHING_WENT_WRONG: 'Bir hata oluştu',
  DATABASE_ERROR: 'Veritabanı hatası',
  NETWORK_ERROR: 'Ağ hatası',
}

/**
 * Example usage in API routes:
 *
 * import { AppError, AuthenticationError, errorResponse } from '@/lib/errors'
 *
 * try {
 *   if (!token) {
 *     throw new AuthenticationError(ErrorMessages.TOKEN_REQUIRED)
 *   }
 *
 *   const user = await prisma.user.findUnique({ where: { id } })
 *   if (!user) {
 *     throw new NotFoundError('Kullanıcı')
 *   }
 *
 *   return NextResponse.json({ success: true, data: user })
 * } catch (error) {
 *   const { statusCode, ...errorData } = errorResponse(error)
 *   return NextResponse.json(errorData, { status: statusCode })
 * }
 */
