/**
 * ENVIRONMENT CONFIG
 *
 * Loads and validates all required environment variables at startup.
 * The app will throw immediately if any required variable is missing,
 * rather than failing silently later at runtime.
 *
 * NEVER import process.env directly elsewhere — always use this module.
 */

import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_BASE_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Client apps (for CORS)
  WEB_URL: z.string().url(),
  CRM_URL: z.string().url(),

  // Cloudinary (image storage) — optional for now, media is stored on local disk
  // until a real Cloudinary account is wired up (see storage.service.ts)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional(),

  // Local media storage
  MEDIA_STORAGE_DIR: z.string().default('uploads'),
  MEDIA_PUBLIC_BASE_URL: z.string().url().optional(),

  // Email (Nodemailer) — optional for now, no SMTP account configured
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_FROM_NAME: z.string().default('Easy Livin Goa'),

  // Optional — Phase 2+ (safe to omit in Phase 1)
  WHATSAPP_PROVIDER_API_KEY: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional(),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const missing = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');

    throw new Error(
      `\n❌ Invalid or missing environment variables:\n${missing}\n\nCheck your .env file.\n`
    );
  }

  return result.data;
}

export const env = loadEnv();
export type Env = typeof env;
