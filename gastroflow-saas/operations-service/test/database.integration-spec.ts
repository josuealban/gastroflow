import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/branch-client/client';

const databaseTests =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

function create(url: string | undefined): PrismaClient {
  if (!url) throw new Error('Branch database URL is required');
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

databaseTests('physical branch database integration', () => {
  let principal: PrismaClient;
  let norte: PrismaClient;

  beforeAll(async () => {
    principal = create(process.env.DEMO_PRINCIPAL_DATABASE_URL);
    norte = create(process.env.DEMO_NORTE_DATABASE_URL);
    await Promise.all([principal.$connect(), norte.$connect()]);
  });

  afterAll(async () =>
    Promise.all([principal?.$disconnect(), norte?.$disconnect()]),
  );

  it('connects to two different physical databases', async () => {
    const [principalDb, norteDb] = await Promise.all([
      principal.$queryRaw<
        Array<{ name: string }>
      >`SELECT current_database() AS name`,
      norte.$queryRaw<
        Array<{ name: string }>
      >`SELECT current_database() AS name`,
    ]);
    expect(principalDb[0]?.name).toBe('gastroflow_demo_principal');
    expect(norteDb[0]?.name).toBe('gastroflow_demo_norte');
  });

  it('installs the five required SQL views in both databases', async () => {
    const expected = [
      'vw_daily_sales',
      'vw_inventory_movements_summary',
      'vw_invoice_summary',
      'vw_low_stock',
      'vw_top_selling_products',
    ];
    for (const client of [principal, norte]) {
      const views = await client.$queryRaw<Array<{ name: string }>>`
        SELECT table_name AS name FROM information_schema.views
        WHERE table_schema = 'public' AND table_name LIKE 'vw_%' ORDER BY table_name
      `;
      expect(views.map(({ name }) => name)).toEqual(expected);
    }
  });

  it('seeds Principal and leaves Norte transaction history at zero', async () => {
    const [
      products,
      tables,
      customers,
      northProducts,
      northCustomers,
      northOrders,
      northPayments,
      northInvoices,
      northMovements,
    ] = await Promise.all([
      principal.product.count(),
      principal.restaurantTable.count(),
      principal.customer.count(),
      norte.product.count(),
      norte.customer.count(),
      norte.order.count(),
      norte.payment.count(),
      norte.invoice.count(),
      norte.inventoryMovement.count(),
    ]);
    expect(products).toBeGreaterThanOrEqual(10);
    expect(tables).toBe(6);
    expect(customers).toBeGreaterThanOrEqual(2);
    expect(northProducts).toBeGreaterThanOrEqual(10);
    expect([
      northCustomers,
      northOrders,
      northPayments,
      northInvoices,
      northMovements,
    ]).toEqual([0, 0, 0, 0, 0]);
  });

  it('keeps equal inventory names physically isolated', async () => {
    const [principalFlour, northFlour] = await Promise.all([
      principal.inventoryItem.findUniqueOrThrow({ where: { name: 'Harina' } }),
      norte.inventoryItem.findUniqueOrThrow({ where: { name: 'Harina' } }),
    ]);
    expect(Number(principalFlour.currentStock)).not.toBe(
      Number(northFlour.currentStock),
    );
  });
});
