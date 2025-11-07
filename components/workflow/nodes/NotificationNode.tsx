/**
 * Notification Node Component
 * Send notifications via email, SMS, WhatsApp, etc.
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode, NotificationNodeConfig } from '@/lib/workflow-types';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

export function NotificationNode({ data, selected }: NodeProps<WorkflowNode['data']>) {
  const config = data.config as NotificationNodeConfig;

  const getChannelIcon = () => {
    switch (config.channel) {
      case 'email':
        return <Mail className="w-5 h-5 text-white" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-white" />;
      case 'whatsapp':
        return <Smartphone className="w-5 h-5 text-white" />;
      case 'in_app':
        return <Bell className="w-5 h-5 text-white" />;
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  const getChannelLabel = () => {
    switch (config.channel) {
      case 'email':
        return 'E-posta';
      case 'sms':
        return 'SMS';
      case 'whatsapp':
        return 'WhatsApp';
      case 'in_app':
        return 'Uygulama içi';
      default:
        return 'Bildirim';
    }
  };

  const getRecipientDescription = () => {
    if (!config.recipientType) return 'Alıcı belirtilmedi';

    switch (config.recipientType) {
      case 'requester':
        return 'Talep sahibine';
      case 'approver':
        return 'Onaylayıcıya';
      case 'role':
        return `${config.recipientRoles?.[0] || 'Rol'}`;
      case 'user':
        return 'Belirli kullanıcı';
      case 'custom':
        return config.recipientEmails?.[0] || 'Özel alıcı';
      default:
        return 'Alıcı belirtilmedi';
    }
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2
        bg-gradient-to-br from-purple-50 to-purple-100
        ${selected ? 'border-purple-600 ring-2 ring-purple-300' : 'border-purple-500'}
        transition-all hover:shadow-xl min-w-[200px]
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-600 !border-2 !border-white"
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
          {getChannelIcon()}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-purple-900 text-sm">
            {data.label || 'Bildirim Gönder'}
          </div>
          <div className="text-xs text-purple-700 mt-0.5">
            {getChannelLabel()} → {getRecipientDescription()}
          </div>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-purple-600 !border-2 !border-white"
      />
    </div>
  );
}
