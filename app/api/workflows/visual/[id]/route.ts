/**
 * Visual Workflow API - Single Workflow Operations
 * GET    /api/workflows/visual/[id] - Get workflow by ID
 * PUT    /api/workflows/visual/[id] - Update workflow
 * DELETE /api/workflows/visual/[id] - Delete workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { WorkflowDefinition, UpdateWorkflowRequest } from '@/lib/workflow-types';
import { validateWorkflow } from '@/lib/workflow-validator';

/**
 * GET /api/workflows/visual/[id]
 * Get single workflow by ID
 */
export async function GET(
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

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { companyId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Fetch workflow
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

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('Failed to fetch workflow:', error);
    return NextResponse.json(
      { success: false, message: 'Workflow alınamadı' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/visual/[id]
 * Update workflow
 */
export async function PUT(
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

    // Check if workflow exists and belongs to company
    const existingWorkflow = await prisma.approvalWorkflow.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
        isVisual: true,
      },
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        { success: false, message: 'Workflow bulunamadı' },
        { status: 404 }
      );
    }

    // Parse request body
    const body: UpdateWorkflowRequest = await request.json();
    const { name, description, definition } = body;

    // If definition is provided, validate it
    if (definition) {
      const validationResult = validateWorkflow(definition);
      if (!validationResult.valid) {
        return NextResponse.json(
          {
            success: false,
            message: 'Workflow geçersiz',
            errors: validationResult.errors,
          },
          { status: 400 }
        );
      }
    }

    // Update workflow
    const updatedWorkflow = await prisma.approvalWorkflow.update({
      where: { id: params.id },
      data: {
        name: name || existingWorkflow.name,
        description: description !== undefined ? description : existingWorkflow.description,
        visualDefinition: definition ? (definition as any) : existingWorkflow.visualDefinition,
        version: definition ? existingWorkflow.version + 1 : existingWorkflow.version,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedWorkflow,
      message: 'Workflow başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Failed to update workflow:', error);
    return NextResponse.json(
      { success: false, message: 'Workflow güncellenemedi' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/visual/[id]
 * Delete workflow
 */
export async function DELETE(
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

    // Check if workflow exists and belongs to company
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

    // Check if workflow is active
    if (workflow.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Aktif workflow silinemez. Önce devre dışı bırakın.',
        },
        { status: 400 }
      );
    }

    // Delete workflow
    await prisma.approvalWorkflow.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow başarıyla silindi',
    });
  } catch (error) {
    console.error('Failed to delete workflow:', error);
    return NextResponse.json(
      { success: false, message: 'Workflow silinemedi' },
      { status: 500 }
    );
  }
}
