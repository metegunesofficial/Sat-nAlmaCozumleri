import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// DEACTIVATED: Multi-tenant authentication requires company context
// This route is temporarily disabled to fix deployment issues
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Registration endpoint is currently disabled. Please use multi-tenant registration with company context.'
    },
    { status: 501 }
  )
}
