import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as PersonalPrismaClient } from '../src/generated/personal-client/client';
import { PrismaClient as CustomersPrismaClient } from '../src/generated/customers-client/client';

const databaseTests =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;
const DEMO_RESTAURANT_ID = '10000000-0000-4000-8000-000000000001';
const TEST_RESTAURANT_ID = '10000000-0000-4000-8000-000000000002';

databaseTests('Core domain databases', () => {
  let personal: PersonalPrismaClient;
  let customers: CustomersPrismaClient;

  beforeAll(async () => {
    const personalUrl = process.env.PERSONAL_DATABASE_URL;
    const customersUrl = process.env.CUSTOMERS_DATABASE_URL;
    if (!personalUrl || !customersUrl) {
      throw new Error('Faltan URLs de integración de Core');
    }
    personal = new PersonalPrismaClient({
      adapter: new PrismaPg({ connectionString: personalUrl }),
    });
    customers = new CustomersPrismaClient({
      adapter: new PrismaPg({ connectionString: customersUrl }),
    });
    await Promise.all([personal.$connect(), customers.$connect()]);
  });

  afterAll(async () => {
    await customers?.customer.deleteMany({
      where: {
        id: {
          in: [
            '39000000-0000-4000-8000-000000000101',
            '39000000-0000-4000-8000-000000000102',
          ],
        },
      },
    });
    await Promise.all([personal?.$disconnect(), customers?.$disconnect()]);
  });

  it('connects to personal and clientes databases', async () => {
    const [personalDatabase, customersDatabase] = await Promise.all([
      personal.$queryRaw<
        Array<{ name: string }>
      >`SELECT current_database() AS name`,
      customers.$queryRaw<
        Array<{ name: string }>
      >`SELECT current_database() AS name`,
    ]);
    expect(personalDatabase[0]?.name).toBe('gastroflow_personal');
    expect(customersDatabase[0]?.name).toBe('gastroflow_clientes');
  });

  it('allows the same email in different restaurants', async () => {
    const owners = await personal.user.findMany({
      where: { email: 'owner@gastroflow.com' },
      select: { restaurantId: true },
    });
    expect(new Set(owners.map(({ restaurantId }) => restaurantId))).toEqual(
      new Set([DEMO_RESTAURANT_ID, TEST_RESTAURANT_ID]),
    );
  });

  it('contains the required personal and customer demo seeds', async () => {
    const [roles, demoCustomers, demoReservations] = await Promise.all([
      personal.role.count({ where: { restaurantId: DEMO_RESTAURANT_ID } }),
      customers.customer.count({
        where: { restaurantId: DEMO_RESTAURANT_ID },
      }),
      customers.reservation.count({
        where: { restaurantId: DEMO_RESTAURANT_ID },
      }),
    ]);
    expect(roles).toBeGreaterThanOrEqual(5);
    expect(demoCustomers).toBeGreaterThanOrEqual(5);
    expect(demoReservations).toBeGreaterThanOrEqual(2);
  });

  it('enforces and scopes customer uniqueness by restaurantId', async () => {
    const identification = 'TENANT-SHARED-ID';
    await customers.customer.upsert({
      where: {
        restaurantId_identification: {
          restaurantId: DEMO_RESTAURANT_ID,
          identification,
        },
      },
      update: { name: 'Compartido Demo' },
      create: {
        id: '39000000-0000-4000-8000-000000000101',
        restaurantId: DEMO_RESTAURANT_ID,
        identification,
        name: 'Compartido Demo',
      },
    });
    await customers.customer.upsert({
      where: {
        restaurantId_identification: {
          restaurantId: TEST_RESTAURANT_ID,
          identification,
        },
      },
      update: { name: 'Compartido Prueba' },
      create: {
        id: '39000000-0000-4000-8000-000000000102',
        restaurantId: TEST_RESTAURANT_ID,
        identification,
        name: 'Compartido Prueba',
      },
    });

    await expect(
      customers.customer.create({
        data: {
          restaurantId: DEMO_RESTAURANT_ID,
          identification,
          name: 'Duplicado no permitido',
        },
      }),
    ).rejects.toThrow();
    const demoCustomers = await customers.customer.findMany({
      where: { restaurantId: DEMO_RESTAURANT_ID },
    });
    expect(demoCustomers.some(({ name }) => name === 'Compartido Prueba')).toBe(
      false,
    );
  });
});
