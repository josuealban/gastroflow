import { BranchDatabaseService } from './branch-database.service';

describe('BranchDatabaseService', () => {
  const connection = {
    branchId: 'id',
    host: 'localhost',
    port: 5432,
    database: 'branch',
    user: 'user',
    password: 'password',
  };

  it('returns a cached client without resolving credentials again', async () => {
    const cached = {};
    const cache = { get: jest.fn().mockReturnValue(cached) };
    const resolver = { resolve: jest.fn() };
    const service = new BranchDatabaseService(
      resolver as never,
      {} as never,
      cache as never,
    );
    await expect(service.getClientByBranchId('id')).resolves.toBe(cached);
    expect(resolver.resolve).not.toHaveBeenCalled();
  });

  it('connects and caches a newly resolved client', async () => {
    const client = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    };
    const cache = {
      get: jest.fn(),
      set: jest.fn().mockReturnValue(client),
      remove: jest.fn(),
    };
    const service = new BranchDatabaseService(
      { resolve: jest.fn().mockResolvedValue(connection) } as never,
      { create: jest.fn().mockReturnValue(client) } as never,
      cache as never,
    );
    await expect(service.getClientByBranchId('id')).resolves.toBe(client);
    expect(client.$connect).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalledWith('id', client);
  });

  it('evicts a failed client and returns no credentials in the error', async () => {
    const client = {
      $connect: jest.fn().mockRejectedValue(new Error('password')),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    };
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const service = new BranchDatabaseService(
      { resolve: jest.fn().mockResolvedValue(connection) } as never,
      { create: jest.fn().mockReturnValue(client) } as never,
      cache as never,
    );
    await expect(service.getClientByBranchId('id')).rejects.toMatchObject({
      code: 'BRANCH_CONNECTION_FAILED',
      message: 'Could not connect to the branch database',
    });
    expect(cache.remove).toHaveBeenCalledWith('id');
  });
});
