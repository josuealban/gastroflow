import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { BranchConnectionModule } from './branches/branch-connection.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BranchConnectionModule],
  controllers: [AppController],
})
export class AppModule {}
