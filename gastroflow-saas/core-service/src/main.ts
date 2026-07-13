import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap(): Promise<void> {
  // 1. Crear un contexto de aplicación temporal para cargar ConfigService
  const context = await NestFactory.createApplicationContext(AppModule);
  const configService = context.get(ConfigService);

  const host = configService.get<string>('CORE_SERVICE_HOST') || '127.0.0.1';
  const rawPort = configService.get<string>('CORE_SERVICE_PORT') ?? '3001';
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    await context.close();
    throw new Error(
      `CORE_SERVICE_PORT debe ser un número entero positivo válido. Recibido: ${rawPort}`,
    );
  }

  // Cerrar el contexto temporal para liberar recursos antes de levantar el microservicio
  await context.close();

  // 2. Crear el microservicio TCP con los valores validados
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port,
      },
    },
  );

  console.log(`Core Service listening on ${host}:${port}`);
  await app.listen();
}

void bootstrap();
