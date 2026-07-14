import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
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
    operations: 'up' | 'down';
  };
}

@Controller()
export class AppController {
  constructor(
    @Inject('CORE_SERVICE') private readonly coreServiceClient: ClientProxy,
    @Inject('OPERATIONS_SERVICE')
    private readonly operationsServiceClient: ClientProxy,
  ) {}

  @Get('health')
  async getHealth(): Promise<HealthCheckResult> {
    const [coreStatus, operationsStatus] = await Promise.all([
      this.checkDependency(this.coreServiceClient, 'health.core'),
      this.checkDependency(this.operationsServiceClient, 'health.operations'),
    ]);

    if (coreStatus === 'down') {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        service: 'api-gateway',
        dependencies: {
          core: 'down',
          operations: operationsStatus,
        },
      } satisfies HealthCheckResult);
    }

    const isOk = coreStatus === 'up' && operationsStatus === 'up';

    return {
      status: isOk ? 'ok' : 'degraded',
      service: 'api-gateway',
      dependencies: {
        core: 'up',
        operations: operationsStatus,
      },
    };
  }

  private async checkDependency(
    client: ClientProxy,
    command: 'health.core' | 'health.operations',
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
