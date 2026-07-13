import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'CORE_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rawPort =
            configService.get<string>('CORE_SERVICE_PORT') ?? '3001';
          const corePort = Number(rawPort);
          if (!Number.isInteger(corePort) || corePort <= 0) {
            throw new Error(
              `CORE_SERVICE_PORT debe ser un número entero positivo válido. Recibido: ${rawPort}`,
            );
          }
          return {
            transport: Transport.TCP,
            options: {
              host:
                configService.get<string>('CORE_SERVICE_HOST') || '127.0.0.1',
              port: corePort,
            },
          };
        },
      },
      {
        name: 'AUDIT_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rawPort =
            configService.get<string>('AUDIT_SERVICE_PORT') ?? '3002';
          const auditPort = Number(rawPort);
          if (!Number.isInteger(auditPort) || auditPort <= 0) {
            throw new Error(
              `AUDIT_SERVICE_PORT debe ser un número entero positivo válido. Recibido: ${rawPort}`,
            );
          }
          return {
            transport: Transport.TCP,
            options: {
              host:
                configService.get<string>('AUDIT_SERVICE_HOST') || '127.0.0.1',
              port: auditPort,
            },
          };
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
