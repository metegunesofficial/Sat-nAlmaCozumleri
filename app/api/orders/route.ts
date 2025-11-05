import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// DEACTIVATED: Multi-tenant order system requires company context
// This route is temporarily disabled to fix deployment issues
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Orders endpoint is currently disabled. Please use multi-tenant order system with company context.'
    },
    { status: 501 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Orders endpoint is currently disabled. Please use multi-tenant order system with company context.'
    },
    { status: 501 }
  )
}
