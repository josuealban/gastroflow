import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

interface ServiceHealthResponse {
  status: 'ok';
  service: string;
}

interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'unavailable';
  service: string;
  dependencies: {
    core: 'up' | 'down';
    audit: 'up' | 'down';
  };
}

@Controller()
export class AppController {
  constructor(
    @Inject('CORE_SERVICE') private readonly coreServiceClient: ClientProxy,
    @Inject('AUDIT_SERVICE') private readonly auditServiceClient: ClientProxy,
  ) {}

  @Get('health')
  async getHealth(): Promise<HealthCheckResult> {
    const [coreStatus, auditStatus] = await Promise.all([
      this.checkDependency(this.coreServiceClient, 'health.core'),
      this.checkDependency(this.auditServiceClient, 'health.audit'),
    ]);

    if (coreStatus === 'down') {
      throw new HttpException(
        {
          status: 'unavailable',
          service: 'api-gateway',
          dependencies: {
            core: 'down',
            audit: auditStatus,
          },
        } satisfies HealthCheckResult,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const isOk = coreStatus === 'up' && auditStatus === 'up';

    return {
      status: isOk ? 'ok' : 'degraded',
      service: 'api-gateway',
      dependencies: {
        core: 'up',
        audit: auditStatus,
      },
    };
  }

  private async checkDependency(
    client: ClientProxy,
    command: 'health.core' | 'health.audit',
  ): Promise<'up' | 'down'> {
    try {
      const response = await firstValueFrom(
        client
          .send<ServiceHealthResponse>({ cmd: command }, {})
          .pipe(timeout(2000)),
      );

      return response.status === 'ok' ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }
}
