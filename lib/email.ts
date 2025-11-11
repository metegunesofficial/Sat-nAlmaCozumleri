/**
 * Email Notification Service
 *
 * This module provides email sending functionality for the application.
 * To use this in production, install and configure one of these services:
 *
 * Option 1 - Resend (Recommended for Vercel):
 *   npm install resend
 *   Set RESEND_API_KEY in .env
 *
 * Option 2 - Nodemailer (For custom SMTP):
 *   npm install nodemailer
 *   Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in .env
 *
 * Option 3 - SendGrid:
 *   npm install @sendgrid/mail
 *   Set SENDGRID_API_KEY in .env
 */

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

/**
 * Send email using configured email service
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Check if email service is configured
    const emailService = process.env.EMAIL_SERVICE || 'none'

    if (emailService === 'none') {
      console.log('📧 Email would be sent (service not configured):', {
        to: options.to,
        subject: options.subject,
      })
      return true
    }

    // TODO: Implement actual email sending based on EMAIL_SERVICE
    // For now, just log
    console.log('📧 Sending email:', options)

    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

/**
 * Send approval request notification
 */
export async function sendApprovalRequestNotification(
  to: string,
  requesterName: string,
  requestNumber: string,
  requestTitle: string,
  amount: number,
  approvalLink: string
): Promise<boolean> {
  const subject = `Onay Bekleyen Talep: ${requestNumber}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Yeni Onay Talebi</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p><strong>${requesterName}</strong> tarafından yeni bir satın alma talebi oluşturuldu ve onayınızı bekliyor.</p>

          <div class="details">
            <p><strong>Talep No:</strong> ${requestNumber}</p>
            <p><strong>Başlık:</strong> ${requestTitle}</p>
            <p><strong>Tutar:</strong> ${amount.toLocaleString('tr-TR')} TL</p>
          </div>

          <p>Talebi incelemek ve onaylamak için aşağıdaki butona tıklayın:</p>
          <a href="${approvalLink}" class="button">Talebi İncele</a>
        </div>
        <div class="footer">
          <p>Bu otomatik bir bildirimdir. Lütfen yanıtlamayın.</p>
          <p>&copy; ${new Date().getFullYear()} Attelia Dental</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Yeni Onay Talebi

${requesterName} tarafından yeni bir satın alma talebi oluşturuldu ve onayınızı bekliyor.

Talep No: ${requestNumber}
Başlık: ${requestTitle}
Tutar: ${amount.toLocaleString('tr-TR')} TL

Talebi incelemek için: ${approvalLink}
  `

  return sendEmail({ to, subject, html, text })
}

/**
 * Send approval decision notification (approved/rejected)
 */
export async function sendApprovalDecisionNotification(
  to: string,
  requestNumber: string,
  requestTitle: string,
  decision: 'APPROVED' | 'REJECTED' | 'RETURNED',
  approverName: string,
  comments?: string
): Promise<boolean> {
  const decisionText = {
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    RETURNED: 'İade Edildi',
  }[decision]

  const subject = `Talep ${decisionText}: ${requestNumber}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${decision === 'APPROVED' ? '#10b981' : decision === 'REJECTED' ? '#ef4444' : '#f59e0b'}; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Talep ${decisionText}</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p>Satın alma talebiniz <strong>${decisionText}</strong>.</p>

          <div class="details">
            <p><strong>Talep No:</strong> ${requestNumber}</p>
            <p><strong>Başlık:</strong> ${requestTitle}</p>
            <p><strong>Karar Veren:</strong> ${approverName}</p>
            ${comments ? `<p><strong>Açıklama:</strong> ${comments}</p>` : ''}
          </div>

          <p>Detayları görmek için sistem paneline giriş yapabilirsiniz.</p>
        </div>
        <div class="footer">
          <p>Bu otomatik bir bildirimdir. Lütfen yanıtlamayın.</p>
          <p>&copy; ${new Date().getFullYear()} Attelia Dental</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Talep ${decisionText}

Satın alma talebiniz ${decisionText}.

Talep No: ${requestNumber}
Başlık: ${requestTitle}
Karar Veren: ${approverName}
${comments ? `Açıklama: ${comments}` : ''}
  `

  return sendEmail({ to, subject, html, text })
}

/**
 * Send budget warning notification
 */
export async function sendBudgetWarningNotification(
  to: string,
  departmentName: string,
  budgetAmount: number,
  spentAmount: number,
  percentage: number
): Promise<boolean> {
  const subject = `Bütçe Uyarısı: ${departmentName} - %${percentage} Kullanıldı`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Bütçe Uyarısı</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <div class="warning">
            <p><strong>${departmentName}</strong> departmanınızın bütçesinin <strong>%${percentage}</strong>'si kullanıldı.</p>
            <p><strong>Toplam Bütçe:</strong> ${budgetAmount.toLocaleString('tr-TR')} TL</p>
            <p><strong>Harcanan:</strong> ${spentAmount.toLocaleString('tr-TR')} TL</p>
            <p><strong>Kalan:</strong> ${(budgetAmount - spentAmount).toLocaleString('tr-TR')} TL</p>
          </div>
          <p>Lütfen yeni satın alma taleplerinde bütçe durumunu göz önünde bulundurun.</p>
        </div>
        <div class="footer">
          <p>Bu otomatik bir bildirimdir. Lütfen yanıtlamayın.</p>
          <p>&copy; ${new Date().getFullYear()} Attelia Dental</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  resetLink: string
): Promise<boolean> {
  const subject = 'Şifre Sıfırlama Talebi'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .warning { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Şifre Sıfırlama</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p>Şifrenizi sıfırlamak için bir talepte bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
          <a href="${resetLink}" class="button">Şifremi Sıfırla</a>

          <div class="warning">
            <p><strong>Güvenlik Uyarısı:</strong></p>
            <p>Bu linki talep etmediyseniz, bu e-postayı görmezden gelebilirsiniz.</p>
            <p>Link 1 saat içinde geçerliliğini yitireceketir.</p>
          </div>
        </div>
        <div class="footer">
          <p>Bu otomatik bir bildirimdir. Lütfen yanıtlamayın.</p>
          <p>&copy; ${new Date().getFullYear()} Attelia Dental</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}
