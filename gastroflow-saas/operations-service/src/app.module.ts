import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { BranchDatabaseModule } from './database/branch/branch-database.module';
import { BranchProvisioningModule } from './provisioning/branch-provisioning.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BranchDatabaseModule,
    BranchProvisioningModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
