import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { BranchConnectionModule } from './branches/branch-connection.module';
import { AuthModule } from './auth/auth.module';
import { BranchAdminModule } from './branches/admin/branch-admin.module';
import { BranchProvisioningModule } from './branches/provisioning/branch-provisioning.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BranchConnectionModule,
    AuthModule,
    BranchAdminModule,
    BranchProvisioningModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
