/**
 * Workflow Execution Engine
 * Executes visual workflows and manages workflow instances
 */

import { prisma } from './prisma';
import {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
  ApprovalNodeConfig,
  DecisionNodeConfig,
  NotificationNodeConfig,
  WaitNodeConfig,
  WorkflowInstance,
  WorkflowTask,
} from './workflow-types';
import { sendNotification } from './notifications';

interface ExecutionContext {
  workflowInstanceId: string;
  purchaseRequestId: string;
  companyId: string;
  userId: string;
  variables: Record<string, any>;
  currentNodeId: string;
  completedNodes: string[];
}

/**
 * Start a new workflow instance for a purchase request
 */
export async function startWorkflow(
  workflowId: string,
  purchaseRequestId: string,
  userId: string
): Promise<{ success: boolean; instanceId?: string; error?: string }> {
  try {
    // Get workflow definition
    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { id: workflowId },
      include: { company: true },
    });

    if (!workflow) {
      return { success: false, error: 'Workflow bulunamadı' };
    }

    if (!workflow.isActive) {
      return { success: false, error: 'Workflow aktif değil' };
    }

    if (!workflow.isVisual || !workflow.visualDefinition) {
      return { success: false, error: 'Bu workflow görsel değil' };
    }

    const definition = workflow.visualDefinition as any as WorkflowDefinition;

    // Get purchase request details
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: purchaseRequestId },
      include: {
        requester: true,
        department: true,
        items: true,
      },
    });

    if (!purchaseRequest) {
      return { success: false, error: 'Satın alma talebi bulunamadı' };
    }

    // Find start node
    const startNode = definition.nodes.find((n) => n.type === 'start');
    if (!startNode) {
      return { success: false, error: 'Başlangıç node bulunamadı' };
    }

    // Create workflow instance
    const instance = await prisma.workflowInstance.create({
      data: {
        workflowId,
        purchaseRequestId,
        status: 'RUNNING',
        currentNodeId: startNode.id,
        variables: {
          amount: purchaseRequest.estimatedTotal,
          requesterId: purchaseRequest.requesterId,
          departmentId: purchaseRequest.departmentId,
          priority: purchaseRequest.priority,
          itemCount: purchaseRequest.items.length,
        },
        startedAt: new Date(),
      },
    });

    // Create execution context
    const context: ExecutionContext = {
      workflowInstanceId: instance.id,
      purchaseRequestId,
      companyId: workflow.companyId,
      userId,
      variables: instance.variables as any,
      currentNodeId: startNode.id,
      completedNodes: [],
    };

    // Execute first transition
    await executeNextNode(context, definition);

    return { success: true, instanceId: instance.id };
  } catch (error) {
    console.error('Failed to start workflow:', error);
    return { success: false, error: 'Workflow başlatılamadı' };
  }
}

/**
 * Execute the next node in the workflow
 */
async function executeNextNode(
  context: ExecutionContext,
  definition: WorkflowDefinition
): Promise<void> {
  const currentNode = definition.nodes.find((n) => n.id === context.currentNodeId);
  if (!currentNode) {
    throw new Error(`Node bulunamadı: ${context.currentNodeId}`);
  }

  // Mark current node as completed
  context.completedNodes.push(context.currentNodeId);

  // Update instance
  await prisma.workflowInstance.update({
    where: { id: context.workflowInstanceId },
    data: {
      currentNodeId: context.currentNodeId,
      completedNodeIds: context.completedNodes,
    },
  });

  // Execute node based on type
  switch (currentNode.type) {
    case 'start':
      await executeStartNode(context, definition);
      break;
    case 'approval':
      await executeApprovalNode(context, currentNode, definition);
      break;
    case 'decision':
      await executeDecisionNode(context, currentNode, definition);
      break;
    case 'notification':
      await executeNotificationNode(context, currentNode, definition);
      break;
    case 'wait':
      await executeWaitNode(context, currentNode, definition);
      break;
    case 'end':
      await executeEndNode(context);
      break;
    default:
      console.warn(`Unknown node type: ${currentNode.type}`);
  }
}

/**
 * Execute start node - just transition to next
 */
async function executeStartNode(
  context: ExecutionContext,
  definition: WorkflowDefinition
): Promise<void> {
  const nextNodeId = getNextNodeId(context.currentNodeId, definition);
  if (nextNodeId) {
    context.currentNodeId = nextNodeId;
    await executeNextNode(context, definition);
  }
}

/**
 * Execute approval node - create approval tasks
 */
async function executeApprovalNode(
  context: ExecutionContext,
  node: WorkflowNode,
  definition: WorkflowDefinition
): Promise<void> {
  const config = node.data.config as ApprovalNodeConfig;

  // Get approvers based on config
  const approverIds = await getApprovers(config, context);

  if (approverIds.length === 0) {
    console.warn('No approvers found, skipping approval node');
    // Auto-approve and continue
    const nextNodeId = getNextNodeId(node.id, definition, 'approved');
    if (nextNodeId) {
      context.currentNodeId = nextNodeId;
      await executeNextNode(context, definition);
    }
    return;
  }

  // Create approval tasks
  for (const approverId of approverIds) {
    await prisma.workflowTask.create({
      data: {
        workflowInstanceId: context.workflowInstanceId,
        nodeId: node.id,
        assigneeId: approverId,
        status: 'PENDING',
        dueDate: config.timeoutHours
          ? new Date(Date.now() + config.timeoutHours * 60 * 60 * 1000)
          : null,
      },
    });
  }

  // Send notifications to approvers
  const purchaseRequest = await prisma.purchaseRequest.findUnique({
    where: { id: context.purchaseRequestId },
    include: { requester: true },
  });

  for (const approverId of approverIds) {
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
    });

    if (approver) {
      await sendNotification({
        companyId: context.companyId,
        userId: approver.id,
        channel: 'EMAIL',
        recipient: approver.email,
        templateName: 'TEMPLATE_REQUEST_SUBMITTED',
        variables: {
          approverName: approver.name,
          requesterName: purchaseRequest?.requester.name || 'Unknown',
          requestTitle: `Talep #${context.purchaseRequestId.slice(0, 8)}`,
          amount: context.variables.amount,
          priority: context.variables.priority,
        },
      }).catch((err) => console.error('Failed to send notification:', err));
    }
  }

  // Workflow pauses here until approval decision is made
  await prisma.workflowInstance.update({
    where: { id: context.workflowInstanceId },
    data: { status: 'WAITING_APPROVAL' },
  });
}

/**
 * Execute decision node - evaluate conditions
 */
async function executeDecisionNode(
  context: ExecutionContext,
  node: WorkflowNode,
  definition: WorkflowDefinition
): Promise<void> {
  const config = node.data.config as DecisionNodeConfig;

  // Evaluate conditions
  const result = evaluateConditions(config, context.variables);

  // Get next node based on result
  const nextNodeId = getNextNodeId(node.id, definition, result ? 'true' : 'false');
  if (nextNodeId) {
    context.currentNodeId = nextNodeId;
    await executeNextNode(context, definition);
  }
}

/**
 * Execute notification node - send notification
 */
async function executeNotificationNode(
  context: ExecutionContext,
  node: WorkflowNode,
  definition: WorkflowDefinition
): Promise<void> {
  const config = node.data.config as NotificationNodeConfig;

  // Get recipient
  const recipient = await getNotificationRecipient(config, context);

  if (recipient) {
    await sendNotification({
      companyId: context.companyId,
      channel: config.channel?.toUpperCase() as any || 'EMAIL',
      recipient: recipient.email,
      templateName: config.templateId || 'TEMPLATE_REQUEST_SUBMITTED',
      variables: context.variables,
    }).catch((err) => console.error('Failed to send notification:', err));
  }

  // Continue to next node
  const nextNodeId = getNextNodeId(node.id, definition);
  if (nextNodeId) {
    context.currentNodeId = nextNodeId;
    await executeNextNode(context, definition);
  }
}

/**
 * Execute wait node - schedule continuation
 */
async function executeWaitNode(
  context: ExecutionContext,
  node: WorkflowNode,
  definition: WorkflowDefinition
): Promise<void> {
  const config = node.data.config as WaitNodeConfig;

  // For now, just continue immediately
  // In production, this would schedule a job to continue later
  const nextNodeId = getNextNodeId(node.id, definition);
  if (nextNodeId) {
    context.currentNodeId = nextNodeId;
    await executeNextNode(context, definition);
  }
}

/**
 * Execute end node - complete workflow
 */
async function executeEndNode(context: ExecutionContext): Promise<void> {
  await prisma.workflowInstance.update({
    where: { id: context.workflowInstanceId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // Update purchase request status
  await prisma.purchaseRequest.update({
    where: { id: context.purchaseRequestId },
    data: { status: 'APPROVED' },
  });
}

/**
 * Handle approval decision (approve/reject)
 */
export async function handleApprovalDecision(
  taskId: string,
  approverId: string,
  decision: 'APPROVED' | 'REJECTED',
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get task
    const task = await prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: {
        workflowInstance: {
          include: {
            workflow: true,
            purchaseRequest: {
              include: { requester: true },
            },
          },
        },
      },
    });

    if (!task) {
      return { success: false, error: 'Task bulunamadı' };
    }

    if (task.assigneeId !== approverId) {
      return { success: false, error: 'Bu task size atanmamış' };
    }

    if (task.status !== 'PENDING') {
      return { success: false, error: 'Task zaten tamamlanmış' };
    }

    // Update task
    await prisma.workflowTask.update({
      where: { id: taskId },
      data: {
        status: decision === 'APPROVED' ? 'COMPLETED' : 'REJECTED',
        completedAt: new Date(),
        comment,
      },
    });

    // Get workflow definition
    const definition = task.workflowInstance.workflow.visualDefinition as any as WorkflowDefinition;
    const currentNode = definition.nodes.find((n) => n.id === task.nodeId);

    if (!currentNode) {
      return { success: false, error: 'Node bulunamadı' };
    }

    const config = currentNode.data.config as ApprovalNodeConfig;

    // Check if all required approvals are met
    const allTasks = await prisma.workflowTask.findMany({
      where: {
        workflowInstanceId: task.workflowInstanceId,
        nodeId: task.nodeId,
      },
    });

    const approved = allTasks.filter((t: typeof allTasks[0]) => t.status === 'COMPLETED').length;
    const rejected = allTasks.filter((t: typeof allTasks[0]) => t.status === 'REJECTED').length;
    const total = allTasks.length;

    let shouldContinue = false;
    let nextBranch: 'approved' | 'rejected' = 'approved';

    // Evaluate threshold
    switch (config.approvalThreshold) {
      case 'all':
        if (rejected > 0) {
          shouldContinue = true;
          nextBranch = 'rejected';
        } else if (approved === total) {
          shouldContinue = true;
          nextBranch = 'approved';
        }
        break;
      case 'any':
        if (approved > 0) {
          shouldContinue = true;
          nextBranch = 'approved';
        } else if (rejected === total) {
          shouldContinue = true;
          nextBranch = 'rejected';
        }
        break;
      case 'majority':
        const majorityNeeded = Math.ceil(total / 2);
        if (approved >= majorityNeeded) {
          shouldContinue = true;
          nextBranch = 'approved';
        } else if (rejected >= majorityNeeded) {
          shouldContinue = true;
          nextBranch = 'rejected';
        }
        break;
      case 'count':
        if (approved >= (config.requiredApprovals || 1)) {
          shouldContinue = true;
          nextBranch = 'approved';
        } else if (rejected > total - (config.requiredApprovals || 1)) {
          shouldContinue = true;
          nextBranch = 'rejected';
        }
        break;
      default:
        // Default to 'all'
        if (approved === total) {
          shouldContinue = true;
          nextBranch = 'approved';
        }
    }

    // Continue workflow if threshold is met
    if (shouldContinue) {
      const nextNodeId = getNextNodeId(task.nodeId, definition, nextBranch);

      if (nextNodeId) {
        // Update instance status
        await prisma.workflowInstance.update({
          where: { id: task.workflowInstanceId },
          data: {
            status: 'RUNNING',
            currentNodeId: nextNodeId,
          },
        });

        // Create execution context
        const context: ExecutionContext = {
          workflowInstanceId: task.workflowInstanceId,
          purchaseRequestId: task.workflowInstance.purchaseRequestId,
          companyId: task.workflowInstance.workflow.companyId,
          userId: approverId,
          variables: task.workflowInstance.variables as any,
          currentNodeId: nextNodeId,
          completedNodes: task.workflowInstance.completedNodeIds as string[],
        };

        // Execute next node
        await executeNextNode(context, definition);

        // Send notification to requester
        if (task.workflowInstance.purchaseRequest) {
          await sendNotification({
            companyId: context.companyId,
            userId: task.workflowInstance.purchaseRequest.requester.id,
            channel: 'EMAIL',
            recipient: task.workflowInstance.purchaseRequest.requester.email,
            templateName:
              nextBranch === 'approved'
                ? 'TEMPLATE_REQUEST_APPROVED'
                : 'TEMPLATE_REQUEST_REJECTED',
            variables: {
              requesterName: task.workflowInstance.purchaseRequest.requester.name,
              requestTitle: `Talep #${context.purchaseRequestId.slice(0, 8)}`,
              decision: nextBranch === 'approved' ? 'Onaylandı' : 'Reddedildi',
            },
          }).catch((err) => console.error('Failed to send notification:', err));
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to handle approval decision:', error);
    return { success: false, error: 'Onay işlemi başarısız' };
  }
}

/**
 * Get next node ID following an edge
 */
function getNextNodeId(
  currentNodeId: string,
  definition: WorkflowDefinition,
  sourceHandle?: string
): string | null {
  const edge = definition.edges.find(
    (e: any) =>
      e.source === currentNodeId &&
      (!sourceHandle || e.sourceHandle === sourceHandle)
  ) as any;

  return edge?.target || null;
}

/**
 * Get approvers based on approval node config
 */
async function getApprovers(
  config: ApprovalNodeConfig,
  context: ExecutionContext
): Promise<string[]> {
  switch (config.approverType) {
    case 'role':
      // Get users with specific role
      if (config.approverValue) {
        const users = await prisma.user.findMany({
          where: {
            companyId: context.companyId,
            role: config.approverValue as any,
          },
        });
        return users.map((u: typeof users[0]) => u.id);
      }
      return [];

    case 'user':
      // Specific user ID
      return config.approverValue ? [config.approverValue] : [];

    case 'dynamic':
      // Get from context (e.g., department manager)
      if (config.approverValue === 'department_manager') {
        const request = await prisma.purchaseRequest.findUnique({
          where: { id: context.purchaseRequestId },
          include: { department: { include: { manager: true } } },
        });
        return request?.department?.manager?.id ? [request.department.manager.id] : [];
      }
      return [];

    default:
      return [];
  }
}

/**
 * Get notification recipient based on config
 */
async function getNotificationRecipient(
  config: NotificationNodeConfig,
  context: ExecutionContext
): Promise<{ email: string; name: string } | null> {
  switch (config.recipientType) {
    case 'dynamic':
      // Handle dynamic recipients like 'requester', 'approver', etc.
      if (config.recipientValue === 'requester') {
        const request = await prisma.purchaseRequest.findUnique({
          where: { id: context.purchaseRequestId },
          include: { requester: true },
        });
        return request
          ? { email: request.requester.email, name: request.requester.name }
          : null;
      }
      return null;

    case 'user':
      // Specific user
      if (config.recipientValue) {
        const user = await prisma.user.findUnique({
          where: { id: config.recipientValue },
        });
        return user ? { email: user.email, name: user.name } : null;
      }
      return null;

    case 'custom':
      return config.recipientValue
        ? { email: config.recipientValue, name: 'User' }
        : null;

    default:
      return null;
  }
}

/**
 * Evaluate decision conditions
 */
function evaluateConditions(
  config: DecisionNodeConfig,
  variables: Record<string, any>
): boolean {
  if (!config.conditions || config.conditions.length === 0) {
    return true;
  }

  const results = config.conditions.map((condition) => {
    const value = variables[condition.field];
    const targetValue = condition.value;

    switch (condition.operator) {
      case '==':
        return value == targetValue;
      case '!=':
        return value != targetValue;
      case '>':
        return Number(value) > Number(targetValue);
      case '<':
        return Number(value) < Number(targetValue);
      case '>=':
        return Number(value) >= Number(targetValue);
      case '<=':
        return Number(value) <= Number(targetValue);
      case 'contains':
        return String(value).includes(String(targetValue));
      case 'in':
        return Array.isArray(targetValue) && targetValue.includes(value);
      default:
        return false;
    }
  });

  // Check if any condition uses OR logic, otherwise use AND
  const hasOrLogic = config.conditions.some((c) => c.logicOperator === 'OR');

  if (hasOrLogic) {
    return results.some((r) => r);
  } else {
    // Default to AND
    return results.every((r) => r);
  }
}
