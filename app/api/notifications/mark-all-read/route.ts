import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      )
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: decoded.userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} bildirim okundu olarak işaretlendi`,
      count: result.count,
    })
  } catch (error) {
    console.error('Mark all read error:', error)
    return NextResponse.json(
      { success: false, error: 'İşlem başarısız' },
      { status: 500 }
    )
  }
}
