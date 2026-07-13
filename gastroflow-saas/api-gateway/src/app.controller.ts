import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('CORE_SERVICE') private readonly coreServiceClient: ClientProxy,
    @Inject('AUDIT_SERVICE') private readonly auditServiceClient: ClientProxy,
  ) {}

  @Get('health')
  async getHealth() {
    let coreStatus = 'unknown';
    let auditStatus = 'unknown';

    try {
      const coreRes = await firstValueFrom(this.coreServiceClient.send({ cmd: 'health.core' }, {}));
      coreStatus = coreRes.status;
    } catch (e) {
      coreStatus = 'down';
    }

    try {
      const auditRes = await firstValueFrom(this.auditServiceClient.send({ cmd: 'health.audit' }, {}));
      auditStatus = auditRes.status;
    } catch (e) {
      auditStatus = 'down';
    }

    return {
      status: 'ok',
      service: 'api-gateway',
      dependencies: {
        coreService: coreStatus,
        auditService: auditStatus,
      }
    };
  }
}
