import { AppLoggerService } from '@app/shared/logging/app-logger.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    if (ctx.getType() !== 'http') return next.handle();

    const http = ctx.switchToHttp();
    const req = http.getRequest<any>();
    const res = http.getResponse<any>();

    const start = Date.now();
    const method = req?.method;
    const url = req?.originalUrl || req?.url;
    const ip = req?.ip || req?.socket?.remoteAddress;

    let rid = req?.headers?.['x-request-id'] || req?.headers?.['X-Request-Id'];
    if (!rid) {
      rid = randomUUID();
      res?.setHeader?.('x-request-id', rid);
    }

    this.logger.log(`--> ${method} ${url} ip=${ip} rid=${rid}`, 'HTTP');

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(
          `<-- ${method} ${url} ${res?.statusCode} ${ms}ms rid=${rid}`,
          'HTTP',
        );
      }),
      catchError((err) => {
        const ms = Date.now() - start;
        this.logger.error(
          `<x- ${method} ${url} ${res?.statusCode ?? err?.status ?? 500} ${ms}ms rid=${rid}`,
          err?.stack,
          'HTTP',
        );
        return throwError(() => err);
      }),
    );
  }
}
