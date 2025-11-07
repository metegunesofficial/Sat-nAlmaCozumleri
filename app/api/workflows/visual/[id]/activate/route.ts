/**
 * Visual Workflow Activation API
 * POST /api/workflows/visual/[id]/activate - Toggle workflow active status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { validateWorkflow } from '@/lib/workflow-validator';

/**
 * POST /api/workflows/visual/[id]/activate
 * Activate or deactivate a workflow
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        companyId: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    if (user.role !== 'COMPANY_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Get workflow
    const workflow = await prisma.approvalWorkflow.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
        isVisual: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { success: false, message: 'Workflow bulunamadı' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { isActive } = body;

    // If activating, validate the workflow first
    if (isActive && workflow.visualDefinition) {
      const validationResult = validateWorkflow(workflow.visualDefinition as any);
      if (!validationResult.valid) {
        return NextResponse.json(
          {
            success: false,
            message: 'Workflow geçersiz olduğu için aktif hale getirilemez',
            errors: validationResult.errors,
          },
          { status: 400 }
        );
      }
    }

    // Update workflow active status
    const updatedWorkflow = await prisma.approvalWorkflow.update({
      where: { id: params.id },
      data: {
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedWorkflow,
      message: isActive
        ? 'Workflow aktif hale getirildi'
        : 'Workflow devre dışı bırakıldı',
    });
  } catch (error) {
    console.error('Failed to toggle workflow status:', error);
    return NextResponse.json(
      { success: false, message: 'Workflow durumu değiştirilemedi' },
      { status: 500 }
    );
  }
}
