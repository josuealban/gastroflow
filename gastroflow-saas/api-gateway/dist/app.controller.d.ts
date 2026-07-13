import { ClientProxy } from '@nestjs/microservices';
interface HealthCheckResult {
    status: 'ok' | 'degraded' | 'unavailable';
    service: string;
    dependencies: {
        coreService: string;
        auditService: string;
    };
}
export declare class AppController {
    private readonly coreServiceClient;
    private readonly auditServiceClient;
    constructor(coreServiceClient: ClientProxy, auditServiceClient: ClientProxy);
    getHealth(): Promise<HealthCheckResult>;
}
export {};
