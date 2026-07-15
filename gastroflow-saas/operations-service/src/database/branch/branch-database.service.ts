import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/branch-client/client';
import { BranchConnectionCacheService } from './branch-connection-cache.service';
import { BranchConnectionResolverClient } from './branch-connection-resolver.client';
import { BranchDatabaseError } from './branch-errors';
import { BranchPrismaClientFactory } from './branch-prisma-client.factory';

@Injectable()
export class BranchDatabaseService {
  constructor(
    private readonly resolver: BranchConnectionResolverClient,
    private readonly factory: BranchPrismaClientFactory,
    private readonly cache: BranchConnectionCacheService,
  ) {}

  async getClientByBranchId(branchId: string): Promise<PrismaClient> {
    const cached = this.cache.get(branchId);
    if (cached) return cached;

    const connection = await this.resolver.resolve(branchId);
    const client = this.factory.create(connection);
    try {
      await client.$connect();
      return this.cache.set(branchId, client);
    } catch {
      await client.$disconnect().catch(() => undefined);
      await this.cache.remove(branchId);
      throw new BranchDatabaseError(
        'BRANCH_CONNECTION_FAILED',
        'Could not connect to the branch database',
      );
    }
  }

  async evict(branchId: string): Promise<void> {
    await this.cache.remove(branchId);
  }
}
