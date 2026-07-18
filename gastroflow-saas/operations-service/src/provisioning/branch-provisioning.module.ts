import { Module } from '@nestjs/common';
import { BranchDatabaseModule } from '../database/branch/branch-database.module';
import { BranchProvisioningController } from './branch-provisioning.controller';
import { BranchProvisioningService } from './branch-provisioning.service';
import { SqlIdentifierService } from './sql-identifier.service';
@Module({
  imports: [BranchDatabaseModule],
  controllers: [BranchProvisioningController],
  providers: [BranchProvisioningService, SqlIdentifierService],
})
export class BranchProvisioningModule {}
