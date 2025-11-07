/**
 * Workflow Validation Engine
 * Validates workflow structure before saving
 */

import {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './workflow-types';

/**
 * Validate complete workflow definition
 */
export function validateWorkflow(definition: WorkflowDefinition): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Must have exactly one Start node
  const startNodes = definition.nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'error',
      code: 'NO_START_NODE',
      message: 'Workflow must have exactly one Start node',
    });
  } else if (startNodes.length > 1) {
    errors.push({
      type: 'error',
      code: 'MULTIPLE_START_NODES',
      message: 'Workflow must have exactly one Start node',
    });
  }

  // 2. Must have at least one End node
  const endNodes = definition.nodes.filter((n) => n.type === 'end');
  if (endNodes.length === 0) {
    errors.push({
      type: 'error',
      code: 'NO_END_NODE',
      message: 'Workflow must have at least one End node',
    });
  }

  // 3. Check for orphan nodes (not connected)
  const orphanNodes = findOrphanNodes(definition.nodes, definition.edges);
  orphanNodes.forEach((nodeId) => {
    errors.push({
      type: 'error',
      code: 'ORPHAN_NODE',
      message: `Node ${nodeId} is not connected to the workflow`,
      nodeId,
    });
  });

  // 4. Check for cycles (infinite loops)
  if (hasCycles(definition.nodes, definition.edges)) {
    errors.push({
      type: 'error',
      code: 'CYCLE_DETECTED',
      message: 'Workflow contains cycles (infinite loop)',
    });
  }

  // 5. Validate decision nodes have multiple outgoing edges
  definition.nodes
    .filter((n) => n.type === 'decision')
    .forEach((node) => {
      const outgoing = definition.edges.filter((e) => e.source === node.id);
      if (outgoing.length < 2) {
        errors.push({
          type: 'error',
          code: 'INVALID_DECISION_NODE',
          message: `Decision node ${node.id} must have at least 2 outgoing connections`,
          nodeId: node.id,
        });
      }
    });

  // 6. Validate parallel split/join balance
  const splitCount = definition.nodes.filter((n) => n.type === 'parallelSplit').length;
  const joinCount = definition.nodes.filter((n) => n.type === 'parallelJoin').length;
  if (splitCount !== joinCount) {
    warnings.push({
      type: 'warning',
      code: 'UNBALANCED_PARALLEL',
      message: `Unbalanced parallel nodes: ${splitCount} splits vs ${joinCount} joins`,
    });
  }

  // 7. Validate approval nodes have proper configuration
  definition.nodes
    .filter((n) => n.type === 'approval')
    .forEach((node) => {
      const config = node.data.config as any;
      if (!config.approverType || !config.approvalThreshold) {
        errors.push({
          type: 'error',
          code: 'INVALID_APPROVAL_NODE',
          message: `Approval node ${node.id} is missing required configuration`,
          nodeId: node.id,
        });
      }
    });

  // 8. Validate all edges connect valid nodes
  definition.edges.forEach((edge) => {
    const sourceExists = definition.nodes.some((n) => n.id === edge.source);
    const targetExists = definition.nodes.some((n) => n.id === edge.target);

    if (!sourceExists) {
      errors.push({
        type: 'error',
        code: 'INVALID_EDGE_SOURCE',
        message: `Edge ${edge.id} has invalid source node`,
        edgeId: edge.id,
      });
    }

    if (!targetExists) {
      errors.push({
        type: 'error',
        code: 'INVALID_EDGE_TARGET',
        message: `Edge ${edge.id} has invalid target node`,
        edgeId: edge.id,
      });
    }
  });

  // 9. Warn if workflow is too complex
  if (definition.nodes.length > 50) {
    warnings.push({
      type: 'warning',
      code: 'COMPLEX_WORKFLOW',
      message: 'Workflow has more than 50 nodes, consider simplifying',
    });
  }

  // 10. Warn if no approval nodes
  if (!definition.nodes.some((n) => n.type === 'approval')) {
    warnings.push({
      type: 'warning',
      code: 'NO_APPROVAL_NODES',
      message: 'Workflow has no approval nodes',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Find orphan nodes (not connected to workflow)
 */
function findOrphanNodes(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const orphans: string[] = [];

  for (const node of nodes) {
    // Start node doesn't need incoming edges
    if (node.type === 'start') continue;

    // End node doesn't need outgoing edges
    const needsIncoming = node.type !== 'start';
    const needsOutgoing = node.type !== 'end';

    const hasIncoming = edges.some((e) => e.target === node.id);
    const hasOutgoing = edges.some((e) => e.source === node.id);

    if ((needsIncoming && !hasIncoming) || (needsOutgoing && !hasOutgoing)) {
      orphans.push(node.id);
    }
  }

  return orphans;
}

/**
 * Detect cycles in workflow (infinite loops)
 */
function hasCycles(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const startNode = nodes.find((n) => n.type === 'start');
  if (!startNode) return false;

  return detectCycleDFS(startNode.id, edges, visited, recursionStack);
}

function detectCycleDFS(
  nodeId: string,
  edges: WorkflowEdge[],
  visited: Set<string>,
  recursionStack: Set<string>
): boolean {
  visited.add(nodeId);
  recursionStack.add(nodeId);

  // Get all outgoing edges from this node
  const outgoing = edges.filter((e) => e.source === nodeId);

  for (const edge of outgoing) {
    const targetId = edge.target;

    if (!visited.has(targetId)) {
      if (detectCycleDFS(targetId, edges, visited, recursionStack)) {
        return true;
      }
    } else if (recursionStack.has(targetId)) {
      // Found a back edge (cycle)
      return true;
    }
  }

  recursionStack.delete(nodeId);
  return false;
}

/**
 * Validate node configuration
 */
export function validateNodeConfig(node: WorkflowNode): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  switch (node.type) {
    case 'approval':
      const approvalConfig = node.data.config as any;
      if (!approvalConfig.approverType) {
        errors.push({
          type: 'error',
          code: 'MISSING_APPROVER_TYPE',
          message: 'Approval node must specify approver type',
          nodeId: node.id,
        });
      }
      if (!approvalConfig.approvalThreshold) {
        errors.push({
          type: 'error',
          code: 'MISSING_APPROVAL_THRESHOLD',
          message: 'Approval node must specify approval threshold',
          nodeId: node.id,
        });
      }
      if (
        approvalConfig.approvalThreshold === 'count' &&
        !approvalConfig.requiredApprovals
      ) {
        errors.push({
          type: 'error',
          code: 'MISSING_REQUIRED_APPROVALS',
          message: 'Count threshold requires requiredApprovals to be specified',
          nodeId: node.id,
        });
      }
      break;

    case 'decision':
      const decisionConfig = node.data.config as any;
      if (!decisionConfig.conditions || decisionConfig.conditions.length === 0) {
        errors.push({
          type: 'error',
          code: 'MISSING_CONDITIONS',
          message: 'Decision node must have at least one condition',
          nodeId: node.id,
        });
      }
      break;

    case 'notification':
      const notificationConfig = node.data.config as any;
      if (!notificationConfig.channel) {
        errors.push({
          type: 'error',
          code: 'MISSING_CHANNEL',
          message: 'Notification node must specify channel',
          nodeId: node.id,
        });
      }
      if (!notificationConfig.recipientType) {
        errors.push({
          type: 'error',
          code: 'MISSING_RECIPIENT',
          message: 'Notification node must specify recipient type',
          nodeId: node.id,
        });
      }
      break;

    case 'wait':
      const waitConfig = node.data.config as any;
      if (!waitConfig.waitType) {
        errors.push({
          type: 'error',
          code: 'MISSING_WAIT_TYPE',
          message: 'Wait node must specify wait type',
          nodeId: node.id,
        });
      }
      if (waitConfig.waitType === 'duration' && !waitConfig.durationHours) {
        errors.push({
          type: 'error',
          code: 'MISSING_DURATION',
          message: 'Duration wait type requires durationHours',
          nodeId: node.id,
        });
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Quick validation check (for UI feedback)
 */
export function quickValidate(definition: WorkflowDefinition): boolean {
  const hasStart = definition.nodes.some((n) => n.type === 'start');
  const hasEnd = definition.nodes.some((n) => n.type === 'end');
  const hasOrphans = findOrphanNodes(definition.nodes, definition.edges).length > 0;

  return hasStart && hasEnd && !hasOrphans;
}
