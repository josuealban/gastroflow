import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { parseHost, parsePort } from './configuration';

async function bootstrap(): Promise<void> {
  const configService = new ConfigService();
  const host = parseHost(
    configService.get<string>('OPERATIONS_SERVICE_HOST'),
    '127.0.0.1',
    'OPERATIONS_SERVICE_HOST',
  );
  const port = parsePort(
    configService.get<string>('OPERATIONS_SERVICE_PORT'),
    3002,
    'OPERATIONS_SERVICE_PORT',
  );
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    { transport: Transport.TCP, options: { host, port } },
  );

  app.enableShutdownHooks();
  await app.listen();
  console.log(`Operations Service listening on ${host}:${port}`);
}

void bootstrap();
