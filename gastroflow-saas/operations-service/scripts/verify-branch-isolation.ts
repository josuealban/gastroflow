import { createBranchClient, safeDatabaseName } from './script-utils';

const principal = createBranchClient('principal');
const norte = createBranchClient('norte');

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const principalName = safeDatabaseName('principal');
  const norteName = safeDatabaseName('norte');
  assert(principalName !== norteName, 'Branch database names must differ');

  await Promise.all([principal.$connect(), norte.$connect()]);
  const category = await principal.category.upsert({
    where: { name: 'Verificación de aislamiento' },
    update: { isActive: true },
    create: { name: 'Verificación de aislamiento', isActive: true },
  });
  await principal.product.upsert({
    where: { name: 'Producto Exclusivo Principal' },
    update: {
      categoryId: category.id,
      description: 'Registro técnico de aislamiento',
      price: 1,
      isAvailable: true,
    },
    create: {
      categoryId: category.id,
      name: 'Producto Exclusivo Principal',
      description: 'Registro técnico de aislamiento',
      price: 1,
      isAvailable: true,
    },
  });
  assert(
    (await principal.product.count({
      where: { name: 'Producto Exclusivo Principal' },
    })) === 1,
    'Exclusive product was not created in Principal',
  );
  assert(
    (await norte.product.count({
      where: { name: 'Producto Exclusivo Principal' },
    })) === 0,
    'Exclusive Principal product leaked into Norte',
  );

  await principal.inventoryItem.upsert({
    where: { name: 'Harina' },
    update: {
      currentStock: 20,
      minimumStock: 5,
      type: 'INGREDIENT',
      unit: 'KILOGRAM',
    },
    create: {
      name: 'Harina',
      currentStock: 20,
      minimumStock: 5,
      costPerUnit: 0,
      type: 'INGREDIENT',
      unit: 'KILOGRAM',
    },
  });
  await norte.inventoryItem.upsert({
    where: { name: 'Harina' },
    update: {
      currentStock: 8,
      minimumStock: 5,
      type: 'INGREDIENT',
      unit: 'KILOGRAM',
    },
    create: {
      name: 'Harina',
      currentStock: 8,
      minimumStock: 5,
      costPerUnit: 0,
      type: 'INGREDIENT',
      unit: 'KILOGRAM',
    },
  });
  await principal.inventoryItem.update({
    where: { name: 'Harina' },
    data: { currentStock: 15 },
  });
  const norteFlour = await norte.inventoryItem.findUniqueOrThrow({
    where: { name: 'Harina' },
  });
  assert(
    Number(norteFlour.currentStock) === 8,
    'Norte inventory changed with Principal',
  );

  const identification = 'ISO-PRINCIPAL-ONLY';
  const existing = await principal.customer.findFirst({
    where: { identification },
  });
  if (existing) {
    await principal.customer.update({
      where: { id: existing.id },
      data: { name: 'Cliente Exclusivo Principal' },
    });
  } else {
    await principal.customer.create({
      data: { name: 'Cliente Exclusivo Principal', identification },
    });
  }
  assert(
    (await norte.customer.count({ where: { identification } })) === 0,
    'Exclusive Principal customer leaked into Norte',
  );

  await Promise.all([principal.$disconnect(), norte.$disconnect()]);
  console.log('PASS: branch databases are isolated');
}

main().catch(async (error: unknown) => {
  await Promise.all([
    principal.$disconnect().catch(() => undefined),
    norte.$disconnect().catch(() => undefined),
  ]);
  console.error(
    error instanceof Error
      ? error.message
      : 'Branch isolation verification failed',
  );
  process.exitCode = 1;
});
