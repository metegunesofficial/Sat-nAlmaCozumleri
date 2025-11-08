/**
 * Workflow Type Definitions
 * TypeScript types for visual workflow designer (ReactFlow)
 */

import { Node, Edge } from 'reactflow';

// ============================================
// WORKFLOW DEFINITION
// ============================================

export interface WorkflowDefinition {
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: WorkflowMetadata;
}

export interface WorkflowMetadata {
  name: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// ============================================
// NODE TYPES
// ============================================

export type NodeType =
  | 'start'
  | 'approval'
  | 'decision'
  | 'notification'
  | 'wait'
  | 'parallelSplit'
  | 'parallelJoin'
  | 'end';

export interface WorkflowNode extends Node {
  type: NodeType;
  data: NodeData;
}

export interface NodeData {
  label: string;
  config: NodeConfig;
}

// ============================================
// NODE CONFIGURATIONS
// ============================================

export type NodeConfig =
  | StartNodeConfig
  | ApprovalNodeConfig
  | DecisionNodeConfig
  | NotificationNodeConfig
  | WaitNodeConfig
  | ParallelSplitNodeConfig
  | ParallelJoinNodeConfig
  | EndNodeConfig;

// Start Node
export interface StartNodeConfig {
  type: 'start';
  triggerType: 'manual' | 'auto' | 'scheduled';
  conditions?: Record<string, any>;
}

// Approval Node
export interface ApprovalNodeConfig {
  type: 'approval';
  approverType: 'role' | 'user' | 'dynamic' | 'expression';
  approverValue?: string; // Role name, user ID, or expression
  approvalThreshold: 'all' | 'any' | 'majority' | 'count' | 'weighted';
  requiredApprovals?: number; // For 'count' threshold
  timeoutHours?: number;
  escalationEnabled: boolean;
  escalationHours?: number;
  escalationAction?: 'notify' | 'auto-approve' | 'auto-reject';
  allowDelegation: boolean;
  allowComments: boolean;
}

// Decision Node
export interface DecisionNodeConfig {
  type: 'decision';
  conditions: DecisionCondition[];
  defaultBranch?: string; // Edge ID for else/default case
}

export interface DecisionCondition {
  id: string;
  field: string; // e.g., "amount", "department"
  operator: ComparisonOperator;
  value: any;
  logicOperator?: 'AND' | 'OR'; // For multiple conditions
  branchLabel: string;
  targetEdgeId: string;
}

export type ComparisonOperator =
  | '=='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'contains'
  | 'in'
  | 'exists'
  | 'startsWith'
  | 'endsWith';

// Notification Node
export interface NotificationNodeConfig {
  type: 'notification';
  channel: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';
  recipientType: 'user' | 'role' | 'dynamic' | 'custom';
  recipientValue?: string;
  templateId?: string;
  customMessage?: string;
  variables?: Record<string, string>;
}

// Wait Node
export interface WaitNodeConfig {
  type: 'wait';
  waitType: 'duration' | 'until' | 'event';
  durationHours?: number;
  untilDate?: string;
  eventName?: string;
}

// Parallel Split Node
export interface ParallelSplitNodeConfig {
  type: 'parallelSplit';
  branches: string[]; // Edge IDs
  waitForAll: boolean; // Wait for all branches to complete
}

// Parallel Join Node
export interface ParallelJoinNodeConfig {
  type: 'parallelJoin';
  joinType: 'all' | 'any' | 'count';
  requiredCount?: number; // For 'count' type
}

// End Node
export interface EndNodeConfig {
  type: 'end';
  status: 'approved' | 'rejected' | 'cancelled' | 'completed';
  message?: string;
}

// ============================================
// EDGE (CONNECTION)
// ============================================

export type WorkflowEdge = Edge & {
  label?: string; // For decision branches (e.g., "If amount > 10000")
  data?: EdgeData;
}

export interface EdgeData {
  condition?: string; // Condition expression
  branchType?: 'true' | 'false' | 'default';
}

// ============================================
// WORKFLOW INSTANCE (RUNTIME)
// ============================================

export interface WorkflowInstance {
  id: string;
  templateId: string;
  entityType: string; // 'purchase_request'
  entityId: string;
  status: WorkflowStatus;
  currentNodeId?: string;
  data: Record<string, any>; // Runtime data
  variables: Record<string, any>; // Workflow variables
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export type WorkflowStatus =
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface WorkflowTask {
  id: string;
  instanceId: string;
  nodeId: string;
  nodeType: NodeType;
  assigneeId?: string;
  status: TaskStatus;
  dueDate?: Date;
  completedAt?: Date;
  action?: string; // 'approved', 'rejected', etc.
  comments?: string;
  data?: Record<string, any>;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'error';
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ValidationWarning {
  type: 'warning';
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

// ============================================
// WORKFLOW ANALYTICS
// ============================================

export interface WorkflowAnalytics {
  workflowId: string;
  totalInstances: number;
  completedInstances: number;
  failedInstances: number;
  averageDuration: number; // in hours
  approvalRate: number; // percentage
  bottlenecks: BottleneckInfo[];
}

export interface BottleneckInfo {
  nodeId: string;
  nodeName: string;
  averageWaitTime: number; // in hours
  taskCount: number;
}

// ============================================
// API TYPES
// ============================================

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  departmentIds?: string[];
  definition: WorkflowDefinition;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  departmentIds?: string[];
  definition?: WorkflowDefinition;
  isActive?: boolean;
}

export interface WorkflowResponse {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  minAmount?: number;
  maxAmount?: number;
  departmentIds: string[];
  visualDefinition: WorkflowDefinition;
  version: number;
  createdAt: string;
  updatedAt: string;
}
