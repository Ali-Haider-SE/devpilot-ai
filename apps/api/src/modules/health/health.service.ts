import { Injectable, Logger } from '@nestjs/common';
import type { DependencyCheck, HealthReport } from '@devpilot/shared-types';
import { TimeoutError, withTimeout } from '../../common/utils/with-timeout';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CHECK_TIMEOUT_MS = 2000;

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  live(): { status: 'ok'; uptimeSeconds: number } {
    return { status: 'ok', uptimeSeconds: Math.round(process.uptime()) };
  }

  async report(): Promise<HealthReport> {
    const checks = await Promise.all([
      this.check('database', () => this.prisma.ping()),
      this.check('redis', () => this.redis.ping()),
    ]);
    return {
      status: checks.every((c) => c.status === 'up') ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      checks,
    };
  }

  private async check(name: string, probe: () => Promise<void>): Promise<DependencyCheck> {
    const started = Date.now();
    try {
      await withTimeout(probe, CHECK_TIMEOUT_MS);
      return { name, status: 'up', latencyMs: Date.now() - started };
    } catch (err) {
      this.logger.warn(`Health check "${name}" failed: ${(err as Error).message}`);
      return {
        name,
        status: 'down',
        latencyMs: Date.now() - started,
        reason: err instanceof TimeoutError ? 'timeout' : 'unreachable',
      };
    }
  }
}
