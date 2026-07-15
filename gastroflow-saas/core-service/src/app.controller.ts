import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

export interface CoreHealthResponse {
  service: 'core-service';
  status: 'ok';
  transport: 'tcp';
  timestamp: string;
}

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'core.health' })
  getHealth(): CoreHealthResponse {
    return {
      service: 'core-service',
      status: 'ok',
      transport: 'tcp',
      timestamp: new Date().toISOString(),
    };
  }
}
