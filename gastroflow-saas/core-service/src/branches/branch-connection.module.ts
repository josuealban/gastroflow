import { Module } from '@nestjs/common';
import { ControlPrismaModule } from '../database/control/control-prisma.module';
import { DatabaseCredentialsEncryptionService } from '../security/database-credentials-encryption.service';
import { BranchConnectionResolverService } from './branch-connection-resolver.service';
import { BranchConnectionController } from './branch-connection.controller';

@Module({
  imports: [ControlPrismaModule],
  controllers: [BranchConnectionController],
  providers: [
    BranchConnectionResolverService,
    DatabaseCredentialsEncryptionService,
  ],
  exports: [BranchConnectionResolverService],
})
export class BranchConnectionModule {}
