import { z } from 'zod';
import { AppException } from '../errors/app.exception';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(z.object({ name: z.string().min(2) }));

  it('returns parsed data when valid', () => {
    expect(pipe.transform({ name: 'ok' })).toEqual({ name: 'ok' });
  });

  it('throws a 400 AppException with safe issue details when invalid', () => {
    try {
      pipe.transform({ name: 'x' });
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(AppException);
      const ex = e as AppException;
      expect(ex.getStatus()).toBe(400);
      expect(ex.code).toBe('VALIDATION_ERROR');
      expect(ex.details).toEqual({ issues: [{ path: 'name', message: expect.any(String) }] });
    }
  });
});
