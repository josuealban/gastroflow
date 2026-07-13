import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'health.audit' })
  getHealth() {
    return { status: 'ok', service: 'audit-service' };
  }
}
