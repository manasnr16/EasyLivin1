/**
 * MAILER
 *
 * Thin nodemailer wrapper for transactional email (password resets, etc).
 * SMTP credentials are optional — if unset, sends are skipped with a
 * warning log instead of throwing, so the app still runs in environments
 * that haven't been given an SMTP account yet.
 */

import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let transporter: nodemailer.Transporter | null = null;
let initialised = false;

function getTransporter(): nodemailer.Transporter | null {
  if (initialised) return transporter;
  initialised = true;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.EMAIL_FROM) {
    logger.warn('SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS/EMAIL_FROM) — outgoing emails will be skipped');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  try {
    await t.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    logger.error('Failed to send email', { to, subject, error: err instanceof Error ? err.message : err });
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  return sendEmail(
    to,
    'Reset your Easy Livin CRM password',
    `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Reset your password</h2>
        <p style="color: #475569; line-height: 1.6;">
          We received a request to reset the password for your Easy Livin Goa CRM account.
          This link expires in 1 hour.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p style="color: #94a3b8; font-size: 13px;">
          If you didn't request this, you can safely ignore this email — your password will not be changed.
        </p>
      </div>
    `
  );
}
