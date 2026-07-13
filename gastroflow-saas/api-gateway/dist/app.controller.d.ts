import { ClientProxy } from '@nestjs/microservices';
export declare class AppController {
    private readonly coreServiceClient;
    private readonly auditServiceClient;
    constructor(coreServiceClient: ClientProxy, auditServiceClient: ClientProxy);
    getHealth(): Promise<{
        status: string;
        service: string;
        dependencies: {
            coreService: string;
            auditService: string;
        };
    }>;
}
