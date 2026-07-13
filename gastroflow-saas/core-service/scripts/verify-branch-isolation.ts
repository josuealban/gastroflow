import { InventoryUnit } from '../src/generated/branch-client/client';
import { createBranchClient, safeError } from './lib/database';

async function main(): Promise<void> {
  const centroUrl = process.env.DEMO_CENTRO_DATABASE_URL;
  const norteUrl = process.env.DEMO_NORTE_DATABASE_URL;
  if (!centroUrl || !norteUrl) {
    throw new Error('Las URLs de Centro y Norte son obligatorias');
  }

  const centro = createBranchClient(centroUrl);
  const norte = createBranchClient(norteUrl);

  try {
    await Promise.all([centro.$connect(), norte.$connect()]);
    const category = await centro.category.upsert({
      where: { name: 'Verificación de aislamiento' },
      update: { isActive: true },
      create: { name: 'Verificación de aislamiento' },
    });
    await centro.product.upsert({
      where: { id: '40000000-0000-4000-8000-000000000001' },
      update: {
        name: 'Producto Exclusivo Centro',
        categoryId: category.id,
        price: 1,
      },
      create: {
        id: '40000000-0000-4000-8000-000000000001',
        name: 'Producto Exclusivo Centro',
        categoryId: category.id,
        price: 1,
      },
    });

    const [centroProduct, norteProduct] = await Promise.all([
      centro.product.findFirst({
        where: { name: 'Producto Exclusivo Centro' },
      }),
      norte.product.findFirst({ where: { name: 'Producto Exclusivo Centro' } }),
    ]);
    if (!centroProduct || norteProduct) {
      throw new Error('Falló el aislamiento de productos');
    }

    await centro.inventoryItem.upsert({
      where: { name: 'Harina' },
      update: { currentStock: 20, unit: InventoryUnit.KILOGRAM },
      create: {
        name: 'Harina',
        unit: InventoryUnit.KILOGRAM,
        currentStock: 20,
        minimumStock: 2,
        costPerUnit: 1,
      },
    });
    await norte.inventoryItem.upsert({
      where: { name: 'Harina' },
      update: { currentStock: 8, unit: InventoryUnit.KILOGRAM },
      create: {
        name: 'Harina',
        unit: InventoryUnit.KILOGRAM,
        currentStock: 8,
        minimumStock: 2,
        costPerUnit: 1,
      },
    });

    await centro.inventoryItem.update({
      where: { name: 'Harina' },
      data: { currentStock: 15 },
    });
    const [centroFlour, norteFlour] = await Promise.all([
      centro.inventoryItem.findUniqueOrThrow({ where: { name: 'Harina' } }),
      norte.inventoryItem.findUniqueOrThrow({ where: { name: 'Harina' } }),
    ]);
    if (
      centroFlour.currentStock.toNumber() !== 15 ||
      norteFlour.currentStock.toNumber() !== 8
    ) {
      throw new Error('Falló el aislamiento de inventario');
    }

    console.log('PASS: branch databases are isolated');
  } finally {
    await Promise.all([
      centro.$disconnect().catch(() => undefined),
      norte.$disconnect().catch(() => undefined),
    ]);
  }
}

void main().catch((error: unknown) => {
  console.error(`FAIL: ${safeError(error)}`);
  process.exitCode = 1;
});
