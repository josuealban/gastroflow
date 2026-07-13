"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api/v1');
    const corsOrigin = configService.get('CORS_ORIGIN');
    if (corsOrigin) {
        app.enableCors({ origin: corsOrigin === '*' ? true : corsOrigin });
    }
    else {
        app.enableCors();
    }
    const port = configService.get('PORT') ?? 3000;
    await app.listen(port);
}
void bootstrap();
//# sourceMappingURL=main.js.map