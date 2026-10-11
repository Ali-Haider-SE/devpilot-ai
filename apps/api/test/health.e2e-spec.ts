import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../src/app-setup';
import { HealthModule } from '../src/modules/health/health.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { RedisService } from '../src/modules/redis/redis.service';

describe('Health endpoints (HTTP pipeline, mocked dependencies)', () => {
  let app: INestApplication;
  const prisma = { ping: jest.fn() };
  const redis = { ping: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [HealthModule] })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(RedisService).useValue(redis)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(async () => app.close());
  beforeEach(() => {
    prisma.ping.mockResolvedValue(undefined);
    redis.ping.mockResolvedValue(undefined);
  });

  it('GET /health/live -> 200 envelope with request id header', async () => {
    const res = await request(app.getHttpServer()).get('/health/live').expect(200);
    expect(res.body).toMatchObject({ success: true, data: { status: 'ok' } });
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.body.meta.requestId).toBe(res.headers['x-request-id']);
  });

  it('GET /health/ready -> 200 when dependencies are up', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready').expect(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /health/ready -> 503 error envelope when Redis is down', async () => {
    redis.ping.mockRejectedValue(new Error('down'));
    const res = await request(app.getHttpServer()).get('/health/ready').expect(503);
    expect(res.body).toMatchObject({ success: false, error: { code: 'NOT_READY' } });
    expect(res.body.error.details.checks).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'redis', status: 'down' })]),
    );
  });

  it('honours a well-formed inbound x-request-id', async () => {
    const res = await request(app.getHttpServer()).get('/health/live').set('x-request-id', 'abc-12345678').expect(200);
    expect(res.headers['x-request-id']).toBe('abc-12345678');
  });

  it('unknown route -> 404 error envelope', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/nope').expect(404);
    expect(res.body).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } });
  });
});
