import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ControlPrismaModule } from '../../database/control/control-prisma.module';
import { DatabaseCredentialsEncryptionService } from '../../security/database-credentials-encryption.service';
import { parseHost, parsePort } from '../../configuration';
import { OPERATIONS_PROVISIONING_CLIENT } from '../provisioning/branch-provisioning-processor.service';
import { BranchAdminController } from './branch-admin.controller';
import { BranchAdminService } from './branch-admin.service';
@Module({
  imports: [
    ControlPrismaModule,
    ClientsModule.registerAsync([
      {
        name: OPERATIONS_PROVISIONING_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: parseHost(
              config.get('OPERATIONS_SERVICE_HOST'),
              '127.0.0.1',
              'OPERATIONS_SERVICE_HOST',
            ),
            port: parsePort(
              config.get('OPERATIONS_SERVICE_PORT'),
              3002,
              'OPERATIONS_SERVICE_PORT',
            ),
          },
        }),
      },
    ]),
  ],
  controllers: [BranchAdminController],
  providers: [BranchAdminService, DatabaseCredentialsEncryptionService],
})
export class BranchAdminModule {}
