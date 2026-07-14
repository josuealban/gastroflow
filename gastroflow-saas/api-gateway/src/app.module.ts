import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { parsePort } from './parse-port';

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
          return {
            transport: Transport.TCP,
            options: {
              host:
                configService.get<string>('CORE_SERVICE_HOST') || '127.0.0.1',
              port: parsePort(
                configService.get<string>('CORE_SERVICE_PORT'),
                3001,
              ),
            },
          };
        },
      },
      {
        name: 'OPERATIONS_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.TCP,
            options: {
              host:
                configService.get<string>('OPERATIONS_SERVICE_HOST') ||
                '127.0.0.1',
              port: parsePort(
                configService.get<string>('OPERATIONS_SERVICE_PORT'),
                3002,
              ),
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
