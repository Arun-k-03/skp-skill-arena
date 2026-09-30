import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().optional().default(''),
    UPSTASH_REDIS_REST_URL: z.string().optional().default(''),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(''),
    SESSION_SECRET: z.string().default(''),
    CSRF_SECRET: z.string().default(''),
    ADMIN_EMAIL: z.string().default(''),
    ADMIN_PASSWORD: z.string().default(''),
    STORAGE_ENDPOINT: z.string().optional().default(''),
    STORAGE_ACCESS_KEY: z.string().optional().default(''),
    STORAGE_SECRET_KEY: z.string().optional().default(''),
    STORAGE_BUCKET: z.string().optional().default('skill-arena-assets'),
    CORS_ORIGIN: z.string().optional().default('http://localhost:3000'),
  })
  .transform((data) => {
    // Apply development defaults only if not in production
    if (data.NODE_ENV !== 'production') {
      if (!data.ADMIN_EMAIL) data.ADMIN_EMAIL = 'admin@skp2026.edu.in';
      if (!data.ADMIN_PASSWORD) data.ADMIN_PASSWORD = 'admin_dev_passkey_2026';
      if (!data.SESSION_SECRET) data.SESSION_SECRET = 'skp_skill_arena_dev_session_secret_at_least_32_chars_long';
      if (!data.CSRF_SECRET) data.CSRF_SECRET = 'skp_skill_arena_dev_csrf_secret_at_least_32_chars_long';
    }
    return data;
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (!data.DATABASE_URL || data.DATABASE_URL.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message: 'DATABASE_URL is required in production. PostgreSQL connection is mandatory.',
        });
      }
      if (!data.ADMIN_EMAIL || data.ADMIN_EMAIL.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ADMIN_EMAIL'],
          message: 'ADMIN_EMAIL is required in production.',
        });
      }
      if (!data.ADMIN_PASSWORD || data.ADMIN_PASSWORD.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ADMIN_PASSWORD'],
          message: 'ADMIN_PASSWORD is required in production.',
        });
      }
      if (!data.SESSION_SECRET || data.SESSION_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['SESSION_SECRET'],
          message: 'SESSION_SECRET must be at least 32 characters in production.',
        });
      }
      if (!data.CSRF_SECRET || data.CSRF_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CSRF_SECRET'],
          message: 'CSRF_SECRET must be at least 32 characters in production.',
        });
      }
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Environment variable validation failed');
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;

