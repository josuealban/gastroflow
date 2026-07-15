import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

export interface OperationsHealthResponse {
  service: 'operations-service';
  status: 'ok';
  transport: 'tcp';
  timestamp: string;
}

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'operations.health' })
  getHealth(): OperationsHealthResponse {
    return {
      service: 'operations-service',
      status: 'ok',
      transport: 'tcp',
      timestamp: new Date().toISOString(),
    };
  }
}
