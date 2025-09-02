import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

type Wrapped<T> = {
  success: true;
  data: T;
  path?: string;
  requestId?: string;
  timestamp: string;
};

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<any>();
    const res = httpCtx.getResponse<any>();

    const path = req?.originalUrl || req?.url;
    const requestId =
      req?.headers?.['x-request-id'] || req?.headers?.['X-Request-Id'];

    if (requestId && res?.setHeader) {
      res.setHeader('x-request-id', requestId);
    }

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        const wrapped: Wrapped<typeof data> = {
          success: true,
          data,
          path,
          requestId,
          timestamp: new Date().toISOString(),
        };
        return wrapped;
      }),
    );
  }
}
