
import nodemailer from 'nodemailer';
import type Transporter from 'nodemailer/lib/mailer';
import { env, hasSmtp, isDev } from '../config/env';
import { logger } from '../utils/logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  fullName: string,
): Promise<void> {
  const subject = 'NetCar — איפוס סיסמה';
  const text = [
    `שלום ${fullName},`,
    '',
    'קיבלנו בקשה לאיפוס הסיסמה שלך ב-NetCar.',
    'לחץ על הקישור הבא כדי לבחור סיסמה חדשה (תוקף שעה):',
    '',
    resetUrl,
    '',
    'אם לא ביקשת לאפס את הסיסמה, אפשר להתעלם מהודעה זו.',
    '',
    '— צוות NetCar',
  ].join('\n');

  const html = `
    <div dir="rtl" style="font-family: Heebo, Arial, sans-serif; line-height: 1.6; color: #1e293b;">
      <p>שלום <strong>${escapeHtml(fullName)}</strong>,</p>
      <p>קיבלנו בקשה לאיפוס הסיסמה שלך ב-NetCar.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0f766e;color:#fff;text-decoration:none;border-radius:9999px;font-weight:600;">
          איפוס סיסמה
        </a>
      </p>
      <p style="font-size:14px;color:#64748b;">הקישור תקף לשעה. אם לא ביקשת לאפס את הסיסמה, אפשר להתעלם מהודעה זו.</p>
      <p style="font-size:12px;color:#94a3b8;word-break:break-all;">${resetUrl}</p>
    </div>
  `;

  if (!hasSmtp) {
    logger.warn('SMTP not configured — password reset link logged for development', {
      to,
      resetUrl,
    });
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('\n📧 Password reset link (SMTP not configured):\n', resetUrl, '\n');
    }
    return;
  }

  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });

  logger.info('Password reset email sent', { to });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
