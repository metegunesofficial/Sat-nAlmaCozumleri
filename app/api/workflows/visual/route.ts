/**
 * Visual Workflow API - List & Create
 * GET  /api/workflows/visual - List all visual workflows
 * POST /api/workflows/visual - Create new visual workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { WorkflowDefinition, CreateWorkflowRequest } from '@/lib/workflow-types';
import { validateWorkflow } from '@/lib/workflow-validator';

/**
 * GET /api/workflows/visual
 * List all visual workflows for the company
 */
export async function GET(request: NextRequest) {
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

    // Fetch all visual workflows for the company
    const workflows = await prisma.approvalWorkflow.findMany({
      where: {
        companyId: user.companyId,
        isVisual: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        version: true,
        visualDefinition: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    return NextResponse.json(
      { success: false, message: 'Workflow listesi alınamadı' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/visual
 * Create new visual workflow
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body: CreateWorkflowRequest = await request.json();
    const { name, description, definition } = body;

    // Validate workflow definition
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

    // Create workflow in database
    const workflow = await prisma.approvalWorkflow.create({
      data: {
        companyId: user.companyId,
        name,
        description: description || null,
        version: 1,
        isVisual: true,
        visualDefinition: definition as any,
        isActive: false, // Start as inactive
      },
    });

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow başarıyla oluşturuldu',
    });
  } catch (error) {
    console.error('Failed to create workflow:', error);
    return NextResponse.json(
      { success: false, message: 'Workflow oluşturulamadı' },
      { status: 500 }
    );
  }
}
