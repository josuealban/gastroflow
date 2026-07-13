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
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('CORE_SERVICE_HOST') || '127.0.0.1',
            port: configService.get<number>('CORE_SERVICE_PORT') || 3001,
          },
        }),
      },
      {
        name: 'AUDIT_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('AUDIT_SERVICE_HOST') || '127.0.0.1',
            port: configService.get<number>('AUDIT_SERVICE_PORT') || 3002,
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
