import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CORE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CORE_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.CORE_SERVICE_PORT) || 3001,
        },
      },
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUDIT_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.AUDIT_SERVICE_PORT) || 3002,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
