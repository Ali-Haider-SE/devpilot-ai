import { redisConnectionFromUrl } from './redis-connection';

describe('redisConnectionFromUrl', () => {
  it('parses host, port, credentials and db', () => {
    expect(redisConnectionFromUrl('redis://user:p%40ss@cache.local:6380/2')).toMatchObject({
      host: 'cache.local',
      port: 6380,
      username: 'user',
      password: 'p@ss',
      db: 2,
    });
  });

  it('defaults the port and enables TLS for rediss://', () => {
    const c = redisConnectionFromUrl('rediss://cache.local') as { port: number; tls?: object };
    expect(c.port).toBe(6379);
    expect(c.tls).toBeDefined();
  });
});
