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
  status: string;
}

interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'unavailable';
  service: string;
  dependencies: {
    coreService: string;
    auditService: string;
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
    let coreStatus = 'unknown';
    let auditStatus = 'unknown';

    try {
      const coreRes = await firstValueFrom<ServiceHealthResponse>(
        this.coreServiceClient
          .send<ServiceHealthResponse>({ cmd: 'health.core' }, {})
          .pipe(timeout(2000)),
      );
      coreStatus = coreRes.status;
    } catch {
      coreStatus = 'down';
    }

    try {
      const auditRes = await firstValueFrom<ServiceHealthResponse>(
        this.auditServiceClient
          .send<ServiceHealthResponse>({ cmd: 'health.audit' }, {})
          .pipe(timeout(2000)),
      );
      auditStatus = auditRes.status;
    } catch {
      auditStatus = 'down';
    }

    if (coreStatus === 'down') {
      throw new HttpException(
        {
          status: 'unavailable',
          service: 'api-gateway',
          dependencies: {
            coreService: coreStatus,
            auditService: auditStatus,
          },
        } satisfies HealthCheckResult,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const isOk = coreStatus === 'ok' && auditStatus === 'ok';

    return {
      status: isOk ? 'ok' : 'degraded',
      service: 'api-gateway',
      dependencies: {
        coreService: coreStatus,
        auditService: auditStatus,
      },
    };
  }
}
