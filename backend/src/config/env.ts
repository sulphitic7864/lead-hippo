import 'dotenv/config';
import path from 'node:path';
import { z } from 'zod';

const boolString = z.string().optional().transform((v) => v === 'true');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number(),
  TRUST_PROXY: z.coerce.number().default(0),
  WEB_URL: z.string().url(),
  CORS_ORIGIN: z.string(),
  DATABASE_URL: z.string().min(1),
  COOKIE_DOMAIN: z.string().optional(),
  SESSION_HOURS: z.coerce.number().int().positive().default(8),
  CHECKOUT_RESERVATION_MINUTES: z.coerce.number().int().min(30).max(1440).default(30),
  LEAD_EXPIRY_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  MAX_FEATURED_LEADS: z.coerce.number().int().min(1).max(10).default(3),
  MAX_SPOTS_PER_LEAD: z.coerce.number().int().min(1).max(3).default(3),
  UPLOAD_DIR: z.string(),
  REPORT_DIR: z.string(),
  PUBLIC_UPLOAD_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_TAX_RATE_ID: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: boolString,
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default('Lead Hippo <leads@leadhippo.ca>'),
  ADMIN_EMAIL: z.string().email().default('leads@leadhippo.ca'),
  SUPPORT_EMAIL: z.string().email().default('leads@leadhippo.ca')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = {
  ...parsed.data,
  uploadDir: path.resolve(process.cwd(), parsed.data.UPLOAD_DIR),
  reportDir: path.resolve(process.cwd(), parsed.data.REPORT_DIR)
};
