import { TimeoutError, withTimeout } from './with-timeout';

describe('withTimeout', () => {
  it('resolves when work finishes in time', async () => {
    await expect(withTimeout(async () => 42, 100)).resolves.toBe(42);
  });

  it('rejects with TimeoutError when work is too slow', async () => {
    const slow = () => new Promise<void>((resolve) => setTimeout(resolve, 200));
    await expect(withTimeout(slow, 10)).rejects.toBeInstanceOf(TimeoutError);
  });
});
