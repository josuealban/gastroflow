import { BranchConnectionCacheService } from './branch-connection-cache.service';
import {
  BranchPrismaClient,
  BranchPrismaClientFactory,
} from './branch-prisma-client.factory';

describe('BranchConnectionCacheService', () => {
  it('reuses the same client for a branch', async () => {
    const client = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    } as unknown as BranchPrismaClient;
    const factory = {
      create: jest.fn().mockReturnValue(client),
    } as unknown as BranchPrismaClientFactory;
    const cache = new BranchConnectionCacheService(factory);
    const connection = {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: 'secret',
      databaseName: 'gastroflow_demo_centro',
    };

    const first = await cache.getOrCreate('branch-1', connection);
    const second = await cache.getOrCreate('branch-1', connection);

    expect(first).toBe(second);
    expect(factory.create).toHaveBeenCalledTimes(1);
    expect(client.$connect).toHaveBeenCalledTimes(1);
    await cache.onModuleDestroy();
    expect(client.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('removes a failed connection from the cache', async () => {
    const failedClient = {
      $connect: jest.fn().mockRejectedValue(new Error('private URL')),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    } as unknown as BranchPrismaClient;
    const workingClient = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    } as unknown as BranchPrismaClient;
    const factory = {
      create: jest
        .fn()
        .mockReturnValueOnce(failedClient)
        .mockReturnValueOnce(workingClient),
    } as unknown as BranchPrismaClientFactory;
    const cache = new BranchConnectionCacheService(factory);
    const connection = {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: 'secret',
      databaseName: 'gastroflow_demo_centro',
    };

    await expect(cache.getOrCreate('branch-1', connection)).rejects.toThrow(
      'No fue posible conectar con la base de la sucursal',
    );
    await expect(cache.getOrCreate('branch-1', connection)).resolves.toBe(
      workingClient,
    );
    expect(factory.create).toHaveBeenCalledTimes(2);
  });
});
