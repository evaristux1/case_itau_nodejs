import { MonitoringService } from '@app/shared/monitoring/monitoring.service';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly config: ConfigService,
    private readonly monitoring: MonitoringService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<any>();
    const res = ctx.getResponse<any>();

    const path = httpAdapter.getRequestUrl(req);
    const method = req?.method ?? 'UNKNOWN';
    const requestId =
      req?.headers?.['x-request-id'] || req?.headers?.['X-Request-Id'];

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const env = this.config.get<string>('NODE_ENV') ?? 'development';
    const isProd = env === 'production';

    let message: any = 'Internal server error';
    let errorName = 'Error';

    if (isHttp) {
      const resBody = exception.getResponse();
      message =
        (resBody as any)?.message ??
        (typeof resBody === 'string' ? resBody : (exception as any).message);
      errorName =
        (resBody as any)?.error ?? (exception as any).name ?? 'HttpException';
    } else if (exception && typeof exception === 'object') {
      message = (exception as any).message ?? message;
      errorName = (exception as any).name ?? errorName;
    }

    this.monitoring.captureException(exception as any, {
      path,
      method,
      status,
      requestId,
    });

    const payload: any = {
      success: false,
      statusCode: status,
      error: errorName,
      message,
      path,
      method,
      requestId,
      timestamp: new Date().toISOString(),
    };

    if (!isProd) {
      payload.stack = (exception as any)?.stack;
    }

    if (requestId && res?.setHeader) res.setHeader('x-request-id', requestId);
    httpAdapter.reply(ctx.getResponse(), payload, status);
  }
}
