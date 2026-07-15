import { Module } from '@nestjs/common';
import { ControlPrismaModule } from '../database/control/control-prisma.module';
import { DatabaseCredentialsEncryptionService } from '../security/database-credentials-encryption.service';
import { BranchConnectionController } from './branch-connection.controller';
import { BranchConnectionResolverService } from './branch-connection-resolver.service';

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
