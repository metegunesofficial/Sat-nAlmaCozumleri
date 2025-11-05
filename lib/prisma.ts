import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

// Create Prisma client with error handling for build time
let prismaInstance: PrismaClient | undefined

try {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }
} catch (error) {
  console.warn('Prisma client initialization failed (this is expected during build):', error)
}

export const prisma = prismaInstance as PrismaClient
