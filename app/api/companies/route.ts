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
  } catch (error) {
    console.error('Company create error:', error)
    return NextResponse.json(
      { success: false, error: 'Şirket oluşturulamadı' },
      { status: 500 }
    )
  }
}
