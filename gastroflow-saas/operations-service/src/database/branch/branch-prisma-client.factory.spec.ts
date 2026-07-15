import { BranchDatabaseError } from './branch-errors';
import { BranchPrismaClientFactory } from './branch-prisma-client.factory';

const connection = {
  branchId: '20000000-0000-4000-8000-000000000001',
  host: 'localhost',
  port: 5432,
  database: 'gastroflow_demo_principal',
  user: 'special@user',
  password: 'p@ss:/word',
};

describe('BranchPrismaClientFactory', () => {
  const factory = new BranchPrismaClientFactory();

  it('constructs and encodes the URL only inside Operations', () => {
    const url = new URL(factory.buildConnectionString(connection));
    expect(url.hostname).toBe('localhost');
    expect(url.pathname).toBe('/gastroflow_demo_principal');
    expect(url.username).toBe('special%40user');
    expect(url.password).toBe('p%40ss%3A%2Fword');
  });

  it('creates a distinct operational Prisma Client', async () => {
    const client = factory.create(connection);
    expect(client).toBeDefined();
    await client.$disconnect();
  });

  it('rejects invalid configuration without exposing credentials', () => {
    try {
      factory.buildConnectionString({ ...connection, database: '../invalid' });
    } catch (error) {
      expect(error).toBeInstanceOf(BranchDatabaseError);
      expect((error as Error).message).not.toContain(connection.password);
    }
  });
});
