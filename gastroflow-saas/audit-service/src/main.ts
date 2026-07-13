import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.AUDIT_SERVICE_HOST || '127.0.0.1',
      port: Number(process.env.AUDIT_SERVICE_PORT) || 3002,
    },
  });
  const configService = app.get(ConfigService);
  const host = configService.get<string>('AUDIT_SERVICE_HOST') || '127.0.0.1';
  const port = configService.get<number>('AUDIT_SERVICE_PORT') || 3002;
  console.log(`Audit Service listening on ${host}:${port}`);
  await app.listen();
}
bootstrap();
