import { NextRequest, NextResponse } from 'next/server'
import { getAllCompanies, companies } from '@/lib/seedData'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get all active companies (excluding platform company)
    const activeCompanies = companies
      .filter(c => c.isActive && c.id !== 'attelia-platform')
      .map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        city: c.city
      }))

    return NextResponse.json({
      success: true,
      data: activeCompanies,
    })
  } catch (error) {
    console.error('Companies list error:', error)
    return NextResponse.json(
      { success: false, error: '^irketler yüklenemedi' },
      { status: 500 }
    )
  }
}
