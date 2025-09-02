// src/config/env.schema.ts
import { Buffer } from 'node:buffer';
import { z } from 'zod';

const normalizeEncryptionKey = (v: unknown) => {
  if (typeof v !== 'string') return v;
  const s = v.trim();
  // hex de 64 chars
  if (/^[0-9a-f]{64}$/i.test(s)) return s.toLowerCase();
  // base64/base64url -> 32 bytes
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const buf = Buffer.from(b64, 'base64');
    if (buf.length === 32) return buf.toString('hex'); // normaliza para hex
  } catch {}
  return s;
};

const isLocalHost = (host?: string) =>
  !host ||
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host.endsWith('.local');

const parseDbHost = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname || undefined;
  } catch {
    return undefined;
  }
};

const corsPre = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (!trimmed) return [];
    // permite JSON array ou lista separada por vírgula
    if (trimmed.startsWith('[')) {
      try {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) return arr.map(String);
      } catch {}
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test', 'staging'])
      .default('development'),
    PORT: z.coerce.number().min(1).max(65535).default(3000),
    API_PREFIX: z.string().default('api/v1'),
    API_VERSION: z.string().default('1.0.0'),

    // Database
    DATABASE_PROVIDER: z
      .enum(['sqlite', 'postgresql', 'mysql'])
      .default('sqlite'),
    DATABASE_URL: z.string(), // validamos condicionalmente abaixo
    DATABASE_LOGGING: z.coerce.boolean().default(false),
    DATABASE_POOL_SIZE: z.coerce.number().min(5).max(100).default(10),
    DATABASE_SSL: z.coerce.boolean().default(false),
    DATABASE_SYNCHRONIZE: z.coerce.boolean().default(false),

    // JWT / Security
    JWT_SECRET: z
      .string()
      .min(32, 'JWT_SECRET must be at least 32 characters long'),
    JWT_EXPIRES_IN: z.string().default('1h'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    ENCRYPTION_KEY: z
      .string()
      .transform(normalizeEncryptionKey)
      .refine((val) => typeof val === 'string' && /^[0-9a-f]{64}$/i.test(val), {
        message: 'Use 32 bytes (hex64 ou base64). Ex.: openssl rand -hex 32',
      }),

    BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),

    // API Security
    API_KEY_HEADER: z.string().default('X-API-Key'),
    CORS_ORIGINS: z.preprocess(
      corsPre,
      z.array(z.string()).default(['http://localhost:3000']),
    ),

    // Rate Limiting (guarde em segundos; converta para ms no configuration.ts)
    RATE_LIMIT_TTL: z.coerce.number().positive().default(60),
    RATE_LIMIT_MAX: z.coerce.number().positive().default(100),

    // Cache (Redis)
    CACHE_ENABLED: z.coerce.boolean().default(true),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().min(1).max(65535).default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.coerce.number().min(0).max(15).default(0),
    CACHE_TTL: z.coerce.number().positive().default(300),

    // Monitoring
    LOG_LEVEL: z
      .enum(['error', 'warn', 'info', 'debug', 'verbose'])
      .default('info'),
    LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
    SENTRY_DSN: z.preprocess(
      (v) => (v === '' ? undefined : v),
      z.string().url().optional(),
    ),
    DATADOG_API_KEY: z.string().optional(),
    NEW_RELIC_LICENSE_KEY: z.string().optional(),

    // Feature Flags
    FEATURE_SWAGGER_ENABLED: z.coerce.boolean().default(true),
    FEATURE_METRICS_ENABLED: z.coerce.boolean().default(true),
    FEATURE_HEALTH_CHECK_ENABLED: z.coerce.boolean().default(true),
  })
  .superRefine((env, ctx) => {
    const isProd = env.NODE_ENV === 'production';

    // DATABASE_URL compatível com provider
    if (env.DATABASE_PROVIDER === 'sqlite') {
      if (!env.DATABASE_URL.startsWith('file:')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message:
            "When DATABASE_PROVIDER=sqlite, DATABASE_URL must start with 'file:'",
        });
      }
    } else {
      // postgresql/mysql precisam ser URL válida
      try {
        new URL(env.DATABASE_URL);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message:
            'DATABASE_URL must be a valid URL (e.g., postgres://... or mysql://...)',
        });
      }
    }

    // Produção: guard rails
    if (isProd) {
      // Proíbe sqlite em prod
      if (env.DATABASE_PROVIDER === 'sqlite') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_PROVIDER'],
          message: 'sqlite is not allowed in production',
        });
      }
      // Proíbe synchronize em prod
      if (env.DATABASE_SYNCHRONIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_SYNCHRONIZE'],
          message: 'Disable DATABASE_SYNCHRONIZE in production',
        });
      }
      // Força LOG_FORMAT=json em prod
      if (env.LOG_FORMAT !== 'json') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['LOG_FORMAT'],
          message: 'Use LOG_FORMAT=json in production',
        });
      }
      // CORS: não permitir wildcard em prod
      if (
        env.CORS_ORIGINS.some(
          (o) => o === '*' || o === 'http://*' || o === 'https://*',
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CORS_ORIGINS'],
          message: 'Wildcard CORS is not allowed in production',
        });
      }
      // Banco remoto: SSL obrigatório
      const dbHost =
        env.DATABASE_PROVIDER === 'sqlite'
          ? undefined
          : parseDbHost(env.DATABASE_URL);
      if (dbHost && !isLocalHost(dbHost) && !env.DATABASE_SSL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_SSL'],
          message: 'Enable DATABASE_SSL when DB host is not local',
        });
      }
      // Redis remoto: senha obrigatória
      if (
        env.CACHE_ENABLED &&
        env.REDIS_HOST &&
        !isLocalHost(env.REDIS_HOST) &&
        !env.REDIS_PASSWORD
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['REDIS_PASSWORD'],
          message:
            'REDIS_PASSWORD is required for non-local Redis in production',
        });
      }
      // Swagger: recomendado desligado por padrão (pode ligar explicitamente)
      if (env.FEATURE_SWAGGER_ENABLED !== false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['FEATURE_SWAGGER_ENABLED'],
          message:
            'Set FEATURE_SWAGGER_ENABLED=false in production (recommended)',
        });
      }
    }
  });

function pad(str: string, len: number) {
  return str + ' '.repeat(Math.max(0, len - str.length));
}

function prettyIssues(issues: z.ZodIssue[]) {
  const maxKey = Math.max(...issues.map((i) => i.path.join('.').length));
  const lines = issues.map(
    (i) => `  • ${pad(i.path.join('.'), maxKey)} → ${i.message}`,
  );
  const tips = [
    '',
    '💡 Dicas:',
    '  - Gere segredos: openssl rand -hex 32',
    '  - ENCRYPTION_KEY: hex64 ou base64 (32 bytes) — normalizado para hex',
    '  - Evite sqlite/ synchronize em produção; ative DATABASE_SSL/REDIS_PASSWORD para hosts remotos.',
    '  - Desligue Swagger em produção (FEATURE_SWAGGER_ENABLED=false).',
  ];
  return ['\n🔴 Environment validation failed:', ...lines, ...tips, ''].join(
    '\n',
  );
}

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(prettyIssues(error.issues));
    }
    throw error;
  }
}
