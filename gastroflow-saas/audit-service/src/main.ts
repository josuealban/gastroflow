import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { parsePort } from './parse-port';

async function bootstrap(): Promise<void> {
  const host = process.env.AUDIT_SERVICE_HOST ?? '127.0.0.1';
  const port = parsePort(process.env.AUDIT_SERVICE_PORT, 3002);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { host, port },
    },
  );

  await app.listen();
  console.log(`Audit Service listening on ${host}:${port}`);
}

void bootstrap();
