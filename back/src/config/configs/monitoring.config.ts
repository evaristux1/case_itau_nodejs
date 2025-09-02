import { registerAs } from '@nestjs/config';

export default registerAs('monitoring', () => ({
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',

    // Winston transports configuration
    transports: {
      console: {
        enabled: true,
        level: process.env.LOG_LEVEL || 'info',
      },
      file: {
        enabled: process.env.NODE_ENV === 'production',
        filename: 'logs/app.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      },
      errorFile: {
        enabled: true,
        filename: 'logs/error.log',
        level: 'error',
      },
    },
  },

  sentry: {
    enabled: !!process.env.SENTRY_DSN,
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  },

  datadog: {
    enabled: !!process.env.DATADOG_API_KEY,
    apiKey: process.env.DATADOG_API_KEY,
  },

  newRelic: {
    enabled: !!process.env.NEW_RELIC_LICENSE_KEY,
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
  },

  metrics: {
    enabled: process.env.FEATURE_METRICS_ENABLED === true,
    collectInterval: 10000, // 10 seconds
  },

  healthCheck: {
    enabled: process.env.FEATURE_HEALTH_CHECK_ENABLED === true,
    path: '/health',
  },
}));
