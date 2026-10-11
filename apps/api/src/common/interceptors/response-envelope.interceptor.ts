import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { ApiSuccess } from '@devpilot/shared-types';
import { map, type Observable } from 'rxjs';
import type { RequestWithIds } from '../middleware/request-id.middleware';

@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<T, ApiSuccess<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<T>> {
    const req = context.switchToHttp().getRequest<RequestWithIds>();
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        meta: { requestId: req.id ?? 'unknown', timestamp: new Date().toISOString() },
      })),
    );
  }
}
