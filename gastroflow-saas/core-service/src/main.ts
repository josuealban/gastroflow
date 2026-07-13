import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.CORE_SERVICE_HOST || '127.0.0.1',
        port: Number(process.env.CORE_SERVICE_PORT) || 3001,
      },
    },
  );
  const configService = app.get(ConfigService);
  const host = configService.get<string>('CORE_SERVICE_HOST') || '127.0.0.1';
  const port = configService.get<number>('CORE_SERVICE_PORT') || 3001;
  console.log(`Core Service listening on ${host}:${port}`);
  await app.listen();
}
void bootstrap();
