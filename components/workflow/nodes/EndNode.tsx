/**
 * End Node Component
 * Workflow termination point
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode } from '@/lib/workflow-types';
import { CheckCircle2 } from 'lucide-react';

export function EndNode({ data, selected }: NodeProps<WorkflowNode['data']>) {
  return (
    <div
      className={`
        px-6 py-4 rounded-full shadow-lg border-2
        bg-gradient-to-br from-red-50 to-red-100
        ${selected ? 'border-red-600 ring-2 ring-red-300' : 'border-red-500'}
        transition-all hover:shadow-xl
      `}
    >
      {/* Input handle - only one input for End node */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-red-600 !border-2 !border-white"
      />

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-red-900">
            {data.label || 'Bitiş'}
          </div>
          <div className="text-xs text-red-700">Workflow tamamlanır</div>
        </div>
      </div>
    </div>
  );
}
