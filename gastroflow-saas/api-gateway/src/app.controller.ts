import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  CORE_SERVICE_CLIENT,
  MICROSERVICE_TIMEOUT,
  OPERATIONS_SERVICE_CLIENT,
} from './injection-tokens';
import {
  CORE_HEALTH_PATTERN,
  OPERATIONS_HEALTH_PATTERN,
  TcpHealthResponse,
} from './service-contracts';

type PublicServiceStatus = 'ok' | 'unavailable';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'unavailable';
  services: {
    apiGateway: { status: 'ok' };
    coreService: { status: PublicServiceStatus };
    operationsService: { status: PublicServiceStatus };
  };
  timestamp: string;
}

@Controller()
export class AppController {
  constructor(
    @Inject(CORE_SERVICE_CLIENT)
    private readonly coreServiceClient: ClientProxy,
    @Inject(OPERATIONS_SERVICE_CLIENT)
    private readonly operationsServiceClient: ClientProxy,
    @Inject(MICROSERVICE_TIMEOUT)
    private readonly timeoutMs: number,
  ) {}

  @Get('health')
  async getHealth(): Promise<HealthCheckResult> {
    const [coreStatus, operationsStatus] = await Promise.all([
      this.checkDependency(
        this.coreServiceClient,
        CORE_HEALTH_PATTERN,
        'core-service',
      ),
      this.checkDependency(
        this.operationsServiceClient,
        OPERATIONS_HEALTH_PATTERN,
        'operations-service',
      ),
    ]);
    const unavailableCount = [coreStatus, operationsStatus].filter(
      (status) => status === 'unavailable',
    ).length;
    const result: HealthCheckResult = {
      status:
        unavailableCount === 0
          ? 'ok'
          : unavailableCount === 1
            ? 'degraded'
            : 'unavailable',
      services: {
        apiGateway: { status: 'ok' },
        coreService: { status: coreStatus },
        operationsService: { status: operationsStatus },
      },
      timestamp: new Date().toISOString(),
    };

    if (unavailableCount > 0) {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }

  private async checkDependency(
    client: ClientProxy,
    pattern: typeof CORE_HEALTH_PATTERN | typeof OPERATIONS_HEALTH_PATTERN,
    expectedService: TcpHealthResponse['service'],
  ): Promise<PublicServiceStatus> {
    try {
      const response = await firstValueFrom(
        client
          .send<TcpHealthResponse>(pattern, {})
          .pipe(timeout(this.timeoutMs)),
      );
      const timestampIsValid = !Number.isNaN(Date.parse(response.timestamp));

      return response.status === 'ok' &&
        response.service === expectedService &&
        response.transport === 'tcp' &&
        timestampIsValid
        ? 'ok'
        : 'unavailable';
    } catch {
      return 'unavailable';
    }
  }
}
