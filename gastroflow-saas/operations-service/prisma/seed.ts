import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  InventoryItemType,
  InventoryMovementType,
  InventoryUnit,
  PrismaClient,
  PurchaseStatus,
  TableStatus,
} from '../src/generated/operations-client/client';

const connectionString = process.env.OPERATIONS_DATABASE_URL;
if (!connectionString) {
  throw new Error('OPERATIONS_DATABASE_URL es obligatoria para el seed');
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_RESTAURANT_ID = '10000000-0000-4000-8000-000000000001';
const TEST_RESTAURANT_ID = '10000000-0000-4000-8000-000000000002';
const DEMO_OWNER_ID = '20000000-0000-4000-8000-000000000001';

async function main(): Promise<void> {
  const demoCategories = [
    ['40000000-0000-4000-8000-000000000001', 'Entradas'],
    ['40000000-0000-4000-8000-000000000002', 'Platos fuertes'],
    ['40000000-0000-4000-8000-000000000003', 'Bebidas'],
    ['40000000-0000-4000-8000-000000000004', 'Postres'],
  ] as const;
  for (const [id, name] of demoCategories) {
    await prisma.category.upsert({
      where: { restaurantId_name: { restaurantId: DEMO_RESTAURANT_ID, name } },
      update: { isActive: true },
      create: { id, restaurantId: DEMO_RESTAURANT_ID, name },
    });
  }

  const demoProducts = [
    [
      '41000000-0000-4000-8000-000000000001',
      demoCategories[0][0],
      'Empanadas',
      3.5,
      'Harina, queso y aceite',
    ],
    [
      '41000000-0000-4000-8000-000000000002',
      demoCategories[0][0],
      'Patacones',
      4,
      'Plátano verde y queso',
    ],
    [
      '41000000-0000-4000-8000-000000000003',
      demoCategories[1][0],
      'Seco de pollo',
      7.5,
      'Pollo, arroz y especias',
    ],
    [
      '41000000-0000-4000-8000-000000000004',
      demoCategories[1][0],
      'Encebollado',
      6.5,
      'Atún, yuca y cebolla',
    ],
    [
      '41000000-0000-4000-8000-000000000005',
      demoCategories[1][0],
      'Arroz con carne',
      8,
      'Carne, arroz y vegetales',
    ],
    [
      '41000000-0000-4000-8000-000000000006',
      demoCategories[2][0],
      'Limonada',
      2.5,
      'Limón, agua y azúcar',
    ],
    [
      '41000000-0000-4000-8000-000000000007',
      demoCategories[2][0],
      'Jugo de mora',
      3,
      'Mora, agua y azúcar',
    ],
    [
      '41000000-0000-4000-8000-000000000008',
      demoCategories[2][0],
      'Café',
      2,
      'Café molido y agua',
    ],
    [
      '41000000-0000-4000-8000-000000000009',
      demoCategories[3][0],
      'Flan',
      3.25,
      'Leche, huevos y azúcar',
    ],
    [
      '41000000-0000-4000-8000-000000000010',
      demoCategories[3][0],
      'Tres leches',
      4.5,
      'Bizcocho y mezcla de leches',
    ],
  ] as const;
  for (const [
    id,
    categoryId,
    name,
    price,
    ingredientDescription,
  ] of demoProducts) {
    await prisma.product.upsert({
      where: { restaurantId_name: { restaurantId: DEMO_RESTAURANT_ID, name } },
      update: { categoryId, price, ingredientDescription, isAvailable: true },
      create: {
        id,
        restaurantId: DEMO_RESTAURANT_ID,
        categoryId,
        name,
        price,
        ingredientDescription,
      },
    });
  }

  const testCategory = await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: TEST_RESTAURANT_ID,
        name: 'Cafetería',
      },
    },
    update: { isActive: true },
    create: {
      id: '40000000-0000-4000-8000-000000000101',
      restaurantId: TEST_RESTAURANT_ID,
      name: 'Cafetería',
    },
  });
  for (const [id, name, price, ingredients] of [
    [
      '41000000-0000-4000-8000-000000000101',
      'Sándwich Prueba',
      4.25,
      'Pan, queso y jamón',
    ],
    [
      '41000000-0000-4000-8000-000000000102',
      'Chocolate caliente',
      2.75,
      'Cacao y leche',
    ],
  ] as const) {
    await prisma.product.upsert({
      where: { restaurantId_name: { restaurantId: TEST_RESTAURANT_ID, name } },
      update: {
        categoryId: testCategory.id,
        price,
        ingredientDescription: ingredients,
      },
      create: {
        id,
        restaurantId: TEST_RESTAURANT_ID,
        categoryId: testCategory.id,
        name,
        price,
        ingredientDescription: ingredients,
      },
    });
  }

  for (let number = 1; number <= 6; number += 1) {
    await prisma.restaurantTable.upsert({
      where: {
        restaurantId_number: { restaurantId: DEMO_RESTAURANT_ID, number },
      },
      update: { capacity: 4, status: TableStatus.AVAILABLE, isActive: true },
      create: {
        id: `50000000-0000-4000-8000-${String(number).padStart(12, '0')}`,
        restaurantId: DEMO_RESTAURANT_ID,
        number,
        capacity: 4,
      },
    });
  }
  for (let number = 1; number <= 3; number += 1) {
    await prisma.restaurantTable.upsert({
      where: {
        restaurantId_number: { restaurantId: TEST_RESTAURANT_ID, number },
      },
      update: { capacity: 2, status: TableStatus.AVAILABLE, isActive: true },
      create: {
        id: `50000000-0000-4000-8000-${String(number + 100).padStart(12, '0')}`,
        restaurantId: TEST_RESTAURANT_ID,
        number,
        capacity: 2,
      },
    });
  }

  const demoInventory = [
    [
      '60000000-0000-4000-8000-000000000001',
      'Carne',
      InventoryItemType.INGREDIENT,
      InventoryUnit.KILOGRAM,
      20,
      5,
      6,
    ],
    [
      '60000000-0000-4000-8000-000000000002',
      'Arroz',
      InventoryItemType.INGREDIENT,
      InventoryUnit.KILOGRAM,
      40,
      10,
      1.2,
    ],
    [
      '60000000-0000-4000-8000-000000000003',
      'Aceite',
      InventoryItemType.INGREDIENT,
      InventoryUnit.LITER,
      15,
      3,
      2.5,
    ],
    [
      '60000000-0000-4000-8000-000000000004',
      'Servilletas',
      InventoryItemType.CONSUMABLE,
      InventoryUnit.UNIT,
      500,
      100,
      0.02,
    ],
    [
      '60000000-0000-4000-8000-000000000005',
      'Envases',
      InventoryItemType.CONSUMABLE,
      InventoryUnit.UNIT,
      120,
      30,
      0.18,
    ],
    [
      '60000000-0000-4000-8000-000000000006',
      'Platos',
      InventoryItemType.UTENSIL,
      InventoryUnit.UNIT,
      78,
      20,
      2.75,
    ],
  ] as const;
  for (const [
    id,
    name,
    type,
    unit,
    currentStock,
    minimumStock,
    costPerUnit,
  ] of demoInventory) {
    await prisma.inventoryItem.upsert({
      where: { restaurantId_name: { restaurantId: DEMO_RESTAURANT_ID, name } },
      update: {
        type,
        unit,
        currentStock,
        minimumStock,
        costPerUnit,
        isActive: true,
      },
      create: {
        id,
        restaurantId: DEMO_RESTAURANT_ID,
        name,
        type,
        unit,
        currentStock,
        minimumStock,
        costPerUnit,
      },
    });
  }
  await prisma.inventoryItem.update({
    where: {
      restaurantId_name: {
        restaurantId: DEMO_RESTAURANT_ID,
        name: 'Platos',
      },
    },
    data: { damagedQuantity: 2 },
  });
  await prisma.inventoryItem.upsert({
    where: {
      restaurantId_name: {
        restaurantId: TEST_RESTAURANT_ID,
        name: 'Café en grano',
      },
    },
    update: { currentStock: 12, costPerUnit: 8 },
    create: {
      id: '60000000-0000-4000-8000-000000000101',
      restaurantId: TEST_RESTAURANT_ID,
      name: 'Café en grano',
      type: InventoryItemType.INGREDIENT,
      unit: InventoryUnit.KILOGRAM,
      currentStock: 12,
      minimumStock: 3,
      costPerUnit: 8,
    },
  });

  const suppliers = [
    ['61000000-0000-4000-8000-000000000001', 'Distribuidora Central'],
    ['61000000-0000-4000-8000-000000000002', 'Mercado Fresco'],
  ] as const;
  for (const [id, name] of suppliers) {
    await prisma.supplier.upsert({
      where: { id },
      update: { name, isActive: true },
      create: { id, restaurantId: DEMO_RESTAURANT_ID, name },
    });
  }
  const purchases = [
    [
      '62000000-0000-4000-8000-000000000001',
      suppliers[0][0],
      'COMPRA-001',
      40,
      6,
      46,
    ],
    [
      '62000000-0000-4000-8000-000000000002',
      suppliers[1][0],
      'COMPRA-002',
      60,
      9,
      69,
    ],
  ] as const;
  for (const [
    id,
    supplierId,
    invoiceNumber,
    subtotal,
    tax,
    total,
  ] of purchases) {
    await prisma.purchase.upsert({
      where: { id },
      update: {
        status: PurchaseStatus.RECEIVED,
        receivedAt: new Date('2026-07-01T12:00:00.000Z'),
      },
      create: {
        id,
        restaurantId: DEMO_RESTAURANT_ID,
        supplierId,
        createdByUserId: DEMO_OWNER_ID,
        invoiceNumber,
        status: PurchaseStatus.RECEIVED,
        subtotal,
        tax,
        total,
        receivedAt: new Date('2026-07-01T12:00:00.000Z'),
      },
    });
  }
  await prisma.purchaseItem.upsert({
    where: { id: '63000000-0000-4000-8000-000000000001' },
    update: { quantity: 10, unitCost: 1.2, subtotal: 12 },
    create: {
      id: '63000000-0000-4000-8000-000000000001',
      restaurantId: DEMO_RESTAURANT_ID,
      purchaseId: purchases[0][0],
      inventoryItemId: demoInventory[1][0],
      quantity: 10,
      unitCost: 1.2,
      subtotal: 12,
    },
  });
  await prisma.purchaseItem.upsert({
    where: { id: '63000000-0000-4000-8000-000000000002' },
    update: { quantity: 5, unitCost: 6, subtotal: 30 },
    create: {
      id: '63000000-0000-4000-8000-000000000002',
      restaurantId: DEMO_RESTAURANT_ID,
      purchaseId: purchases[1][0],
      inventoryItemId: demoInventory[0][0],
      quantity: 5,
      unitCost: 6,
      subtotal: 30,
    },
  });
  await prisma.inventoryMovement.upsert({
    where: { id: '64000000-0000-4000-8000-000000000001' },
    update: { newStock: 40 },
    create: {
      id: '64000000-0000-4000-8000-000000000001',
      restaurantId: DEMO_RESTAURANT_ID,
      inventoryItemId: demoInventory[1][0],
      createdByUserId: DEMO_OWNER_ID,
      type: InventoryMovementType.PURCHASE_ENTRY,
      quantity: 10,
      previousStock: 30,
      newStock: 40,
      referenceType: 'Purchase',
      referenceId: purchases[0][0],
    },
  });
  await prisma.inventoryMovement.upsert({
    where: { id: '64000000-0000-4000-8000-000000000002' },
    update: { newStock: 78 },
    create: {
      id: '64000000-0000-4000-8000-000000000002',
      restaurantId: DEMO_RESTAURANT_ID,
      inventoryItemId: demoInventory[5][0],
      createdByUserId: DEMO_OWNER_ID,
      type: InventoryMovementType.DAMAGED,
      quantity: 2,
      previousStock: 80,
      newStock: 78,
      reason: 'Daño durante lavado',
    },
  });

  await prisma.taxConfiguration.upsert({
    where: { id: '70000000-0000-4000-8000-000000000001' },
    update: { rate: 0.15, isActive: true },
    create: {
      id: '70000000-0000-4000-8000-000000000001',
      restaurantId: DEMO_RESTAURANT_ID,
      name: 'IVA configurable demo',
      rate: 0.15,
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    },
  });
  await prisma.taxConfiguration.upsert({
    where: { id: '70000000-0000-4000-8000-000000000101' },
    update: { rate: 0.12, isActive: true },
    create: {
      id: '70000000-0000-4000-8000-000000000101',
      restaurantId: TEST_RESTAURANT_ID,
      name: 'Tasa propia de prueba',
      rate: 0.12,
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    },
  });
  for (const [id, restaurantId] of [
    ['71000000-0000-4000-8000-000000000001', DEMO_RESTAURANT_ID],
    ['71000000-0000-4000-8000-000000000101', TEST_RESTAURANT_ID],
  ] as const) {
    await prisma.invoiceSequence.upsert({
      where: {
        restaurantId_establishment_emissionPoint: {
          restaurantId,
          establishment: '001',
          emissionPoint: '001',
        },
      },
      update: {},
      create: {
        id,
        restaurantId,
        establishment: '001',
        emissionPoint: '001',
        currentNumber: 0,
      },
    });
  }

  console.log('Seed de operaciones completado para dos restaurantes');
}

void main()
  .catch((error: unknown) => {
    console.error(
      'Falló el seed de operaciones:',
      error instanceof Error ? error.message : 'error desconocido',
    );
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
