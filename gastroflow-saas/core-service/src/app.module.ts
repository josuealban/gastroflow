import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { BranchDatabaseModule } from './database/branch/branch-database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BranchDatabaseModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
