import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  BranchPrismaClient,
  BranchPrismaClientFactory,
} from './branch-prisma-client.factory';
import { BranchConnection } from './interfaces/branch-connection.interface';

@Injectable()
export class BranchConnectionCacheService implements OnModuleDestroy {
  private readonly clients = new Map<string, Promise<BranchPrismaClient>>();

  constructor(private readonly factory: BranchPrismaClientFactory) {}

  getOrCreate(
    branchId: string,
    connection: BranchConnection,
  ): Promise<BranchPrismaClient> {
    const cached = this.clients.get(branchId);
    if (cached) {
      return cached;
    }

    const clientPromise = this.connect(branchId, connection);
    this.clients.set(branchId, clientPromise);
    return clientPromise;
  }

  async remove(branchId: string): Promise<void> {
    const clientPromise = this.clients.get(branchId);
    this.clients.delete(branchId);

    if (clientPromise) {
      const client = await clientPromise.catch(() => undefined);
      await client?.$disconnect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    const clients = [...this.clients.values()];
    this.clients.clear();
    await Promise.all(
      clients.map(async (clientPromise) => {
        const client = await clientPromise.catch(() => undefined);
        await client?.$disconnect();
      }),
    );
  }

  private async connect(
    branchId: string,
    connection: BranchConnection,
  ): Promise<BranchPrismaClient> {
    const client = this.factory.create(connection);

    try {
      await client.$connect();
      return client;
    } catch {
      this.clients.delete(branchId);
      await client.$disconnect().catch(() => undefined);
      throw new Error('No fue posible conectar con la base de la sucursal');
    }
  }
}
