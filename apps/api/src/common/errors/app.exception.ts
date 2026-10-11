import { HttpException } from '@nestjs/common';
import type { ErrorCode } from '@devpilot/shared-types';

/** Application error with a stable code. `details` MUST be safe to show to clients. */
export class AppException extends HttpException {
  constructor(
    status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super({ code, message }, status);
  }
}
