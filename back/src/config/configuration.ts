// src/config/configuration.ts
export default () => {
  const env = process.env;
  const rateLimitTtlMs = Number(env.RATE_LIMIT_TTL ?? 60) * 1000;

  return {
    app: {
      port: Number(env.PORT ?? 3000),
      prefix: env.API_PREFIX ?? 'api/v1',
      version: env.API_VERSION ?? '1.0.0',
      rateLimit: {
        ttl: rateLimitTtlMs,
        limit: Number(env.RATE_LIMIT_MAX ?? 100),
      },
    },
  };
};
