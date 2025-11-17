import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

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

    // Generate unique slug
    let slug = generateSlug(name)
    let counter = 1

    // Check if slug exists, if so append number
    while (await prisma.company.findUnique({ where: { slug } })) {
      slug = `${generateSlug(name)}-${counter}`
      counter++
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
      },
    })

    return NextResponse.json({
      success: true,
      data: company,
    })
  } catch (error: any) {
    console.error('Company create error:', error)

    // Check if it's a Prisma/database error
    const errorMessage = error?.message || 'Şirket oluşturulamadı'
    const isDatabaseError = errorMessage.includes('table') || errorMessage.includes('relation') || errorMessage.includes('database')

    return NextResponse.json(
      {
        success: false,
        error: isDatabaseError
          ? 'Veritabanı henüz hazır değil. Lütfen birkaç dakika sonra tekrar deneyin.'
          : `Şirket oluşturulamadı: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
