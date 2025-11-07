/**
 * Start Node Component
 * Entry point for every workflow
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode } from '@/lib/workflow-types';
import { Play } from 'lucide-react';

export function StartNode({ data, selected }: NodeProps<WorkflowNode['data']>) {
  return (
    <div
      className={`
        px-6 py-4 rounded-full shadow-lg border-2
        bg-gradient-to-br from-green-50 to-green-100
        ${selected ? 'border-green-600 ring-2 ring-green-300' : 'border-green-500'}
        transition-all hover:shadow-xl
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <div className="font-semibold text-green-900">
            {data.label || 'Başlangıç'}
          </div>
          <div className="text-xs text-green-700">Workflow başlar</div>
        </div>
      </div>

      {/* Output handle - only one output for Start node */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-600 !border-2 !border-white"
      />
    </div>
  );
}
