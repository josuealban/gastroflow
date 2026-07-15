import { ConfigService } from '@nestjs/config';
import { BranchConnectionResolverService } from './branch-connection-resolver.service';
import { BranchResolutionError } from './branch-errors';

const BRANCH_ID = '20000000-0000-4000-8000-000000000001';
const TOKEN = 'internal-test-token';

describe('BranchConnectionResolverService', () => {
  const base = () => ({
    id: BRANCH_ID,
    status: 'ACTIVE',
    databaseHost: 'localhost',
    databasePort: 5432,
    databaseName: 'gastroflow_demo_principal',
    databaseUser: 'postgres',
    encryptedDatabasePassword: 'encrypted',
    restaurant: {
      isActive: true,
      subscription: {
        status: 'TRIAL',
        endDate: new Date(Date.now() + 60_000),
      },
    },
  });

  function setup(branch: ReturnType<typeof base> | null = base()) {
    const prisma = {
      branch: { findUnique: jest.fn().mockResolvedValue(branch) },
    };
    const encryption = {
      decrypt: jest.fn().mockReturnValue('database-password'),
    };
    const service = new BranchConnectionResolverService(
      prisma as never,
      encryption as never,
      new ConfigService({ INTERNAL_SERVICE_TOKEN: TOKEN }),
    );
    return { service, prisma, encryption };
  }

  const request = { branchId: BRANCH_ID, internalToken: TOKEN };

  it('returns internal connection data for an active subscribed branch', async () => {
    const { service } = setup();
    await expect(service.resolve(request)).resolves.toEqual({
      branchId: BRANCH_ID,
      host: 'localhost',
      port: 5432,
      database: 'gastroflow_demo_principal',
      user: 'postgres',
      password: 'database-password',
    });
  });

  it('rejects an invalid internal token before querying', async () => {
    const { service, prisma } = setup();
    await expect(
      service.resolve({ ...request, internalToken: 'bad' }),
    ).rejects.toMatchObject({ code: 'INVALID_INTERNAL_TOKEN' });
    expect(prisma.branch.findUnique).not.toHaveBeenCalled();
  });

  it('rejects an invalid UUID', async () => {
    await expect(
      setup().service.resolve({ ...request, branchId: 'invalid' }),
    ).rejects.toMatchObject({ code: 'INVALID_BRANCH_ID' });
  });

  it('rejects a missing branch', async () => {
    await expect(setup(null).service.resolve(request)).rejects.toMatchObject({
      code: 'BRANCH_NOT_FOUND',
    });
  });

  it('rejects an inactive restaurant', async () => {
    const branch = base();
    branch.restaurant.isActive = false;
    await expect(setup(branch).service.resolve(request)).rejects.toMatchObject({
      code: 'RESTAURANT_INACTIVE',
    });
  });

  it.each([
    ['INACTIVE', 'BRANCH_INACTIVE'],
    ['PROVISIONING', 'BRANCH_PROVISIONING'],
    ['FAILED', 'BRANCH_FAILED'],
  ])('rejects branch status %s', async (status, code) => {
    const branch = base();
    branch.status = status;
    await expect(setup(branch).service.resolve(request)).rejects.toMatchObject({
      code,
    });
  });

  it('rejects a suspended subscription', async () => {
    const branch = base();
    branch.restaurant.subscription.status = 'SUSPENDED';
    await expect(setup(branch).service.resolve(request)).rejects.toMatchObject({
      code: 'SUBSCRIPTION_SUSPENDED',
    });
  });

  it('rejects an expired subscription by date', async () => {
    const branch = base();
    branch.restaurant.subscription.endDate = new Date(Date.now() - 1);
    await expect(setup(branch).service.resolve(request)).rejects.toMatchObject({
      code: 'SUBSCRIPTION_EXPIRED',
    });
  });

  it('sanitizes damaged credential errors', async () => {
    const { service, encryption } = setup();
    encryption.decrypt.mockImplementation(() => {
      throw new Error('database-password');
    });
    await expect(service.resolve(request)).rejects.toEqual(
      new BranchResolutionError(
        'DATABASE_CREDENTIALS_INVALID',
        'Branch database credentials are unavailable',
      ),
    );
  });
});
