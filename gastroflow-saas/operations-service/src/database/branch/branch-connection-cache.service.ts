import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/branch-client/client';

@Injectable()
export class BranchConnectionCacheService implements OnModuleDestroy {
  private readonly clients = new Map<string, PrismaClient>();

  get(branchId: string): PrismaClient | undefined {
    return this.clients.get(branchId);
  }

  set(branchId: string, client: PrismaClient): PrismaClient {
    this.clients.set(branchId, client);
    return client;
  }

  async remove(branchId: string): Promise<void> {
    const client = this.clients.get(branchId);
    this.clients.delete(branchId);
    if (client) {
      await client.$disconnect().catch(() => undefined);
    }
  }

  async onModuleDestroy(): Promise<void> {
    const clients = [...this.clients.values()];
    this.clients.clear();
    await Promise.all(
      clients.map((client) => client.$disconnect().catch(() => undefined)),
    );
  }

  size(): number {
    return this.clients.size;
  }
}
