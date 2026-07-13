import { Module } from '@nestjs/common';
import { ControlPrismaModule } from '../control/control-prisma.module';
import { DatabaseCredentialsEncryptionService } from '../encryption/database-credentials-encryption.service';
import { BranchConnectionCacheService } from './branch-connection-cache.service';
import { BranchDatabaseService } from './branch-database.service';
import { BranchPrismaClientFactory } from './branch-prisma-client.factory';

@Module({
  imports: [ControlPrismaModule],
  providers: [
    DatabaseCredentialsEncryptionService,
    BranchPrismaClientFactory,
    BranchConnectionCacheService,
    BranchDatabaseService,
  ],
  exports: [BranchDatabaseService, BranchConnectionCacheService],
})
export class BranchDatabaseModule {}
