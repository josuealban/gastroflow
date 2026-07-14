import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { OperationsPrismaModule } from './database/operations-prisma.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), OperationsPrismaModule],
  controllers: [AppController],
})
export class AppModule {}
