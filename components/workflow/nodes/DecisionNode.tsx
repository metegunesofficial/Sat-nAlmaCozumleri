/**
 * Decision Node Component
 * Conditional branching based on rules
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode, DecisionNodeConfig } from '@/lib/workflow-types';
import { GitBranch, Check, X } from 'lucide-react';

export function DecisionNode({ data, selected }: NodeProps<WorkflowNode['data']>) {
  const config = data.config as DecisionNodeConfig;

  const getConditionSummary = () => {
    if (!config.conditions || config.conditions.length === 0) {
      return 'Koşul belirtilmedi';
    }

    const condition = config.conditions[0];
    return `${condition.field} ${condition.operator} ${condition.value}`;
  };

  const conditionCount = config.conditions?.length || 0;

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2
        bg-gradient-to-br from-blue-50 to-blue-100
        ${selected ? 'border-blue-600 ring-2 ring-blue-300' : 'border-blue-500'}
        transition-all hover:shadow-xl min-w-[200px]
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-600 !border-2 !border-white"
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <GitBranch className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-blue-900 text-sm">
            {data.label || 'Karar Ver'}
          </div>
          <div className="text-xs text-blue-700 mt-0.5 truncate">
            {getConditionSummary()}
          </div>
          {conditionCount > 1 && (
            <div className="text-xs text-blue-600 mt-0.5">
              +{conditionCount - 1} koşul daha
            </div>
          )}
        </div>
      </div>

      {/* Output handles - True and False branches */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-3 !h-3 !bg-green-600 !border-2 !border-white"
        style={{ left: '33%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!w-3 !h-3 !bg-red-600 !border-2 !border-white"
        style={{ left: '67%' }}
      />

      {/* Branch labels */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-around text-xs font-medium">
        <span className="text-green-700 flex items-center gap-1">
          <Check className="w-3 h-3" /> Evet
        </span>
        <span className="text-red-700 flex items-center gap-1">
          <X className="w-3 h-3" /> Hayır
        </span>
      </div>
    </div>
  );
}
