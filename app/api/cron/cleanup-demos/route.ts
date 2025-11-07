import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cron/cleanup-demos
 *
 * Vercel Cron job to cleanup old demo tenants
 * Secured with CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get cleanup threshold (default: 7 days)
    const cleanupDays = parseInt(process.env.DEMO_CLEANUP_DAYS || '7')
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() - cleanupDays)

    // Find expired demo companies
    const expiredDemos = await prisma.company.findMany({
      where: {
        isDemo: true,
        createdAt: {
          lt: thresholdDate,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    })

    if (expiredDemos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired demo tenants to cleanup',
        cleaned: 0,
      })
    }

    // Delete each demo company (cascade delete handles relations)
    const deletedIds: string[] = []

    for (const demo of expiredDemos) {
      try {
        await prisma.company.delete({
          where: { id: demo.id },
        })

        deletedIds.push(demo.id)

        // Log cleanup
        await audit.log({
          action: 'demo.cleanup',
          resource: `Company:${demo.id}`,
          metadata: {
            companyName: demo.name,
            slug: demo.slug,
            createdAt: demo.createdAt,
            daysOld: Math.floor(
              (Date.now() - demo.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            ),
          },
        })
      } catch (error) {
        console.error(`Failed to delete demo company ${demo.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedIds.length} expired demo tenants`,
      cleaned: deletedIds.length,
      total: expiredDemos.length,
      deletedIds,
    })
  } catch (error: any) {
    console.error('Demo cleanup error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Demo cleanup failed',
      },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const cleanupDays = parseInt(process.env.DEMO_CLEANUP_DAYS || '7')
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - cleanupDays)

  const expiredDemos = await prisma.company.findMany({
    where: {
      isDemo: true,
      createdAt: {
        lt: thresholdDate,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
          products: true,
          purchaseRequests: true,
        },
      },
    },
  })

  return NextResponse.json({
    success: true,
    expiredDemos,
    count: expiredDemos.length,
    thresholdDate,
  })
}
