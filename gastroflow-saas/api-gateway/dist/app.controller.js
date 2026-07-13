"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
let AppController = class AppController {
    coreServiceClient;
    auditServiceClient;
    constructor(coreServiceClient, auditServiceClient) {
        this.coreServiceClient = coreServiceClient;
        this.auditServiceClient = auditServiceClient;
    }
    async getHealth() {
        let coreStatus = 'unknown';
        let auditStatus = 'unknown';
        try {
            const coreRes = await (0, rxjs_1.firstValueFrom)(this.coreServiceClient
                .send({ cmd: 'health.core' }, {})
                .pipe((0, rxjs_1.timeout)(2000)));
            coreStatus = coreRes.status;
        }
        catch (_e) {
            coreStatus = 'down';
        }
        try {
            const auditRes = await (0, rxjs_1.firstValueFrom)(this.auditServiceClient
                .send({ cmd: 'health.audit' }, {})
                .pipe((0, rxjs_1.timeout)(2000)));
            auditStatus = auditRes.status;
        }
        catch (_e) {
            auditStatus = 'down';
        }
        if (coreStatus === 'down') {
            throw new common_1.HttpException({
                status: 'unavailable',
                service: 'api-gateway',
                dependencies: {
                    coreService: coreStatus,
                    auditService: auditStatus,
                },
            }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        const isOk = coreStatus === 'ok' && auditStatus === 'ok';
        return {
            status: isOk ? 'ok' : 'degraded',
            service: 'api-gateway',
            dependencies: {
                coreService: coreStatus,
                auditService: auditStatus,
            },
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)('CORE_SERVICE')),
    __param(1, (0, common_1.Inject)('AUDIT_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        microservices_1.ClientProxy])
], AppController);
//# sourceMappingURL=app.controller.js.map