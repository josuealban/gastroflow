import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { parsePort } from './configuration';
import { configureHttpApp } from './configure-http-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  configureHttpApp(app, configService);

  const port = parsePort(configService.get<string>('PORT'), 3000, 'PORT');

  await app.listen(port);
}

void bootstrap();
