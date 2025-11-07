/**
 * Notification Service
 * High-level service for sending notifications through multiple channels
 */

import { prisma } from './prisma';
import { sendEmail } from './email';
import {
  renderTemplate,
  getEmailLayout,
  TEMPLATE_REQUEST_SUBMITTED,
  TEMPLATE_REQUEST_APPROVED,
  TEMPLATE_REQUEST_REJECTED,
  getPriorityColor,
  formatCurrency,
  formatDate,
} from './email-templates';

export interface NotificationPayload {
  companyId: string;
  userId?: string;
  templateName: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP' | 'PUSH';
  recipient: string; // Email address or phone number
  variables: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Send notification (stores in DB and sends via appropriate channel)
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    // Get template from database (if exists)
    let template = await prisma.notificationTemplate.findUnique({
      where: {
        companyId_name_channel: {
          companyId: payload.companyId,
          name: payload.templateName,
          channel: payload.channel,
        },
      },
    });

    // Fallback to default template
    if (!template) {
      template = getDefaultTemplate(payload.templateName, payload.channel);
    }

    if (!template || !template.isActive) {
      throw new Error(`Template not found or inactive: ${payload.templateName}`);
    }

    // Prepare variables with helpers
    const enrichedVariables = {
      ...payload.variables,
      formatCurrency: (amount: number) => formatCurrency(amount),
      formatDate: (date: Date) => formatDate(date),
      priorityColor: payload.variables.priority
        ? getPriorityColor(payload.variables.priority)
        : '#0070f3',
    };

    // Render template
    const subject = template.subject
      ? renderTemplate(template.subject, enrichedVariables)
      : '';
    const body = renderTemplate(template.body, enrichedVariables);

    // Create log entry
    const log = await prisma.notificationLog.create({
      data: {
        companyId: payload.companyId,
        templateId: template.id,
        userId: payload.userId,
        channel: payload.channel,
        status: 'PENDING',
        recipient: payload.recipient,
        subject,
        body,
        metadata: payload.metadata || {},
      },
    });

    // Send via appropriate channel
    let result: { success: boolean; error?: string } = { success: false };

    switch (payload.channel) {
      case 'EMAIL':
        result = await sendEmailNotification(payload.recipient, subject, body, payload.companyId);
        break;
      case 'SMS':
        // TODO: Implement SMS sending (Twilio/Netgsm)
        result = { success: false, error: 'SMS not implemented yet' };
        break;
      case 'WHATSAPP':
        // TODO: Implement WhatsApp sending
        result = { success: false, error: 'WhatsApp not implemented yet' };
        break;
      case 'IN_APP':
        // TODO: Implement in-app notification
        result = { success: true };
        break;
      case 'PUSH':
        // TODO: Implement push notification
        result = { success: false, error: 'Push not implemented yet' };
        break;
    }

    // Update log status
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : null,
        errorMessage: result.error,
      },
    });

    return {
      success: result.success,
      logId: log.id,
      error: result.error,
    };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email notification with company branding
 */
async function sendEmailNotification(
  to: string,
  subject: string,
  bodyContent: string,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get company settings for logo
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { logo: true },
    });

    // Wrap body in email layout
    const html = getEmailLayout(bodyContent, company?.logo || undefined);

    // Send email
    const result = await sendEmail({
      to,
      subject,
      html,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email send failed',
    };
  }
}

/**
 * Get default system template
 */
function getDefaultTemplate(
  name: string,
  channel: string
): { id: string; subject: string; body: string; isActive: boolean } | null {
  const templates: Record<string, any> = {
    'purchase_request_submitted': TEMPLATE_REQUEST_SUBMITTED,
    'purchase_request_approved': TEMPLATE_REQUEST_APPROVED,
    'purchase_request_rejected': TEMPLATE_REQUEST_REJECTED,
  };

  const template = templates[name];
  if (!template || channel !== 'EMAIL') {
    return null;
  }

  return {
    id: 'default',
    subject: template.subject,
    body: template.body,
    isActive: true,
  };
}

/**
 * Convenience function: Notify approval request
 */
export async function notifyApprovalRequest(data: {
  companyId: string;
  approverEmail: string;
  approverName: string;
  approverId: string;
  requestNumber: string;
  title: string;
  requesterName: string;
  departmentName: string;
  estimatedTotal: number;
  priority: string;
  actionUrl: string;
}) {
  return sendNotification({
    companyId: data.companyId,
    userId: data.approverId,
    templateName: 'purchase_request_submitted',
    channel: 'EMAIL',
    recipient: data.approverEmail,
    variables: {
      approverName: data.approverName,
      requestNumber: data.requestNumber,
      title: data.title,
      requesterName: data.requesterName,
      departmentName: data.departmentName,
      estimatedTotal: formatCurrency(data.estimatedTotal),
      priority: data.priority,
      priorityColor: getPriorityColor(data.priority),
      actionUrl: data.actionUrl,
    },
    metadata: {
      requestNumber: data.requestNumber,
      eventType: 'approval_request',
    },
  });
}

/**
 * Convenience function: Notify approval decision
 */
export async function notifyApprovalDecision(data: {
  companyId: string;
  requesterEmail: string;
  requesterName: string;
  requesterId: string;
  requestNumber: string;
  title: string;
  approverName: string;
  approved: boolean;
  comments?: string;
  actionUrl: string;
}) {
  return sendNotification({
    companyId: data.companyId,
    userId: data.requesterId,
    templateName: data.approved
      ? 'purchase_request_approved'
      : 'purchase_request_rejected',
    channel: 'EMAIL',
    recipient: data.requesterEmail,
    variables: {
      requesterName: data.requesterName,
      requestNumber: data.requestNumber,
      title: data.title,
      approverName: data.approverName,
      approvalDate: formatDate(new Date()),
      comments: data.comments || '',
      actionUrl: data.actionUrl,
    },
    metadata: {
      requestNumber: data.requestNumber,
      eventType: data.approved ? 'request_approved' : 'request_rejected',
    },
  });
}

/**
 * Get notification logs for a user
 */
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}
) {
  const { limit = 50, offset = 0, status } = options;

  return prisma.notificationLog.findMany({
    where: {
      userId,
      ...(status && { status: status as any }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      template: {
        select: {
          displayName: true,
          category: true,
        },
      },
    },
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(logId: string) {
  return prisma.notificationLog.update({
    where: { id: logId },
    data: {
      status: 'READ',
      readAt: new Date(),
    },
  });
}
