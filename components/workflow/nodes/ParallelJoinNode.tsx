/**
 * Parallel Join Node Component
 * Merge multiple parallel branches back into one
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode } from '@/lib/workflow-types';
import { GitMerge } from 'lucide-react';

export function ParallelJoinNode({ data, selected }: NodeProps<WorkflowNode['data']>) {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2
        bg-gradient-to-br from-teal-50 to-teal-100
        ${selected ? 'border-teal-600 ring-2 ring-teal-300' : 'border-teal-500'}
        transition-all hover:shadow-xl min-w-[180px]
      `}
    >
      {/* Multiple input handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="input-1"
        className="!w-3 !h-3 !bg-teal-600 !border-2 !border-white"
        style={{ left: '33%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="input-2"
        className="!w-3 !h-3 !bg-teal-600 !border-2 !border-white"
        style={{ left: '67%' }}
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
          <GitMerge className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-teal-900 text-sm">
            {data.label || 'Paralel Birleştir'}
          </div>
          <div className="text-xs text-teal-700 mt-0.5">
            Tüm dalları bekle
          </div>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-teal-600 !border-2 !border-white"
      />
    </div>
  );
}
