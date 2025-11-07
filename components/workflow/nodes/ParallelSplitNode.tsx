/**
 * Parallel Split Node Component
 * Fork workflow into multiple parallel branches
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode } from '@/lib/workflow-types';
import { GitBranch } from 'lucide-react';

export function ParallelSplitNode({ data, selected }: NodeProps<WorkflowNode['data']>) {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2
        bg-gradient-to-br from-cyan-50 to-cyan-100
        ${selected ? 'border-cyan-600 ring-2 ring-cyan-300' : 'border-cyan-500'}
        transition-all hover:shadow-xl min-w-[180px]
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-600 !border-2 !border-white"
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center flex-shrink-0">
          <GitBranch className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-cyan-900 text-sm">
            {data.label || 'Paralel Başlat'}
          </div>
          <div className="text-xs text-cyan-700 mt-0.5">
            Workflow dallanır
          </div>
        </div>
      </div>

      {/* Multiple output handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output-1"
        className="!w-3 !h-3 !bg-cyan-600 !border-2 !border-white"
        style={{ left: '33%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="output-2"
        className="!w-3 !h-3 !bg-cyan-600 !border-2 !border-white"
        style={{ left: '67%' }}
      />
    </div>
  );
}
