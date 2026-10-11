import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ErrorCode, type HealthReport } from '@devpilot/shared-types';
import { AppException } from '../../common/errors/app.exception';
import { HealthService } from './health.service';

@ApiTags('health')
@SkipThrottle()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Full status incl. dependency checks (503 if any dependency is down)' })
  async full(): Promise<HealthReport> {
    return this.ready();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness: process is running (no dependency checks)' })
  live(): { status: 'ok'; uptimeSeconds: number } {
    return this.health.live();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness: database and Redis are reachable (503 otherwise)' })
  async ready(): Promise<HealthReport> {
    const report = await this.health.report();
    if (report.status !== 'ok') {
      throw new AppException(503, ErrorCode.NOT_READY, 'Service is not ready', { checks: report.checks });
    }
    return report;
  }
}
