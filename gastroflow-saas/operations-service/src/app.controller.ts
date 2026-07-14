import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'health.operations' })
  getHealth(): { status: 'ok'; service: 'operations-service' } {
    return { status: 'ok', service: 'operations-service' };
  }
}
