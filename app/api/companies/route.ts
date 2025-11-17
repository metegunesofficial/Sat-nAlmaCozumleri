import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Şirket adı gerekli' },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: {
        name,
      },
    })

    return NextResponse.json({
      success: true,
      data: company,
    })
  } catch (error) {
    console.error('Company create error:', error)
    return NextResponse.json(
      { success: false, error: 'Şirket oluşturulamadı' },
      { status: 500 }
    )
  }
}
