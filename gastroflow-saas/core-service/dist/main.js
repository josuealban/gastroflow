"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: process.env.CORE_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.CORE_SERVICE_PORT) || 3001,
        },
    });
    const configService = app.get(config_1.ConfigService);
    const host = configService.get('CORE_SERVICE_HOST') || '127.0.0.1';
    const port = configService.get('CORE_SERVICE_PORT') || 3001;
    console.log(`Core Service listening on ${host}:${port}`);
    await app.listen();
}
bootstrap();
//# sourceMappingURL=main.js.map