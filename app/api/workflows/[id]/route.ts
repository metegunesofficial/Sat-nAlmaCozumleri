import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Temporarily disabled - needs schema updates
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { success: false, error: 'Bu özellik şu anda devre dışı' },
    { status: 503 }
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { success: false, error: 'Bu özellik şu anda devre dışı' },
    { status: 503 }
  )
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { success: false, error: 'Bu özellik şu anda devre dışı' },
    { status: 503 }
  )
}
