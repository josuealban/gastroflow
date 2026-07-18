import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseCorsOrigins } from './configuration';
import cookieParser from 'cookie-parser';

export function configureHttpApp(
  app: INestApplication,
  configService: ConfigService,
): void {
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: parseCorsOrigins(
      configService.get<string>('CORS_ORIGIN'),
      'http://localhost:5173',
    ),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
  });
  app.enableShutdownHooks();
}
