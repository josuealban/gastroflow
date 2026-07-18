import 'dotenv/config';
import { createHash } from 'crypto';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { ControlPrismaService } from '../src/database/control/control-prisma.service';

const databaseTests =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

databaseTests('Phase 3 authentication integration', () => {
  let auth: AuthService;
  let db: ControlPrismaService;
  const issuedTokens: string[] = [];
  const internalToken = process.env.INTERNAL_SERVICE_TOKEN ?? '';
  const password = process.env.DEMO_USER_PASSWORD ?? '';
  const remember = <T extends { refreshToken: string }>(response: T): T => {
    issuedTokens.push(response.refreshToken);
    return response;
  };

  beforeAll(async () => {
    if (!internalToken || !password)
      throw new Error(
        'INTERNAL_SERVICE_TOKEN and DEMO_USER_PASSWORD are required',
      );
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    auth = module.get(AuthService);
    db = module.get(ControlPrismaService);
    await db.connect();
  });
  afterAll(async () => {
    const hashes = issuedTokens.map((token) =>
      createHash('sha256').update(token).digest('hex'),
    );
    if (db && hashes.length)
      await db.refreshToken.deleteMany({
        where: { tokenHash: { in: hashes } },
      });
    await db?.onModuleDestroy();
  });

  it('authenticates OWNER/WAITER with their assigned branches and RBAC', async () => {
    const owner = remember(
      await auth.login({
        restaurantSlug: 'restaurante-demo',
        email: 'owner@gastroflow.com',
        password,
        internalToken,
      }),
    );
    const waiter = remember(
      await auth.login({
        restaurantSlug: 'restaurante-demo',
        email: 'waiter@gastroflow.com',
        password,
        internalToken,
      }),
    );
    expect(owner.availableBranches.map((branch) => branch.code).sort()).toEqual(
      ['NORTE', 'PRINCIPAL'],
    );
    expect(waiter.availableBranches.map((branch) => branch.code)).toEqual([
      'PRINCIPAL',
    ]);
    await expect(
      auth.roles({
        userId: owner.user.id,
        branchId: owner.user.branchId,
        internalToken,
      }),
    ).resolves.toContain('OWNER');
    await expect(
      auth.permissions({
        userId: waiter.user.id,
        branchId: waiter.user.branchId,
        internalToken,
      }),
    ).resolves.not.toContain('settings.manage');
  });

  it('selects Norte for OWNER, rejects it for WAITER, and rotates atomically', async () => {
    const owner = remember(
      await auth.login({
        restaurantSlug: 'restaurante-demo',
        email: 'owner@gastroflow.com',
        password,
        internalToken,
      }),
    );
    const norte = owner.availableBranches.find(
      (branch) => branch.code === 'NORTE',
    );
    if (!norte) throw new Error('Norte demo branch is missing');
    const selected = remember(
      await auth.selectBranch({
        userId: owner.user.id,
        restaurantId: owner.user.restaurantId,
        branchId: norte.id,
        refreshToken: owner.refreshToken,
        internalToken,
      }),
    );
    expect(selected.user.branchId).toBe(norte.id);
    const waiter = remember(
      await auth.login({
        restaurantSlug: 'restaurante-demo',
        email: 'waiter@gastroflow.com',
        password,
        internalToken,
      }),
    );
    await expect(
      auth.selectBranch({
        userId: waiter.user.id,
        restaurantId: waiter.user.restaurantId,
        branchId: norte.id,
        refreshToken: waiter.refreshToken,
        internalToken,
      }),
    ).rejects.toBeDefined();
    const concurrent = remember(
      await auth.login({
        restaurantSlug: 'restaurante-demo',
        email: 'owner@gastroflow.com',
        password,
        internalToken,
      }),
    );
    const results = await Promise.allSettled([
      auth.refresh({ refreshToken: concurrent.refreshToken, internalToken }),
      auth.refresh({ refreshToken: concurrent.refreshToken, internalToken }),
    ]);
    for (const result of results)
      if (result.status === 'fulfilled') remember(result.value);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
  });

  it('revokes on logout and rejects reuse', async () => {
    const session = remember(
      await auth.login({
        restaurantSlug: 'restaurante-demo',
        email: 'owner@gastroflow.com',
        password,
        internalToken,
      }),
    );
    await auth.logout({ refreshToken: session.refreshToken, internalToken });
    await expect(
      auth.refresh({ refreshToken: session.refreshToken, internalToken }),
    ).rejects.toBeDefined();
  });
});
