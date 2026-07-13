import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'health.core' })
  getHealth() {
    return { status: 'ok', service: 'core-service' };
  }
}
