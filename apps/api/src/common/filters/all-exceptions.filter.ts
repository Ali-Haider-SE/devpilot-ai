import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ErrorCode, type ApiError } from '@devpilot/shared-types';
import type { Response } from 'express';
import { AppException } from '../errors/app.exception';
import type { RequestWithIds } from '../middleware/request-id.middleware';

interface Normalized {
  status: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
}

const STATUS_CODE_MAP: Record<number, ErrorCode> = {
  400: ErrorCode.VALIDATION_ERROR,
  401: ErrorCode.UNAUTHENTICATED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  409: ErrorCode.CONFLICT,
  429: ErrorCode.RATE_LIMITED,
  501: ErrorCode.NOT_IMPLEMENTED,
  503: ErrorCode.UNAVAILABLE,
};

function messageFrom(response: string | object): string {
  if (typeof response === 'string') return response;
  const m = (response as { message?: unknown }).message;
  if (Array.isArray(m)) return m.join('; ');
  return typeof m === 'string' ? m : 'Request failed';
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<RequestWithIds>();
    const res = http.getResponse<Response>();
    const requestId = req.id ?? 'unknown';
    const n = this.normalize(exception);

    if (n.status >= 500) {
      // Technical detail goes to logs only, never to the client.
      this.logger.error({ requestId, err: exception }, 'Server error');
    }

    const body: ApiError = {
      success: false,
      error: {
        code: n.code,
        message: n.message,
        requestId,
        timestamp: new Date().toISOString(),
        ...(n.details !== undefined ? { details: n.details } : {}),
      },
    };
    res.status(n.status).json(body);
  }

  private normalize(exception: unknown): Normalized {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 500) {
        return { status, code: STATUS_CODE_MAP[status] ?? ErrorCode.INTERNAL_ERROR, message: 'Service error' };
      }
      return {
        status,
        code: STATUS_CODE_MAP[status] ?? ErrorCode.VALIDATION_ERROR,
        message: messageFrom(exception.getResponse()),
      };
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
    };
  }
}
