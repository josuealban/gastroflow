import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/operations-client/client';

const databaseTests =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;
const DEMO_RESTAURANT_ID = '10000000-0000-4000-8000-000000000001';
const TEST_RESTAURANT_ID = '10000000-0000-4000-8000-000000000002';
const PRODUCT_NAME = 'Producto Compartido Integración';

databaseTests('Operations PostgreSQL integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    const connectionString = process.env.OPERATIONS_DATABASE_URL;
    if (!connectionString) {
      throw new Error('OPERATIONS_DATABASE_URL es obligatoria');
    }
    prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma?.product.deleteMany({ where: { name: PRODUCT_NAME } });
    await prisma?.$disconnect();
  });

  it('connects exclusively to gastroflow_operaciones', async () => {
    const database = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT current_database() AS name
    `;
    expect(database[0]?.name).toBe('gastroflow_operaciones');
  });

  it('contains the required operations demo seed', async () => {
    const [categories, products, tables, suppliers, tax, sequence] =
      await Promise.all([
        prisma.category.count({
          where: { restaurantId: DEMO_RESTAURANT_ID },
        }),
        prisma.product.count({
          where: { restaurantId: DEMO_RESTAURANT_ID },
        }),
        prisma.restaurantTable.count({
          where: { restaurantId: DEMO_RESTAURANT_ID },
        }),
        prisma.supplier.count({
          where: { restaurantId: DEMO_RESTAURANT_ID },
        }),
        prisma.taxConfiguration.findFirstOrThrow({
          where: { restaurantId: DEMO_RESTAURANT_ID, isActive: true },
        }),
        prisma.invoiceSequence.findFirstOrThrow({
          where: { restaurantId: DEMO_RESTAURANT_ID },
        }),
      ]);
    expect(categories).toBeGreaterThanOrEqual(4);
    expect(products).toBeGreaterThanOrEqual(10);
    expect(tables).toBeGreaterThanOrEqual(6);
    expect(suppliers).toBeGreaterThanOrEqual(2);
    expect(tax.rate.toNumber()).toBe(0.15);
    expect(sequence).toMatchObject({
      establishment: '001',
      emissionPoint: '001',
      currentNumber: 0,
    });
  });

  it('allows equal product names and table numbers across restaurants', async () => {
    const [demoCategory, testCategory] = await Promise.all([
      prisma.category.findFirstOrThrow({
        where: { restaurantId: DEMO_RESTAURANT_ID },
      }),
      prisma.category.findFirstOrThrow({
        where: { restaurantId: TEST_RESTAURANT_ID },
      }),
    ]);
    await prisma.product.create({
      data: {
        restaurantId: DEMO_RESTAURANT_ID,
        categoryId: demoCategory.id,
        name: PRODUCT_NAME,
        price: 1,
      },
    });
    await prisma.product.create({
      data: {
        restaurantId: TEST_RESTAURANT_ID,
        categoryId: testCategory.id,
        name: PRODUCT_NAME,
        price: 2,
      },
    });
    await expect(
      prisma.product.create({
        data: {
          restaurantId: DEMO_RESTAURANT_ID,
          categoryId: demoCategory.id,
          name: PRODUCT_NAME,
          price: 3,
        },
      }),
    ).rejects.toThrow();

    const tables = await prisma.restaurantTable.findMany({
      where: { number: 1 },
      select: { restaurantId: true },
    });
    expect(new Set(tables.map(({ restaurantId }) => restaurantId))).toEqual(
      new Set([DEMO_RESTAURANT_ID, TEST_RESTAURANT_ID]),
    );
    const demoProducts = await prisma.product.findMany({
      where: { restaurantId: DEMO_RESTAURANT_ID },
    });
    expect(
      demoProducts.some(
        ({ restaurantId }) => restaurantId === TEST_RESTAURANT_ID,
      ),
    ).toBe(false);
  });
});
