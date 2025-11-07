/**
 * Email Service - Nodemailer SMTP Integration
 * Supports Gmail, SendGrid, and other SMTP providers
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const EMAIL_FROM = {
  address: process.env.EMAIL_FROM || 'noreply@satinalma.com',
  name: process.env.EMAIL_FROM_NAME || 'Satın Alma Platformu',
};

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    // Validate configuration
    if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
      throw new Error(
        'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASSWORD environment variables.'
      );
    }

    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using SMTP
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<EmailResult> {
  try {
    const transport = getTransporter();

    const mailOptions = {
      from: {
        name: EMAIL_FROM.name,
        address: EMAIL_FROM.address,
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments,
    };

    const info = await transport.sendMail(mailOptions);

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    return false;
  }
}

/**
 * Simple HTML tag stripper for plain text fallback
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, '')
    .replace(/<script[^>]*>.*<\/script>/gm, '')
    .replace(/<[^>]+>/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Send test email (for debugging)
 */
export async function sendTestEmail(to: string): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: 'Test Email - Satın Alma Platformu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0070f3;">Test Email</h1>
        <p>Bu bir test emailidir. Email servisiniz doğru çalışıyor!</p>
        <p>Gönderim zamanı: ${new Date().toLocaleString('tr-TR')}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eaeaea;">
        <p style="font-size: 12px; color: #666;">
          Bu email otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.
        </p>
      </div>
    `,
  });
}
