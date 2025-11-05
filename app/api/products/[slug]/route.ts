import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// DEACTIVATED: Multi-tenant product system requires company context
// This route is temporarily disabled to fix deployment issues
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return NextResponse.json(
    {
      success: false,
      error: 'Product endpoint is currently disabled. Please use multi-tenant product system with company context.'
    },
    { status: 501 }
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return NextResponse.json(
    {
      success: false,
      error: 'Product endpoint is currently disabled. Please use multi-tenant product system with company context.'
    },
    { status: 501 }
  )
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return NextResponse.json(
    {
      success: false,
      error: 'Product endpoint is currently disabled. Please use multi-tenant product system with company context.'
    },
    { status: 501 }
  )
}
