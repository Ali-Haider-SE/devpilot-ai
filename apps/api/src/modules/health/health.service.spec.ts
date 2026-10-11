import { Logger } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import type { RedisService } from '../redis/redis.service';
import { HealthService } from './health.service';

function make(dbOk: boolean, redisOk: boolean) {
  const prisma = { ping: jest.fn(dbOk ? async () => undefined : async () => { throw new Error('db secret detail'); }) };
  const redis = { ping: jest.fn(redisOk ? async () => undefined : async () => { throw new Error('boom'); }) };
  return new HealthService(prisma as unknown as PrismaService, redis as unknown as RedisService);
}

describe('HealthService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('reports ok when all dependencies are up', async () => {
    const r = await make(true, true).report();
    expect(r.status).toBe('ok');
    expect(r.checks.map((c) => [c.name, c.status])).toEqual([['database', 'up'], ['redis', 'up']]);
  });

  it('reports degraded with safe reasons when a dependency is down', async () => {
    const r = await make(false, true).report();
    expect(r.status).toBe('degraded');
    const db = r.checks.find((c) => c.name === 'database');
    expect(db).toMatchObject({ status: 'down', reason: 'unreachable' });
    expect(JSON.stringify(r)).not.toContain('secret');
  });

  it('liveness does not touch dependencies', () => {
    expect(make(false, false).live().status).toBe('ok');
  });
});
