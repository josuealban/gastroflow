import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ControlPrismaModule } from '../../database/control/control-prisma.module';
import { DatabaseCredentialsEncryptionService } from '../../security/database-credentials-encryption.service';
import { parseHost, parsePort } from '../../configuration';
import {
  BranchProvisioningProcessorService,
  OPERATIONS_PROVISIONING_CLIENT,
} from './branch-provisioning-processor.service';
@Module({
  imports: [
    ControlPrismaModule,
    ClientsModule.registerAsync([
      {
        name: OPERATIONS_PROVISIONING_CLIENT,
        inject: [ConfigService],
        useFactory: (c: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: parseHost(
              c.get('OPERATIONS_SERVICE_HOST'),
              '127.0.0.1',
              'OPERATIONS_SERVICE_HOST',
            ),
            port: parsePort(
              c.get('OPERATIONS_SERVICE_PORT'),
              3002,
              'OPERATIONS_SERVICE_PORT',
            ),
          },
        }),
      },
    ]),
  ],
  providers: [
    DatabaseCredentialsEncryptionService,
    BranchProvisioningProcessorService,
  ],
})
export class BranchProvisioningModule {}
