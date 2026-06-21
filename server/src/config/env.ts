
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3002),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  MONGO_URI: z
    .string()
    .min(1, 'MONGO_URI is required')
    .refine(
      (s) => s.startsWith('mongodb://') || s.startsWith('mongodb+srv://'),
      'MONGO_URI must be a valid MongoDB connection string',
    )
    .default('mongodb://127.0.0.1:27017/netcar'),

  CATALOG_SYNC_HOURS: z.coerce.number().nonnegative().default(24),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET is too short'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET is too short'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  GOV_API_BASE: z
    .string()
    .url()
    .default('https://data.gov.il/api/3/action/datastore_search'),
  GOV_RESOURCE_ID: z
    .string()
    .default('053cea08-09bc-40ec-8f7a-156f0677aff3'),
  
  GOV_PRICE_RESOURCE_ID: z
    .string()
    .default('39f455bf-6db0-4926-859d-017f34eacbcb'),
  
  GOV_SPECS_RESOURCE_ID: z
    .string()
    .default('142afde2-6228-49f9-8a29-9b6c3a0cbe40'),
  GOV_PAGE_SIZE: z.coerce.number().int().positive().max(32000).default(1000),

  GOOGLE_CSE_KEY: z.string().optional().default(''),
  GOOGLE_CSE_CX: z.string().optional().default(''),
  BING_IMAGE_KEY: z.string().optional().default(''),
  BING_IMAGE_ENDPOINT: z
    .string()
    .url()
    .default('https://api.bing.microsoft.com/v7.0/images/search'),
  FALLBACK_IMAGE_URL: z.string().default('/assets/vehicle-silhouette.svg'),
  IMAGE_CACHE_TTL_MS: z.coerce.number().int().positive().default(86_400_000),

  ADMIN_EMAIL: z.string().email().default('admin@netcar.local'),
  ADMIN_PASSWORD: z.string().min(6).default('ChangeMe!2026'),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('NetCar <noreply@netcar.local>'),

  
  PASSWORD_RESET_TTL: z.string().default('1h'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error(`\n❌ Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';

export const hasGoogleImages = Boolean(env.GOOGLE_CSE_KEY && env.GOOGLE_CSE_CX);
export const hasBingImages = Boolean(env.BING_IMAGE_KEY);
export const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
