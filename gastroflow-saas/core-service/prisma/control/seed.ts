import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../../src/generated/control-client/client';
import { DatabaseCredentialsEncryptionService } from '../../src/security/database-credentials-encryption.service';

const connectionString = process.env.CONTROL_DATABASE_URL;
if (!connectionString) throw new Error('CONTROL_DATABASE_URL is required');

const branchPassword = process.env.BRANCH_DATABASE_PASSWORD;
if (!branchPassword) throw new Error('BRANCH_DATABASE_PASSWORD is required');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
const encryption = new DatabaseCredentialsEncryptionService(
  new ConfigService(process.env),
);

const RESTAURANT_ID = '10000000-0000-4000-8000-000000000001';
const PRINCIPAL_ID = '20000000-0000-4000-8000-000000000001';
const NORTE_ID = '20000000-0000-4000-8000-000000000002';

const permissionNames = [
  'staff.read',
  'staff.create',
  'staff.update',
  'staff.assign',
  'staff.change-roles',
  'staff.deactivate',
  'branches.read',
  'branches.create',
  'branches.update',
  'branches.deactivate',
  'products.read',
  'products.create',
  'products.update',
  'products.delete',
  'inventory.read',
  'inventory.create',
  'inventory.update',
  'inventory.adjust',
  'inventory.view-cost',
  'customers.read',
  'customers.create',
  'customers.update',
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
  'suppliers.read',
  'suppliers.create',
  'suppliers.update',
  'purchases.read',
  'purchases.create',
  'purchases.receive',
  'purchases.cancel',
  'reports.read',
  'settings.manage',
] as const;

const users = [
  { name: 'Propietario Demo', email: 'owner@gastroflow.com', role: 'OWNER' },
  { name: 'Gerente Demo', email: 'manager@gastroflow.com', role: 'MANAGER' },
  { name: 'Mesero Demo', email: 'waiter@gastroflow.com', role: 'WAITER' },
  { name: 'Cajero Demo', email: 'cashier@gastroflow.com', role: 'CASHIER' },
  {
    name: 'Inventario Demo',
    email: 'inventory@gastroflow.com',
    role: 'INVENTORY_MANAGER',
  },
] as const;

async function main(): Promise<void> {
  const basic = await prisma.plan.upsert({
    where: { name: 'Plan Básico' },
    update: {
      price: 29,
      maxBranches: 1,
      maxUsersPerBranch: 5,
      maxTablesPerBranch: 10,
      maxProductsPerBranch: 30,
      isActive: true,
    },
    create: {
      name: 'Plan Básico',
      description: 'Plan inicial para restaurantes pequeños',
      price: 29,
      maxBranches: 1,
      maxUsersPerBranch: 5,
      maxTablesPerBranch: 10,
      maxProductsPerBranch: 30,
    },
  });
  void basic;
  const professional = await prisma.plan.upsert({
    where: { name: 'Plan Profesional' },
    update: {
      price: 99,
      maxBranches: 5,
      maxUsersPerBranch: 30,
      maxTablesPerBranch: 100,
      maxProductsPerBranch: 300,
      isActive: true,
    },
    create: {
      name: 'Plan Profesional',
      description: 'Plan multsucursal profesional',
      price: 99,
      maxBranches: 5,
      maxUsersPerBranch: 30,
      maxTablesPerBranch: 100,
      maxProductsPerBranch: 300,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: RESTAURANT_ID },
    update: {
      name: 'Restaurante Demo',
      email: 'demo@gastroflow.com',
      isActive: true,
    },
    create: {
      id: RESTAURANT_ID,
      name: 'Restaurante Demo',
      legalName: 'Restaurante Demo S.A.',
      taxId: '0999999999001',
      email: 'demo@gastroflow.com',
      phone: '+593999999999',
      address: 'Quito, Ecuador',
    },
  });
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  await prisma.subscription.upsert({
    where: { restaurantId: RESTAURANT_ID },
    update: {
      planId: professional.id,
      status: 'TRIAL',
      startDate: now,
      endDate,
    },
    create: {
      restaurantId: RESTAURANT_ID,
      planId: professional.id,
      status: 'TRIAL',
      startDate: now,
      endDate,
    },
  });

  const encryptedPassword = encryption.encrypt(branchPassword);
  const databaseHost = process.env.BRANCH_DATABASE_HOST ?? 'localhost';
  const databasePort = Number(process.env.BRANCH_DATABASE_PORT ?? 5432);
  const databaseUser = process.env.BRANCH_DATABASE_USER ?? 'postgres';
  const principal = await prisma.branch.upsert({
    where: { databaseName: 'gastroflow_demo_principal' },
    update: {
      restaurantId: RESTAURANT_ID,
      name: 'Sucursal Principal',
      code: 'PRINCIPAL',
      isPrimary: true,
      status: 'ACTIVE',
      databaseHost,
      databasePort,
      databaseUser,
      encryptedDatabasePassword: encryptedPassword,
      activatedAt: now,
    },
    create: {
      id: PRINCIPAL_ID,
      restaurantId: RESTAURANT_ID,
      name: 'Sucursal Principal',
      code: 'PRINCIPAL',
      description: 'Sucursal principal de demostración',
      city: 'Quito',
      isPrimary: true,
      status: 'ACTIVE',
      databaseName: 'gastroflow_demo_principal',
      databaseHost,
      databasePort,
      databaseUser,
      encryptedDatabasePassword: encryptedPassword,
      activatedAt: now,
    },
  });
  const norte = await prisma.branch.upsert({
    where: { databaseName: 'gastroflow_demo_norte' },
    update: {
      restaurantId: RESTAURANT_ID,
      name: 'Sucursal Norte',
      code: 'NORTE',
      isPrimary: false,
      status: 'ACTIVE',
      databaseHost,
      databasePort,
      databaseUser,
      encryptedDatabasePassword: encryptedPassword,
      activatedAt: now,
    },
    create: {
      id: NORTE_ID,
      restaurantId: RESTAURANT_ID,
      name: 'Sucursal Norte',
      code: 'NORTE',
      description: 'Sucursal nueva creada desde plantilla',
      city: 'Quito',
      status: 'ACTIVE',
      databaseName: 'gastroflow_demo_norte',
      databaseHost,
      databasePort,
      databaseUser,
      encryptedDatabasePassword: encryptedPassword,
      activatedAt: now,
    },
  });

  const permissions = new Map<string, { id: string }>();
  for (const name of permissionNames) {
    permissions.set(
      name,
      await prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
        select: { id: true },
      }),
    );
  }

  const roles = new Map<string, { id: string }>();
  for (const name of [
    'OWNER',
    'MANAGER',
    'WAITER',
    'CASHIER',
    'INVENTORY_MANAGER',
  ]) {
    roles.set(
      name,
      await prisma.role.upsert({
        where: { restaurantId_name: { restaurantId: RESTAURANT_ID, name } },
        update: { isActive: true },
        create: { restaurantId: RESTAURANT_ID, name, isActive: true },
        select: { id: true },
      }),
    );
  }

  const rolePermissions: Record<string, readonly string[]> = {
    OWNER: permissionNames,
    MANAGER: permissionNames.filter((name) => name !== 'settings.manage'),
    WAITER: [
      'products.read',
      'customers.read',
      'customers.create',
      'tables.read',
      'orders.read',
      'orders.create',
      'orders.update',
    ],
    CASHIER: [
      'customers.read',
      'orders.read',
      'payments.read',
      'payments.create',
      'invoices.read',
      'invoices.create',
      'invoices.download',
    ],
    INVENTORY_MANAGER: [
      'inventory.read',
      'inventory.create',
      'inventory.update',
      'inventory.adjust',
      'inventory.view-cost',
      'suppliers.read',
      'suppliers.create',
      'suppliers.update',
      'purchases.read',
      'purchases.create',
      'purchases.receive',
    ],
  };
  for (const [roleName, names] of Object.entries(rolePermissions)) {
    const roleId = roles.get(roleName)!.id;
    for (const name of names) {
      const permissionId = permissions.get(name)!.id;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  const passwordHash = await bcrypt.hash(
    process.env.DEMO_USER_PASSWORD ?? 'Demo123!',
    12,
  );
  for (const data of users) {
    const user = await prisma.user.upsert({
      where: {
        restaurantId_email: { restaurantId: RESTAURANT_ID, email: data.email },
      },
      update: { name: data.name, passwordHash, isActive: true },
      create: {
        restaurantId: RESTAURANT_ID,
        name: data.name,
        email: data.email,
        passwordHash,
        isActive: true,
      },
    });
    const roleId = roles.get(data.role)!.id;
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    });
    await prisma.userBranch.upsert({
      where: { userId_branchId: { userId: user.id, branchId: principal.id } },
      update: { isActive: true },
      create: { userId: user.id, branchId: principal.id },
    });
    await prisma.userBranchRole.upsert({
      where: {
        userId_branchId_roleId: {
          userId: user.id,
          branchId: principal.id,
          roleId,
        },
      },
      update: {},
      create: { userId: user.id, branchId: principal.id, roleId },
    });
    if (data.role === 'OWNER') {
      await prisma.userBranch.upsert({
        where: { userId_branchId: { userId: user.id, branchId: norte.id } },
        update: { isActive: true },
        create: { userId: user.id, branchId: norte.id },
      });
      await prisma.userBranchRole.upsert({
        where: {
          userId_branchId_roleId: {
            userId: user.id,
            branchId: norte.id,
            roleId,
          },
        },
        update: {},
        create: { userId: user.id, branchId: norte.id, roleId },
      });
    }
  }

  console.log('Control seed completed');
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : 'Control seed failed',
    );
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
