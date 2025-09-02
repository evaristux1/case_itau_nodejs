import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV,
  port: process.env.PORT ?? '3000',
  apiPrefix: process.env.API_PREFIX,
  apiVersion: process.env.API_VERSION,

  cors: {
    enabled: true,
    origins:
      typeof process.env.CORS_ORIGINS === 'string'
        ? (process.env.CORS_ORIGINS as string).split(',')
        : ['http://localhost:3000'],
    credentials: true,
  },

  swagger: {
    enabled: String(process.env.FEATURE_SWAGGER_ENABLED) === 'true',
    title: 'Itaú Customer API',
    description: 'High-performance customer management API',
    version: process.env.API_VERSION || '1.0.0',
    path: 'docs',
  },

  rateLimit: {
    ttl: parseInt(String(process.env.RATE_LIMIT_TTL ?? '0'), 10),
    limit: parseInt(String(process.env.RATE_LIMIT_MAX ?? '0'), 10),
  },
}));
