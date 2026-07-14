import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';
import {
  PrismaClient,
  SubscriptionStatus,
} from '../../src/generated/personal-client/client';

const connectionString = process.env.PERSONAL_DATABASE_URL;
if (!connectionString) {
  throw new Error('PERSONAL_DATABASE_URL es obligatoria para el seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

export const DEMO_RESTAURANT_ID = '10000000-0000-4000-8000-000000000001';
export const TEST_RESTAURANT_ID = '10000000-0000-4000-8000-000000000002';

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
  'customers.read',
  'customers.create',
  'customers.update',
  'customers.delete',
  'products.read',
  'products.create',
  'products.update',
  'products.delete',
  'tables.read',
  'tables.manage',
  'orders.read',
  'orders.create',
  'orders.update',
  'orders.cancel',
  'payments.read',
  'payments.create',
  'invoices.read',
  'invoices.create',
  'invoices.download',
  'invoices.cancel',
  'inventory.read',
  'inventory.create',
  'inventory.update',
  'inventory.adjust',
  'inventory.view-cost',
  'suppliers.read',
  'suppliers.create',
  'suppliers.update',
  'suppliers.delete',
  'purchases.read',
  'purchases.create',
  'purchases.receive',
  'purchases.cancel',
  'reports.read',
  'settings.manage',
] as const;

const rolePermissions: Record<string, readonly string[]> = {
  OWNER: permissions,
  MANAGER: permissions.filter(
    (permission) =>
      !['users.delete', 'roles.delete', 'settings.manage'].includes(permission),
  ),
  WAITER: permissions.filter((permission) =>
    /^(customers|products|tables|orders)\./.test(permission),
  ),
  CASHIER: permissions.filter((permission) =>
    /^(customers|orders|payments|invoices)\./.test(permission),
  ),
  INVENTORY_MANAGER: permissions.filter((permission) =>
    /^(inventory|suppliers|purchases)\./.test(permission),
  ),
};

async function seedRoles(restaurantId: string): Promise<Map<string, string>> {
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
  for (const [name, assignedPermissions] of Object.entries(rolePermissions)) {
    const role = await prisma.role.upsert({
      where: { restaurantId_name: { restaurantId, name } },
      update: { isActive: true },
      create: { restaurantId, name, description: `Rol inicial ${name}` },
    });
    roleIds.set(name, role.id);

    for (const permissionName of assignedPermissions) {
      const permissionId = permissionIds.get(permissionName);
      if (!permissionId)
        throw new Error(`Permiso no definido: ${permissionName}`);
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }
  return roleIds;
}

async function main(): Promise<void> {
  const basic = await prisma.plan.upsert({
    where: { name: 'Básico' },
    update: {
      maxUsers: 5,
      maxProducts: 30,
      maxTables: 10,
      isActive: true,
    },
    create: {
      id: '11000000-0000-4000-8000-000000000001',
      name: 'Básico',
      description: 'Plan inicial para restaurantes pequeños',
      price: 29.9,
      maxUsers: 5,
      maxProducts: 30,
      maxTables: 10,
    },
  });
  const professional = await prisma.plan.upsert({
    where: { name: 'Profesional' },
    update: {
      maxUsers: 30,
      maxProducts: 300,
      maxTables: 100,
      isActive: true,
    },
    create: {
      id: '11000000-0000-4000-8000-000000000002',
      name: 'Profesional',
      description: 'Plan para restaurantes con operación amplia',
      price: 99.9,
      maxUsers: 30,
      maxProducts: 300,
      maxTables: 100,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: DEMO_RESTAURANT_ID },
    update: { name: 'Restaurante Demo', isActive: true },
    create: {
      id: DEMO_RESTAURANT_ID,
      name: 'Restaurante Demo',
      legalName: 'Restaurante Demo S.A.S.',
      taxId: '0999999999001',
      email: 'admin@gastroflow.com',
      phone: '0990000000',
      address: 'Av. Principal 100',
    },
  });
  await prisma.restaurant.upsert({
    where: { id: TEST_RESTAURANT_ID },
    update: { name: 'Restaurante Prueba', isActive: true },
    create: {
      id: TEST_RESTAURANT_ID,
      name: 'Restaurante Prueba',
      email: 'prueba@gastroflow.com',
    },
  });

  const startDate = new Date('2026-01-01T00:00:00.000Z');
  const endDate = new Date('2030-01-01T00:00:00.000Z');
  await prisma.subscription.upsert({
    where: { restaurantId: DEMO_RESTAURANT_ID },
    update: {
      planId: professional.id,
      status: SubscriptionStatus.TRIAL,
      endDate,
    },
    create: {
      restaurantId: DEMO_RESTAURANT_ID,
      planId: professional.id,
      status: SubscriptionStatus.TRIAL,
      startDate,
      endDate,
    },
  });
  await prisma.subscription.upsert({
    where: { restaurantId: TEST_RESTAURANT_ID },
    update: { planId: basic.id, status: SubscriptionStatus.TRIAL, endDate },
    create: {
      restaurantId: TEST_RESTAURANT_ID,
      planId: basic.id,
      status: SubscriptionStatus.TRIAL,
      startDate,
      endDate,
    },
  });

  const demoRoles = await seedRoles(DEMO_RESTAURANT_ID);
  const testRoles = await seedRoles(TEST_RESTAURANT_ID);
  const passwordHash = await hash('Demo123*', 12);
  const demoUsers = [
    [
      '20000000-0000-4000-8000-000000000001',
      'owner@gastroflow.com',
      'Propietario Demo',
      'OWNER',
    ],
    [
      '20000000-0000-4000-8000-000000000002',
      'manager@gastroflow.com',
      'Gerente Demo',
      'MANAGER',
    ],
    [
      '20000000-0000-4000-8000-000000000003',
      'waiter@gastroflow.com',
      'Mesero Demo',
      'WAITER',
    ],
    [
      '20000000-0000-4000-8000-000000000004',
      'cashier@gastroflow.com',
      'Cajero Demo',
      'CASHIER',
    ],
    [
      '20000000-0000-4000-8000-000000000005',
      'inventory@gastroflow.com',
      'Inventario Demo',
      'INVENTORY_MANAGER',
    ],
  ] as const;

  for (const [id, email, name, roleName] of demoUsers) {
    const user = await prisma.user.upsert({
      where: {
        restaurantId_email: { restaurantId: DEMO_RESTAURANT_ID, email },
      },
      update: { name, passwordHash, isActive: true },
      create: {
        id,
        restaurantId: DEMO_RESTAURANT_ID,
        email,
        name,
        passwordHash,
      },
    });
    const roleId = demoRoles.get(roleName);
    if (!roleId) throw new Error(`Rol no definido: ${roleName}`);
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    });
    await prisma.employeeProfile.upsert({
      where: { userId: user.id },
      update: { position: roleName },
      create: { userId: user.id, position: roleName },
    });
  }

  const testEmail = 'owner@gastroflow.com';
  const testOwner = await prisma.user.upsert({
    where: {
      restaurantId_email: {
        restaurantId: TEST_RESTAURANT_ID,
        email: testEmail,
      },
    },
    update: { name: 'Propietario Prueba', passwordHash, isActive: true },
    create: {
      id: '20000000-0000-4000-8000-000000000101',
      restaurantId: TEST_RESTAURANT_ID,
      email: testEmail,
      name: 'Propietario Prueba',
      passwordHash,
    },
  });
  const testOwnerRoleId = testRoles.get('OWNER');
  if (!testOwnerRoleId) throw new Error('Rol OWNER de prueba no definido');
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: testOwner.id, roleId: testOwnerRoleId } },
    update: {},
    create: { userId: testOwner.id, roleId: testOwnerRoleId },
  });

  console.log('Seed de personal completado para dos restaurantes');
}

void main()
  .catch((error: unknown) => {
    console.error(
      'Falló el seed de personal:',
      error instanceof Error ? error.message : 'error desconocido',
    );
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
