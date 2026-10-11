import { PipeTransform } from '@nestjs/common';
import { ErrorCode } from '@devpilot/shared-types';
import type { ZodTypeAny, z } from 'zod';
import { AppException } from '../errors/app.exception';

/** Per-route schema validation. Usage: `@Body(new ZodValidationPipe(schema))`. */
export class ZodValidationPipe<S extends ZodTypeAny> implements PipeTransform<unknown, z.infer<S>> {
  constructor(private readonly schema: S) {}

  transform(value: unknown): z.infer<S> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new AppException(400, ErrorCode.VALIDATION_ERROR, 'Validation failed', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    return result.data;
  }
}
