import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as BranchPrismaClient } from '../../generated/branch-client/client';
import { BranchConnection } from './interfaces/branch-connection.interface';

@Injectable()
export class BranchPrismaClientFactory {
  create(connection: BranchConnection): BranchPrismaClient {
    try {
      const url = new URL('postgresql://localhost');
      url.hostname = connection.host;
      url.port = String(connection.port);
      url.username = connection.user;
      url.password = connection.password;
      url.pathname = `/${connection.databaseName}`;
      url.searchParams.set('schema', 'public');

      const adapter = new PrismaPg({ connectionString: url.toString() });
      return new BranchPrismaClient({ adapter });
    } catch {
      throw new Error('No fue posible preparar la conexión de la sucursal');
    }
  }
}

export type { BranchPrismaClient };
