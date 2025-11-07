/**
 * Approval Node Component
 * Most complex node - handles approvals with various threshold rules
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode, ApprovalNodeConfig } from '@/lib/workflow-types';
import { UserCheck, Users, User, Clock } from 'lucide-react';

export function ApprovalNode({ data, selected }: NodeProps<WorkflowNode['data']>) {
  const config = data.config as ApprovalNodeConfig;

  const getApproverIcon = () => {
    switch (config.approverType) {
      case 'role':
        return <Users className="w-5 h-5 text-white" />;
      case 'user':
        return <User className="w-5 h-5 text-white" />;
      case 'dynamic':
        return <UserCheck className="w-5 h-5 text-white" />;
      default:
        return <UserCheck className="w-5 h-5 text-white" />;
    }
  };

  const getApproverDescription = () => {
    if (!config.approverType) return 'Onaylayıcı belirtilmedi';

    switch (config.approverType) {
      case 'role':
        return config.approverValue || 'Rol seçilmedi';
      case 'user':
        return 'Belirli kullanıcı';
      case 'dynamic':
        return 'Dinamik (örn: Yönetici)';
      case 'expression':
        return 'Formül ile belirlenir';
      default:
        return 'Onaylayıcı belirtilmedi';
    }
  };

  const getThresholdDescription = () => {
    if (!config.approvalThreshold) return '';

    switch (config.approvalThreshold) {
      case 'all':
        return 'Tümü onaylamalı';
      case 'any':
        return 'Herhangi biri';
      case 'majority':
        return 'Çoğunluk (%50+)';
      case 'count':
        return `${config.requiredApprovals || 1} kişi`;
      case 'weighted':
        return 'Ağırlıklı oy';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2
        bg-gradient-to-br from-indigo-50 to-indigo-100
        ${selected ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-indigo-500'}
        transition-all hover:shadow-xl min-w-[220px]
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-600 !border-2 !border-white"
      />

      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            {getApproverIcon()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-indigo-900 text-sm">
              {data.label || 'Onay Al'}
            </div>
            <div className="text-xs text-indigo-700 mt-0.5">
              {getApproverDescription()}
            </div>
          </div>
        </div>

        {/* Threshold info */}
        {config.approvalThreshold && (
          <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
            {getThresholdDescription()}
          </div>
        )}

        {/* Timeout indicator */}
        {config.timeoutHours && config.timeoutHours > 0 && (
          <div className="flex items-center gap-1 text-xs text-indigo-600">
            <Clock className="w-3 h-3" />
            <span>{config.timeoutHours} saat</span>
          </div>
        )}

        {/* Escalation indicator */}
        {config.escalationEnabled && (
          <div className="text-xs text-orange-600 font-medium">
            ⚠ Eskalasyon aktif
          </div>
        )}
      </div>

      {/* Output handles - Approved and Rejected branches */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="approved"
        className="!w-3 !h-3 !bg-green-600 !border-2 !border-white"
        style={{ left: '33%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="rejected"
        className="!w-3 !h-3 !bg-red-600 !border-2 !border-white"
        style={{ left: '67%' }}
      />

      {/* Branch labels */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-around text-xs font-medium">
        <span className="text-green-700">✓ Onay</span>
        <span className="text-red-700">✗ Red</span>
      </div>
    </div>
  );
}
