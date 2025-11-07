/**
 * Workflow Node Components
 * All custom ReactFlow nodes for the visual workflow designer
 */

export { StartNode } from './StartNode';
export { EndNode } from './EndNode';
export { ApprovalNode } from './ApprovalNode';
export { DecisionNode } from './DecisionNode';
export { NotificationNode } from './NotificationNode';
export { WaitNode } from './WaitNode';
export { ParallelSplitNode } from './ParallelSplitNode';
export { ParallelJoinNode } from './ParallelJoinNode';

/**
 * Node type definitions for ReactFlow
 * Maps node type strings to their respective components
 */
export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  approval: ApprovalNode,
  decision: DecisionNode,
  notification: NotificationNode,
  wait: WaitNode,
  parallelSplit: ParallelSplitNode,
  parallelJoin: ParallelJoinNode,
};
