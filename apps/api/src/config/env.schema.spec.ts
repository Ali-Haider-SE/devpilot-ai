import { parseEnv } from './env.schema';

const valid = {
  DATABASE_URL: 'postgresql://u:supersecret@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
};

describe('parseEnv', () => {
  it('applies defaults and transforms', () => {
    const env = parseEnv({ ...valid, CORS_ORIGINS: 'http://a.test, http://b.test' });
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
    expect(env.CORS_ORIGINS).toEqual(['http://a.test', 'http://b.test']);
    expect(env.SWAGGER_ENABLED).toBe(true);
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => parseEnv({ REDIS_URL: valid.REDIS_URL })).toThrow(/DATABASE_URL/);
  });

  it('rejects an invalid PORT', () => {
    expect(() => parseEnv({ ...valid, PORT: '70000' })).toThrow(/PORT/);
  });

  it('never includes secret values in the error message', () => {
    try {
      parseEnv({ DATABASE_URL: 'not-a-url-supersecret', REDIS_URL: valid.REDIS_URL });
      throw new Error('should have thrown');
    } catch (e) {
      expect((e as Error).message).not.toContain('supersecret');
    }
  });
});
