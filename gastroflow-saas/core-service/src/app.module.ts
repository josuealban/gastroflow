import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { BranchConnectionModule } from './branches/branch-connection.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BranchConnectionModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
