import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as PersonalPrismaClient } from '../../core-service/src/generated/personal-client/client';
import { PrismaClient as CustomersPrismaClient } from '../../core-service/src/generated/customers-client/client';
import {
  InventoryItemType,
  InventoryUnit,
  PrismaClient as OperationsPrismaClient,
} from '../src/generated/operations-client/client';
import { restaurantScope } from '../src/database/restaurant-scope';

config({ path: '../core-service/.env' });
config();

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} es obligatoria`);
  return value;
}

const personal = new PersonalPrismaClient({
  adapter: new PrismaPg({
    connectionString: requiredEnvironment('PERSONAL_DATABASE_URL'),
  }),
});
const customers = new CustomersPrismaClient({
  adapter: new PrismaPg({
    connectionString: requiredEnvironment('CUSTOMERS_DATABASE_URL'),
  }),
});
const operations = new OperationsPrismaClient({
  adapter: new PrismaPg({
    connectionString: requiredEnvironment('OPERATIONS_DATABASE_URL'),
  }),
});

async function main(): Promise<void> {
  const demo = await personal.restaurant.findFirstOrThrow({
    where: { name: 'Restaurante Demo', isActive: true },
  });
  const test = await personal.restaurant.findFirstOrThrow({
    where: { name: 'Restaurante Prueba', isActive: true },
  });
  const demoScope = restaurantScope(demo.id);
  const testScope = restaurantScope(test.id);

  const category = await operations.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: demo.id,
        name: 'Verificación SaaS',
      },
    },
    update: { isActive: true },
    create: { ...demoScope, name: 'Verificación SaaS' },
  });
  await operations.product.upsert({
    where: {
      restaurantId_name: {
        restaurantId: demo.id,
        name: 'Producto Exclusivo Demo',
      },
    },
    update: { categoryId: category.id, price: 1, isAvailable: true },
    create: {
      ...demoScope,
      categoryId: category.id,
      name: 'Producto Exclusivo Demo',
      price: 1,
    },
  });
  const [demoProduct, leakedProduct] = await Promise.all([
    operations.product.findFirst({
      where: { ...demoScope, name: 'Producto Exclusivo Demo' },
    }),
    operations.product.findFirst({
      where: { ...testScope, name: 'Producto Exclusivo Demo' },
    }),
  ]);
  if (!demoProduct || leakedProduct) {
    throw new Error('Falló el aislamiento de productos por restaurantId');
  }

  await operations.inventoryItem.upsert({
    where: {
      restaurantId_name: { restaurantId: demo.id, name: 'Harina' },
    },
    update: { currentStock: 20, unit: InventoryUnit.KILOGRAM },
    create: {
      ...demoScope,
      name: 'Harina',
      type: InventoryItemType.INGREDIENT,
      unit: InventoryUnit.KILOGRAM,
      currentStock: 20,
      minimumStock: 2,
      costPerUnit: 1,
    },
  });
  await operations.inventoryItem.upsert({
    where: {
      restaurantId_name: { restaurantId: test.id, name: 'Harina' },
    },
    update: { currentStock: 8, unit: InventoryUnit.KILOGRAM },
    create: {
      ...testScope,
      name: 'Harina',
      type: InventoryItemType.INGREDIENT,
      unit: InventoryUnit.KILOGRAM,
      currentStock: 8,
      minimumStock: 2,
      costPerUnit: 1,
    },
  });
  await operations.inventoryItem.update({
    where: {
      restaurantId_name: { restaurantId: demo.id, name: 'Harina' },
    },
    data: { currentStock: 15 },
  });
  const [demoFlour, testFlour] = await Promise.all([
    operations.inventoryItem.findUniqueOrThrow({
      where: {
        restaurantId_name: { restaurantId: demo.id, name: 'Harina' },
      },
    }),
    operations.inventoryItem.findUniqueOrThrow({
      where: {
        restaurantId_name: { restaurantId: test.id, name: 'Harina' },
      },
    }),
  ]);
  if (
    demoFlour.currentStock.toNumber() !== 15 ||
    testFlour.currentStock.toNumber() !== 8
  ) {
    throw new Error('Falló el aislamiento del inventario por restaurantId');
  }

  const demoCustomerName = 'Cliente Exclusivo Demo';
  const testCustomerName = 'Cliente Exclusivo Prueba';
  await customers.customer.upsert({
    where: { id: '39000000-0000-4000-8000-000000000001' },
    update: { ...demoScope, name: demoCustomerName },
    create: {
      id: '39000000-0000-4000-8000-000000000001',
      ...demoScope,
      name: demoCustomerName,
    },
  });
  await customers.customer.upsert({
    where: { id: '39000000-0000-4000-8000-000000000002' },
    update: { ...testScope, name: testCustomerName },
    create: {
      id: '39000000-0000-4000-8000-000000000002',
      ...testScope,
      name: testCustomerName,
    },
  });
  const [demoCustomers, testCustomers] = await Promise.all([
    customers.customer.findMany({ where: demoScope, select: { name: true } }),
    customers.customer.findMany({ where: testScope, select: { name: true } }),
  ]);
  if (
    !demoCustomers.some(({ name }) => name === demoCustomerName) ||
    demoCustomers.some(({ name }) => name === testCustomerName) ||
    !testCustomers.some(({ name }) => name === testCustomerName) ||
    testCustomers.some(({ name }) => name === demoCustomerName)
  ) {
    throw new Error('Falló el aislamiento de clientes por restaurantId');
  }

  console.log('PASS: restaurant tenant data is isolated');
}

void main()
  .catch((error: unknown) => {
    console.error(
      `FAIL: ${error instanceof Error ? error.message : 'error desconocido'}`,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([
      personal.$disconnect(),
      customers.$disconnect(),
      operations.$disconnect(),
    ]);
  });
