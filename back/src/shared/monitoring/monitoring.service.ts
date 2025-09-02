import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class MonitoringService {
  private sentryEnabled = false;

  constructor(private readonly config: ConfigService) {
    const s = this.config.get<any>('monitoring')?.sentry;
    if (s?.enabled && s?.dsn) {
      Sentry.init({
        dsn: s.dsn,
        environment: s.environment,
        tracesSampleRate: s.tracesSampleRate,
      });
      this.sentryEnabled = true;
    }
  }

  captureException(err: unknown, extra?: Record<string, any>) {
    if (this.sentryEnabled && err instanceof Error) {
      Sentry.captureException(err, { extra });
    }
  }
}
