/**
 * Wait Node Component
 * Time delay or condition-based waiting
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode, WaitNodeConfig } from '@/lib/workflow-types';
import { Clock } from 'lucide-react';

export function WaitNode({ data, selected }: NodeProps<WorkflowNode['data']>) {
  const config = data.config as WaitNodeConfig;

  const getWaitDescription = () => {
    if (!config.waitType) return 'Bekle';

    switch (config.waitType) {
      case 'duration':
        return `${config.durationHours || 0} saat bekle`;
      case 'until':
        return 'Belirli tarihe kadar';
      case 'condition':
        return 'Koşul sağlanana kadar';
      default:
        return 'Bekle';
    }
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2
        bg-gradient-to-br from-yellow-50 to-yellow-100
        ${selected ? 'border-yellow-600 ring-2 ring-yellow-300' : 'border-yellow-500'}
        transition-all hover:shadow-xl min-w-[180px]
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-yellow-600 !border-2 !border-white"
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center flex-shrink-0">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-yellow-900 text-sm">
            {data.label || 'Bekle'}
          </div>
          <div className="text-xs text-yellow-700 mt-0.5">
            {getWaitDescription()}
          </div>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-yellow-600 !border-2 !border-white"
      />
    </div>
  );
}
