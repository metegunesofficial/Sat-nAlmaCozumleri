/**
 * Email Template Engine
 * Simple variable replacement with {{variable}} syntax
 */

export interface TemplateVariables {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Render email template with variables
 * Supports nested variables: {{user.name}}, {{request.title}}
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(variables, path.trim());
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Get nested object value by path (e.g., "user.name")
 */
function getNestedValue(
  obj: TemplateVariables,
  path: string
): string | number | boolean | null | undefined {
  return path.split('.').reduce((current: any, key: string) => {
    return current?.[key];
  }, obj);
}

/**
 * Pre-defined email templates
 */

// Base HTML wrapper for all emails
export function getEmailLayout(content: string, companyLogo?: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); padding: 30px; text-align: center;">
              ${
                companyLogo
                  ? `<img src="${companyLogo}" alt="Logo" style="max-width: 150px; height: auto; margin-bottom: 10px;">`
                  : `<h1 style="margin: 0; color: #ffffff; font-size: 24px;">Satın Alma Platformu</h1>`
              }
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280;">
                Bu email otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Satın Alma Platformu. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * TEMPLATE: Purchase Request Submitted
 */
export const TEMPLATE_REQUEST_SUBMITTED = {
  subject: 'Yeni Satın Alma Talebi: {{requestNumber}}',
  body: `
    <h2 style="color: #111827; margin: 0 0 20px 0;">Yeni Satın Alma Talebi Oluşturuldu</h2>

    <p style="color: #374151; font-size: 14px; line-height: 1.6;">
      Merhaba <strong>{{approverName}}</strong>,
    </p>

    <p style="color: #374151; font-size: 14px; line-height: 1.6;">
      <strong>{{requesterName}}</strong> tarafından yeni bir satın alma talebi oluşturuldu ve onayınızı bekliyor.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background-color: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Talep No:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{requestNumber}}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Başlık:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{title}}</td>
      </tr>
      <tr style="background-color: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Talep Eden:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{requesterName}}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Departman:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{departmentName}}</td>
      </tr>
      <tr style="background-color: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Toplam Tutar:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827; font-weight: 600;">{{estimatedTotal}} TL</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Öncelik:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background-color: {{priorityColor}}; color: #ffffff;">
            {{priority}}
          </span>
        </td>
      </tr>
    </table>

    <div style="margin: 30px 0; text-align: center;">
      <a href="{{actionUrl}}" style="display: inline-block; background-color: #0070f3; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px;">
        Talebi İncele ve Onayla
      </a>
    </div>

    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <strong>Not:</strong> Lütfen talebi en kısa sürede değerlendirin. Onay bekleyen talepler iş akışını yavaşlatabilir.
    </p>
  `,
};

/**
 * TEMPLATE: Purchase Request Approved
 */
export const TEMPLATE_REQUEST_APPROVED = {
  subject: 'Satın Alma Talebiniz Onaylandı: {{requestNumber}}',
  body: `
    <h2 style="color: #059669; margin: 0 0 20px 0;">✅ Satın Alma Talebiniz Onaylandı</h2>

    <p style="color: #374151; font-size: 14px; line-height: 1.6;">
      Merhaba <strong>{{requesterName}}</strong>,
    </p>

    <p style="color: #374151; font-size: 14px; line-height: 1.6;">
      <strong>{{requestNumber}}</strong> numaralı satın alma talebiniz <strong>{{approverName}}</strong> tarafından onaylandı.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background-color: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Talep No:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{requestNumber}}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Başlık:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{title}}</td>
      </tr>
      <tr style="background-color: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Onaylayan:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{approverName}}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Onay Tarihi:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{approvalDate}}</td>
      </tr>
      {{#if comments}}
      <tr style="background-color: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Yorum:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827; font-style: italic;">{{comments}}</td>
      </tr>
      {{/if}}
    </table>

    <div style="margin: 30px 0; text-align: center;">
      <a href="{{actionUrl}}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px;">
        Talebi Görüntüle
      </a>
    </div>

    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Satın alma sürecinin sonraki adımları için bilgilendirileceksiniz.
    </p>
  `,
};

/**
 * TEMPLATE: Purchase Request Rejected
 */
export const TEMPLATE_REQUEST_REJECTED = {
  subject: 'Satın Alma Talebiniz Reddedildi: {{requestNumber}}',
  body: `
    <h2 style="color: #dc2626; margin: 0 0 20px 0;">❌ Satın Alma Talebiniz Reddedildi</h2>

    <p style="color: #374151; font-size: 14px; line-height: 1.6;">
      Merhaba <strong>{{requesterName}}</strong>,
    </p>

    <p style="color: #374151; font-size: 14px; line-height: 1.6;">
      Maalesef <strong>{{requestNumber}}</strong> numaralı satın alma talebiniz <strong>{{approverName}}</strong> tarafından reddedildi.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background-color: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Talep No:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{requestNumber}}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Başlık:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{title}}</td>
      </tr>
      <tr style="background-color: #f9fafb;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Reddeden:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{approverName}}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Red Tarihi:</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">{{approvalDate}}</td>
      </tr>
      {{#if comments}}
      <tr style="background-color: #fef2f2;">
        <td style="padding: 12px; border: 1px solid #fecaca; font-weight: 600; color: #991b1b;">Red Sebebi:</td>
        <td style="padding: 12px; border: 1px solid #fecaca; color: #991b1b; font-style: italic;">{{comments}}</td>
      </tr>
      {{/if}}
    </table>

    <div style="margin: 30px 0; text-align: center;">
      <a href="{{actionUrl}}" style="display: inline-block; background-color: #6b7280; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px;">
        Talebi Görüntüle
      </a>
    </div>

    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Talebi gözden geçirip gerekli değişikliklerle yeniden gönderebilirsiniz.
    </p>
  `,
};

/**
 * Helper: Get priority badge color
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    URGENT: '#dc2626',
    HIGH: '#ea580c',
    NORMAL: '#0070f3',
    LOW: '#059669',
  };
  return colors[priority] || '#6b7280';
}

/**
 * Helper: Format currency
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Helper: Format date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}
