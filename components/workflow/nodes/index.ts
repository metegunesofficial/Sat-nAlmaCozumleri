/**
 * Workflow Node Components
 * All custom ReactFlow nodes for the visual workflow designer
 */

import { StartNode } from './StartNode';
import { EndNode } from './EndNode';
import { ApprovalNode } from './ApprovalNode';
import { DecisionNode } from './DecisionNode';
import { NotificationNode } from './NotificationNode';
import { WaitNode } from './WaitNode';
import { ParallelSplitNode } from './ParallelSplitNode';
import { ParallelJoinNode } from './ParallelJoinNode';

export { StartNode, EndNode, ApprovalNode, DecisionNode, NotificationNode, WaitNode, ParallelSplitNode, ParallelJoinNode };

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
