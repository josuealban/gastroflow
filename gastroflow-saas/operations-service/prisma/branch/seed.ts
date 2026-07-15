import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/branch-client/client';

const target = process.argv[2];
if (target !== 'principal' && target !== 'norte') {
  throw new Error('Seed target must be principal or norte');
}
const variable =
  target === 'principal'
    ? 'DEMO_PRINCIPAL_DATABASE_URL'
    : 'DEMO_NORTE_DATABASE_URL';
const connectionString = process.env[variable];
if (!connectionString) throw new Error(`${variable} is required`);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const categories = [
  ['Entradas', 'Opciones ligeras para comenzar'],
  ['Platos fuertes', 'Especialidades principales del restaurante'],
  ['Bebidas', 'Bebidas frías y calientes'],
  ['Postres', 'Preparaciones dulces artesanales'],
] as const;

const products = [
  [
    'Empanadas de queso',
    'Entradas',
    'Masa de trigo, queso y especias',
    4.5,
    'empanadas',
  ],
  [
    'Ceviche clásico',
    'Entradas',
    'Pescado, limón, cebolla y cilantro',
    9.5,
    'ceviche',
  ],
  ['Locro de papa', 'Entradas', 'Papa, queso, leche y aguacate', 6.75, 'soup'],
  [
    'Seco de pollo',
    'Platos fuertes',
    'Pollo, arroz, plátano y salsa de cerveza',
    11.5,
    'chicken',
  ],
  [
    'Lomo a la plancha',
    'Platos fuertes',
    'Lomo, papas, vegetales y chimichurri',
    15.9,
    'steak',
  ],
  [
    'Arroz marinero',
    'Platos fuertes',
    'Arroz, camarón, calamar y mejillones',
    14.25,
    'seafood',
  ],
  [
    'Hamburguesa GastroFlow',
    'Platos fuertes',
    'Carne, queso, vegetales y pan artesanal',
    10.5,
    'burger',
  ],
  [
    'Limonada de hierbabuena',
    'Bebidas',
    'Limón, hierbabuena, agua y azúcar',
    3.25,
    'lemonade',
  ],
  ['Café americano', 'Bebidas', 'Café arábica y agua filtrada', 2.5, 'coffee'],
  [
    'Torta de chocolate',
    'Postres',
    'Chocolate, harina, huevos y crema',
    5.25,
    'cake',
  ],
  ['Tres leches', 'Postres', 'Bizcocho, tres leches y canela', 5.5, 'dessert'],
] as const;

const inventory = [
  ['Harina', 'INGREDIENT', 'KILOGRAM', 20, 5, 1.25],
  ['Pollo', 'INGREDIENT', 'KILOGRAM', 15, 4, 3.8],
  ['Arroz', 'INGREDIENT', 'KILOGRAM', 25, 6, 1.1],
  ['Limón', 'INGREDIENT', 'KILOGRAM', 12, 3, 1.9],
  ['Queso', 'INGREDIENT', 'KILOGRAM', 8, 2, 6.5],
  ['Servilletas', 'CONSUMABLE', 'UNIT', 500, 100, 0.03],
  ['Envases para llevar', 'CONSUMABLE', 'UNIT', 120, 30, 0.22],
  ['Sartén mediana', 'UTENSIL', 'UNIT', 8, 2, 18],
  ['Cuchillo de chef', 'UTENSIL', 'UNIT', 6, 2, 25],
] as const;

async function upsertTax(): Promise<void> {
  const existing = await prisma.taxConfiguration.findFirst({
    where: { name: 'IVA general' },
  });
  const data = {
    rate: 0.15,
    effectiveFrom: new Date('2024-04-01T00:00:00.000Z'),
    isActive: true,
  };
  if (existing)
    await prisma.taxConfiguration.update({ where: { id: existing.id }, data });
  else
    await prisma.taxConfiguration.create({
      data: { name: 'IVA general', ...data },
    });
}

async function upsertSupplier(name: string, taxId: string): Promise<void> {
  const existing = await prisma.supplier.findFirst({ where: { name } });
  const data = {
    taxId,
    phone: '+593222222222',
    email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`,
    isActive: true,
  };
  if (existing)
    await prisma.supplier.update({ where: { id: existing.id }, data });
  else await prisma.supplier.create({ data: { name, ...data } });
}

async function main(): Promise<void> {
  const categoryIds = new Map<string, string>();
  for (const [name, description] of categories) {
    const category = await prisma.category.upsert({
      where: { name },
      update: { description, isActive: true },
      create: { name, description },
    });
    categoryIds.set(name, category.id);
  }

  for (const [name, category, description, price, image] of products) {
    await prisma.product.upsert({
      where: { name },
      update: {
        categoryId: categoryIds.get(category)!,
        description,
        price,
        imageUrl: `https://images.unsplash.com/featured/800x600?${image}`,
        isAvailable: target === 'principal',
      },
      create: {
        name,
        categoryId: categoryIds.get(category)!,
        description,
        price,
        imageUrl: `https://images.unsplash.com/featured/800x600?${image}`,
        isAvailable: target === 'principal',
      },
    });
  }

  for (const [
    name,
    type,
    unit,
    principalStock,
    minimumStock,
    principalCost,
  ] of inventory) {
    await prisma.inventoryItem.upsert({
      where: { name },
      update: {
        type,
        unit,
        currentStock: target === 'principal' ? principalStock : 0,
        minimumStock,
        costPerUnit: target === 'principal' ? principalCost : 0,
        damagedQuantity: 0,
        lostQuantity: 0,
        isActive: true,
      },
      create: {
        name,
        type,
        unit,
        currentStock: target === 'principal' ? principalStock : 0,
        minimumStock,
        costPerUnit: target === 'principal' ? principalCost : 0,
        damagedQuantity: 0,
        lostQuantity: 0,
      },
    });
  }

  await upsertTax();
  await prisma.invoiceSequence.upsert({
    where: {
      establishment_emissionPoint: {
        establishment: '001',
        emissionPoint: '001',
      },
    },
    update: { currentNumber: 0 },
    create: { establishment: '001', emissionPoint: '001', currentNumber: 0 },
  });

  if (target === 'principal') {
    for (let number = 1; number <= 6; number += 1) {
      await prisma.restaurantTable.upsert({
        where: { number },
        update: {
          capacity: number <= 2 ? 2 : 4,
          status: 'AVAILABLE',
          isActive: true,
        },
        create: { number, capacity: number <= 2 ? 2 : 4 },
      });
    }
    for (const customer of [
      {
        name: 'Cliente Académico Uno',
        identification: '0990000001',
        email: 'cliente1@example.com',
      },
      {
        name: 'Cliente Académico Dos',
        identification: '0990000002',
        email: 'cliente2@example.com',
      },
    ]) {
      const existing = await prisma.customer.findFirst({
        where: { identification: customer.identification },
      });
      if (existing)
        await prisma.customer.update({
          where: { id: existing.id },
          data: customer,
        });
      else await prisma.customer.create({ data: customer });
    }
    await upsertSupplier('Proveedor Andino', '1790000001001');
    await upsertSupplier('Distribuidora Demo', '1790000002001');
  }

  console.log(`Branch seed completed: ${target}`);
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : 'Branch seed failed',
    );
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
