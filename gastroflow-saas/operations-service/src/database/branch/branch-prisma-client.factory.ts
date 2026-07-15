import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/branch-client/client';
import { BranchDatabaseError } from './branch-errors';
import { ResolvedBranchConnection } from './interfaces/resolved-branch-connection.interface';

@Injectable()
export class BranchPrismaClientFactory {
  create(connection: ResolvedBranchConnection): PrismaClient {
    const connectionString = this.buildConnectionString(connection);
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  buildConnectionString(connection: ResolvedBranchConnection): string {
    if (
      !connection.host ||
      !connection.user ||
      !connection.password ||
      !Number.isInteger(connection.port) ||
      connection.port <= 0 ||
      connection.port > 65_535 ||
      !/^[a-zA-Z0-9_]+$/.test(connection.database)
    ) {
      throw new BranchDatabaseError(
        'INVALID_BRANCH_CONNECTION',
        'Branch database configuration is invalid',
      );
    }

    const url = new URL('postgresql://localhost');
    url.hostname = connection.host;
    url.port = String(connection.port);
    url.username = connection.user;
    url.password = connection.password;
    url.pathname = `/${connection.database}`;
    url.searchParams.set('schema', 'public');
    return url.toString();
  }
}
