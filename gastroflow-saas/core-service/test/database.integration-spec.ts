import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as BranchPrismaClient } from '../src/generated/branch-client/client';
import { PrismaClient as ControlPrismaClient } from '../src/generated/control-client/client';

const databaseTests =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

databaseTests('PostgreSQL integration', () => {
  let control: ControlPrismaClient;
  let centro: BranchPrismaClient;
  let norte: BranchPrismaClient;

  beforeAll(async () => {
    const controlUrl = process.env.CONTROL_DATABASE_URL;
    const centroUrl = process.env.DEMO_CENTRO_DATABASE_URL;
    const norteUrl = process.env.DEMO_NORTE_DATABASE_URL;
    if (!controlUrl || !centroUrl || !norteUrl) {
      throw new Error('Faltan URLs de integración');
    }
    control = new ControlPrismaClient({
      adapter: new PrismaPg({ connectionString: controlUrl }),
    });
    centro = new BranchPrismaClient({
      adapter: new PrismaPg({ connectionString: centroUrl }),
    });
    norte = new BranchPrismaClient({
      adapter: new PrismaPg({ connectionString: norteUrl }),
    });
    await Promise.all([
      control.$connect(),
      centro.$connect(),
      norte.$connect(),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      control?.$disconnect(),
      centro?.$disconnect(),
      norte?.$disconnect(),
    ]);
  });

  it('connects to control, Centro and Norte', async () => {
    await expect(control.company.count()).resolves.toBeGreaterThanOrEqual(1);
    await expect(centro.category.count()).resolves.toBeGreaterThanOrEqual(1);
    await expect(norte.category.count()).resolves.toBeGreaterThanOrEqual(1);
  });

  it('keeps operational products isolated', async () => {
    const centroOnly = await centro.product.findFirst({
      where: { name: 'Encebollado Centro' },
    });
    const leakedToNorte = await norte.product.findFirst({
      where: { name: 'Encebollado Centro' },
    });
    expect(centroOnly).not.toBeNull();
    expect(leakedToNorte).toBeNull();
  });
});
