import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';
import {
  InventoryUnit,
  PrismaClient,
  TableStatus,
} from '../../src/generated/branch-client/client';

type SeedVariant = 'centro' | 'norte' | 'empty';

const variant = (process.argv[2]?.toLowerCase() ?? 'empty') as SeedVariant;
if (!['centro', 'norte', 'empty'].includes(variant)) {
  throw new Error('La variante del seed debe ser centro, norte o empty');
}

const connectionString =
  process.env.BRANCH_DATABASE_URL ??
  (variant === 'norte'
    ? process.env.DEMO_NORTE_DATABASE_URL
    : process.env.DEMO_CENTRO_DATABASE_URL);

if (!connectionString) {
  throw new Error('La URL de la base de sucursal es obligatoria para el seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const permissions = [
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'roles.read',
  'roles.create',
  'roles.update',
  'roles.delete',
  'roles.assign-permissions',
  'products.read',
  'products.create',
  'products.update',
  'products.delete',
  'tables.read',
  'tables.update',
  'customers.read',
  'customers.create',
  'customers.update',
  'orders.read',
  'orders.create',
  'orders.update',
  'orders.cancel',
  'payments.read',
  'payments.create',
  'inventory.read',
  'inventory.create',
  'inventory.update',
  'inventory.adjust',
  'inventory.entry',
  'inventory.exit',
  'inventory.view-cost',
  'inventory.view-consolidated',
  'suppliers.read',
  'suppliers.create',
  'suppliers.update',
  'suppliers.delete',
  'purchases.read',
  'purchases.create',
  'purchases.receive',
  'purchases.cancel',
  'recipes.read',
  'recipes.create',
  'recipes.update',
  'recipes.delete',
  'reports.read',
  'settings.manage',
] as const;

const rolePermissions: Record<string, readonly string[]> = {
  OWNER: permissions,
  MANAGER: permissions.filter(
    (permission) =>
      !['users.delete', 'roles.delete', 'settings.manage'].includes(permission),
  ),
  WAITER: [
    'products.read',
    'tables.read',
    'tables.update',
    'customers.read',
    'customers.create',
    'customers.update',
    'orders.read',
    'orders.create',
    'orders.update',
  ],
  CASHIER: [
    'products.read',
    'customers.read',
    'customers.create',
    'customers.update',
    'orders.read',
    'orders.update',
    'payments.read',
    'payments.create',
  ],
  INVENTORY_MANAGER: permissions.filter((permission) =>
    /^(inventory|suppliers|purchases|recipes)\./.test(permission),
  ),
};

async function seedSecurity(): Promise<void> {
  const permissionIds = new Map<string, string>();
  for (const name of permissions) {
    const permission = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    permissionIds.set(name, permission.id);
  }

  const roleIds = new Map<string, string>();
  for (const name of Object.keys(rolePermissions)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, description: `Rol inicial ${name}` },
    });
    roleIds.set(name, role.id);

    for (const permissionName of rolePermissions[name]) {
      const permissionId = permissionIds.get(permissionName);
      if (!permissionId) {
        throw new Error(`Permiso no definido: ${permissionName}`);
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId },
        },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }

  const users =
    variant === 'centro'
      ? [
          ['owner@demo.com', 'Propietario Demo', 'Owner123*', 'OWNER'],
          ['manager@demo.com', 'Gerente Demo', 'Manager123*', 'MANAGER'],
          ['waiter@demo.com', 'Mesero Demo', 'Waiter123*', 'WAITER'],
          ['cashier@demo.com', 'Cajero Demo', 'Cashier123*', 'CASHIER'],
          [
            'inventory@demo.com',
            'Inventario Demo',
            'Inventory123*',
            'INVENTORY_MANAGER',
          ],
        ]
      : variant === 'norte'
        ? [['owner@demo.com', 'Propietario Norte', 'Owner123*', 'OWNER']]
        : [];

  for (const [email, name, password, roleName] of users) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash: await hash(password, 12), isActive: true },
      create: { email, name, passwordHash: await hash(password, 12) },
    });
    const roleId = roleIds.get(roleName);
    if (!roleId) {
      throw new Error(`Rol no definido: ${roleName}`);
    }
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    });
  }
}

async function seedCentro(): Promise<void> {
  const category = await prisma.category.upsert({
    where: { name: 'Platos ecuatorianos' },
    update: { isActive: true },
    create: { name: 'Platos ecuatorianos' },
  });
  await prisma.product.upsert({
    where: { id: '20000000-0000-4000-8000-000000000001' },
    update: { name: 'Encebollado Centro', categoryId: category.id, price: 6.5 },
    create: {
      id: '20000000-0000-4000-8000-000000000001',
      name: 'Encebollado Centro',
      categoryId: category.id,
      price: 6.5,
    },
  });
  for (const number of [1, 2, 3, 4, 5]) {
    await prisma.restaurantTable.upsert({
      where: { number },
      update: { capacity: 4, status: TableStatus.AVAILABLE, isActive: true },
      create: { number, capacity: 4 },
    });
  }
  await prisma.customer.upsert({
    where: { id: '20000000-0000-4000-8000-000000000002' },
    update: { name: 'Cliente Centro', isActive: true },
    create: {
      id: '20000000-0000-4000-8000-000000000002',
      name: 'Cliente Centro',
      phone: '0991111111',
    },
  });
  await prisma.inventoryItem.upsert({
    where: { name: 'Arroz' },
    update: { currentStock: 30, unit: InventoryUnit.KILOGRAM },
    create: {
      name: 'Arroz',
      unit: InventoryUnit.KILOGRAM,
      currentStock: 30,
      minimumStock: 5,
      costPerUnit: 1.2,
    },
  });
  await prisma.supplier.upsert({
    where: { id: '20000000-0000-4000-8000-000000000003' },
    update: { name: 'Proveedor del Centro', isActive: true },
    create: {
      id: '20000000-0000-4000-8000-000000000003',
      name: 'Proveedor del Centro',
    },
  });
}

async function seedNorte(): Promise<void> {
  const category = await prisma.category.upsert({
    where: { name: 'Desayunos' },
    update: { isActive: true },
    create: { name: 'Desayunos' },
  });
  await prisma.product.upsert({
    where: { id: '30000000-0000-4000-8000-000000000001' },
    update: { name: 'Bolón Norte', categoryId: category.id, price: 4.75 },
    create: {
      id: '30000000-0000-4000-8000-000000000001',
      name: 'Bolón Norte',
      categoryId: category.id,
      price: 4.75,
    },
  });
  for (const number of [1, 2, 3]) {
    await prisma.restaurantTable.upsert({
      where: { number },
      update: { capacity: 2, status: TableStatus.AVAILABLE, isActive: true },
      create: { number, capacity: 2 },
    });
  }
  await prisma.customer.upsert({
    where: { id: '30000000-0000-4000-8000-000000000002' },
    update: { name: 'Cliente Norte', isActive: true },
    create: {
      id: '30000000-0000-4000-8000-000000000002',
      name: 'Cliente Norte',
      phone: '0992222222',
    },
  });
  await prisma.inventoryItem.upsert({
    where: { name: 'Plátano verde' },
    update: { currentStock: 25, unit: InventoryUnit.UNIT },
    create: {
      name: 'Plátano verde',
      unit: InventoryUnit.UNIT,
      currentStock: 25,
      minimumStock: 8,
      costPerUnit: 0.3,
    },
  });
  await prisma.supplier.upsert({
    where: { id: '30000000-0000-4000-8000-000000000003' },
    update: { name: 'Proveedor del Norte', isActive: true },
    create: {
      id: '30000000-0000-4000-8000-000000000003',
      name: 'Proveedor del Norte',
    },
  });
}

async function main(): Promise<void> {
  await seedSecurity();
  if (variant === 'centro') await seedCentro();
  if (variant === 'norte') await seedNorte();
  console.log(`Seed operacional ${variant} completado`);
}

main()
  .catch((error: unknown) => {
    console.error(
      'Falló el seed operacional:',
      error instanceof Error ? error.message : 'error desconocido',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
