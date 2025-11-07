/**
 * Workflow Task Decision API
 * POST /api/workflows/tasks/[taskId]/decide - Approve or reject a workflow task
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { handleApprovalDecision } from '@/lib/workflow-executor';

/**
 * POST /api/workflows/tasks/[taskId]/decide
 * Handle approval decision (approve/reject)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Get token from header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { decision, comment } = body;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz karar' },
        { status: 400 }
      );
    }

    // Handle approval decision
    const result = await handleApprovalDecision(
      params.taskId,
      decoded.userId,
      decision,
      comment
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: decision === 'APPROVED' ? 'Onaylandı' : 'Reddedildi',
    });
  } catch (error) {
    console.error('Failed to process decision:', error);
    return NextResponse.json(
      { success: false, message: 'Karar işlenemedi' },
      { status: 500 }
    );
  }
}
