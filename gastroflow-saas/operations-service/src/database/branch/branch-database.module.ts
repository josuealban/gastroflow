import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { parseHost, parsePort } from '../../configuration';
import { BranchConnectionCacheService } from './branch-connection-cache.service';
import {
  BranchConnectionResolverClient,
  CORE_BRANCH_CONNECTION_CLIENT,
} from './branch-connection-resolver.client';
import { BranchDatabaseService } from './branch-database.service';
import { BranchPrismaClientFactory } from './branch-prisma-client.factory';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CORE_BRANCH_CONNECTION_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: parseHost(
              config.get<string>('CORE_SERVICE_HOST'),
              '127.0.0.1',
              'CORE_SERVICE_HOST',
            ),
            port: parsePort(
              config.get<string>('CORE_SERVICE_PORT'),
              3001,
              'CORE_SERVICE_PORT',
            ),
          },
        }),
      },
    ]),
  ],
  providers: [
    BranchPrismaClientFactory,
    BranchConnectionCacheService,
    BranchConnectionResolverClient,
    BranchDatabaseService,
  ],
  exports: [
    BranchDatabaseService,
    BranchConnectionCacheService,
    BranchPrismaClientFactory,
  ],
})
export class BranchDatabaseModule {}
