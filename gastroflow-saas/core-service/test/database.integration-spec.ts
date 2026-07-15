import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/control-client/client';

const databaseTests =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

databaseTests('gastroflow_control integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    const connectionString = process.env.CONTROL_DATABASE_URL;
    if (!connectionString) throw new Error('CONTROL_DATABASE_URL is required');
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    await prisma.$connect();
  });

  afterAll(async () => prisma?.$disconnect());

  it('connects exclusively to gastroflow_control', async () => {
    const rows = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT current_database() AS name
    `;
    expect(rows[0]?.name).toBe('gastroflow_control');
  });

  it('contains plans, restaurant, subscription and two active branches', async () => {
    const [plans, restaurants, branches, subscriptions] = await Promise.all([
      prisma.plan.count(),
      prisma.restaurant.count(),
      prisma.branch.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({
        where: { status: { in: ['TRIAL', 'ACTIVE'] } },
      }),
    ]);
    expect(plans).toBeGreaterThanOrEqual(2);
    expect(restaurants).toBeGreaterThanOrEqual(1);
    expect(branches).toBeGreaterThanOrEqual(2);
    expect(subscriptions).toBeGreaterThanOrEqual(1);
  });

  it('contains N:M roles, permissions and branch assignments', async () => {
    const [users, roles, permissions, userRoles, branchRoles] =
      await Promise.all([
        prisma.user.count(),
        prisma.role.count(),
        prisma.permission.count(),
        prisma.userRole.count(),
        prisma.userBranchRole.count(),
      ]);
    expect(users).toBeGreaterThanOrEqual(5);
    expect(roles).toBeGreaterThanOrEqual(5);
    expect(permissions).toBeGreaterThanOrEqual(40);
    expect(userRoles).toBeGreaterThanOrEqual(5);
    expect(branchRoles).toBeGreaterThanOrEqual(6);
  });

  it('stores encrypted rather than plaintext database passwords', async () => {
    const branches = await prisma.branch.findMany({
      select: { encryptedDatabasePassword: true },
    });
    expect(branches).toHaveLength(2);
    expect(
      branches.every(
        ({ encryptedDatabasePassword }) =>
          encryptedDatabasePassword.startsWith('v1.') &&
          encryptedDatabasePassword !== 'postgres',
      ),
    ).toBe(true);
  });
});
