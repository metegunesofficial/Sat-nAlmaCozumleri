/**
 * My Workflow Tasks API
 * GET /api/workflows/tasks/my-tasks - Get current user's pending workflow tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/workflows/tasks/my-tasks
 * Get all pending workflow tasks for the current user
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

    // Get user's pending tasks
    const tasks = await prisma.workflowTask.findMany({
      where: {
        assigneeId: decoded.userId,
        status: 'PENDING',
      },
      include: {
        workflowInstance: {
          include: {
            workflow: {
              select: {
                name: true,
              },
            },
            purchaseRequest: {
              select: {
                id: true,
                requestNumber: true,
                title: true,
                estimatedTotal: true,
                priority: true,
                requester: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format tasks for response
    const formattedTasks = tasks.map((task: typeof tasks[0]) => ({
      id: task.id,
      nodeId: task.nodeId,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      workflow: {
        name: task.workflowInstance.workflow.name,
      },
      purchaseRequest: {
        id: task.workflowInstance.purchaseRequest.id,
        requestNumber: task.workflowInstance.purchaseRequest.requestNumber,
        title: task.workflowInstance.purchaseRequest.title,
        amount: task.workflowInstance.purchaseRequest.estimatedTotal,
        priority: task.workflowInstance.purchaseRequest.priority,
        requester: task.workflowInstance.purchaseRequest.requester,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedTasks,
      count: formattedTasks.length,
    });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Task listesi alınamadı' },
      { status: 500 }
    );
  }
}
