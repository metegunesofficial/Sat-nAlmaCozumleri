/**
 * Performance Utilities
 *
 * This module provides performance optimization helpers including
 * simple in-memory caching and query optimization.
 *
 * For production, consider using Redis for caching.
 */

// Simple in-memory cache
class MemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map()

  set(key: string, value: any, ttlSeconds: number = 300): void {
    const expiry = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { value, expiry })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const cache = new MemoryCache()

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}

/**
 * Cached function wrapper
 */
export function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Check cache first
      const cached = cache.get<T>(key)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // Execute function
      const result = await fn()

      // Store in cache
      cache.set(key, result, ttlSeconds)

      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Measure function execution time
 */
export async function measure<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    console.log(`⏱️ ${label}: ${duration}ms`)
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.log(`⏱️ ${label} (failed): ${duration}ms`)
    throw error
  }
}

/**
 * Batch requests to avoid N+1 queries
 */
export class DataLoader<K, V> {
  private batch: K[] = []
  private cache: Map<K, V> = new Map()
  private batchTimeout: NodeJS.Timeout | null = null

  constructor(
    private batchLoadFn: (keys: K[]) => Promise<V[]>,
    private maxBatchSize: number = 100,
    private batchDelay: number = 10
  ) {}

  async load(key: K): Promise<V | undefined> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    return new Promise((resolve) => {
      this.batch.push(key)

      if (this.batch.length >= this.maxBatchSize) {
        this.executeBatch()
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.executeBatch(), this.batchDelay)
      }

      // Wait for batch to complete
      const checkCache = () => {
        if (this.cache.has(key)) {
          resolve(this.cache.get(key))
        } else {
          setTimeout(checkCache, 5)
        }
      }
      checkCache()
    })
  }

  private async executeBatch() {
    if (this.batch.length === 0) return

    const currentBatch = [...this.batch]
    this.batch = []
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }

    try {
      const results = await this.batchLoadFn(currentBatch)

      // Store results in cache
      currentBatch.forEach((key, index) => {
        if (results[index]) {
          this.cache.set(key, results[index])
        }
      })
    } catch (error) {
      console.error('Batch load error:', error)
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export function paginate<T>(
  data: T[],
  params: PaginationParams
): PaginatedResult<T> {
  const { page, pageSize } = params
  const total = data.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    data: data.slice(start, end),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  }
}

/**
 * Example usage:
 *
 * // Caching
 * const categories = await cached('categories:all', async () => {
 *   return await prisma.category.findMany()
 * }, 600) // 10 minutes
 *
 * // Measure performance
 * const result = await measure('Fetch users', async () => {
 *   return await prisma.user.findMany()
 * })
 *
 * // Data loader (avoid N+1)
 * const userLoader = new DataLoader(async (ids) => {
 *   return await prisma.user.findMany({
 *     where: { id: { in: ids } }
 *   })
 * })
 *
 * // Debounce search
 * const debouncedSearch = debounce((query) => {
 *   // Search API call
 * }, 300)
 */
