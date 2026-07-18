import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { parseHost, parsePort, parseTimeout } from './configuration';
import {
  CORE_SERVICE_CLIENT,
  MICROSERVICE_TIMEOUT,
  OPERATIONS_SERVICE_CLIENT,
} from './injection-tokens';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from './auth/auth.guards';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('AUTH_RATE_LIMIT_TTL_MS') ?? 60000),
          limit: Number(config.get('AUTH_RATE_LIMIT_MAX') ?? 5),
        },
      ],
    }),
    ClientsModule.registerAsync([
      {
        name: CORE_SERVICE_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.TCP,
            options: {
              host: parseHost(
                configService.get<string>('CORE_SERVICE_HOST'),
                '127.0.0.1',
                'CORE_SERVICE_HOST',
              ),
              port: parsePort(
                configService.get<string>('CORE_SERVICE_PORT'),
                3001,
                'CORE_SERVICE_PORT',
              ),
            },
          };
        },
      },
      {
        name: OPERATIONS_SERVICE_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.TCP,
            options: {
              host: parseHost(
                configService.get<string>('OPERATIONS_SERVICE_HOST'),
                '127.0.0.1',
                'OPERATIONS_SERVICE_HOST',
              ),
              port: parsePort(
                configService.get<string>('OPERATIONS_SERVICE_PORT'),
                3002,
                'OPERATIONS_SERVICE_PORT',
              ),
            },
          };
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    {
      provide: MICROSERVICE_TIMEOUT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        parseTimeout(
          configService.get<string>('MICROSERVICE_TIMEOUT_MS'),
          3000,
        ),
    },
  ],
})
export class AppModule {}
