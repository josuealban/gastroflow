import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import {
  PrismaClient,
  SubscriptionStatus,
} from '../../src/generated/control-client/client';
import { DatabaseCredentialsEncryptionService } from '../../src/database/encryption/database-credentials-encryption.service';

const connectionString = process.env.CONTROL_DATABASE_URL;
if (!connectionString) {
  throw new Error('CONTROL_DATABASE_URL es obligatoria para el seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const COMPANY_ID = '10000000-0000-4000-8000-000000000001';

async function main(): Promise<void> {
  const encryption = new DatabaseCredentialsEncryptionService(
    new ConfigService(process.env),
  );
  const encryptedPassword = encryption.encrypt('postgres');
  const passwordHash = await hash('Owner123*', 12);

  const basicPlan = await prisma.plan.upsert({
    where: { name: 'Básico' },
    update: {
      price: 29.9,
      maxBranches: 1,
      maxUsersPerBranch: 5,
      maxTablesPerBranch: 10,
      maxProductsPerBranch: 50,
      isActive: true,
    },
    create: {
      name: 'Básico',
      description: 'Plan inicial para un restaurante pequeño',
      price: 29.9,
      maxBranches: 1,
      maxUsersPerBranch: 5,
      maxTablesPerBranch: 10,
      maxProductsPerBranch: 50,
    },
  });

  const professionalPlan = await prisma.plan.upsert({
    where: { name: 'Profesional' },
    update: {
      price: 99.9,
      maxBranches: 5,
      maxUsersPerBranch: 30,
      maxTablesPerBranch: 100,
      maxProductsPerBranch: 500,
      isActive: true,
    },
    create: {
      name: 'Profesional',
      description: 'Plan para operaciones con varias sucursales',
      price: 99.9,
      maxBranches: 5,
      maxUsersPerBranch: 30,
      maxTablesPerBranch: 100,
      maxProductsPerBranch: 500,
    },
  });

  await prisma.company.upsert({
    where: { id: COMPANY_ID },
    update: {
      name: 'Restaurante Demo',
      email: 'admin@demo.com',
      isActive: true,
    },
    create: {
      id: COMPANY_ID,
      name: 'Restaurante Demo',
      legalName: 'Restaurante Demo S.A.S.',
      taxId: '0999999999001',
      email: 'admin@demo.com',
      phone: '0990000000',
    },
  });

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);

  await prisma.subscription.upsert({
    where: { companyId: COMPANY_ID },
    update: {
      planId: professionalPlan.id,
      status: SubscriptionStatus.TRIAL,
      startDate,
      endDate,
    },
    create: {
      companyId: COMPANY_ID,
      planId: professionalPlan.id,
      status: SubscriptionStatus.TRIAL,
      startDate,
      endDate,
    },
  });

  const commonDatabase = {
    companyId: COMPANY_ID,
    databaseHost: '127.0.0.1',
    databasePort: 5432,
    databaseUser: 'postgres',
    encryptedDatabasePassword: encryptedPassword,
    isActive: true,
  };

  await prisma.branch.upsert({
    where: { code: 'DEMO-CENTRO' },
    update: {
      ...commonDatabase,
      name: 'Sucursal Centro',
      databaseName: 'gastroflow_demo_centro',
    },
    create: {
      ...commonDatabase,
      name: 'Sucursal Centro',
      code: 'DEMO-CENTRO',
      address: 'Centro de la ciudad',
      databaseName: 'gastroflow_demo_centro',
    },
  });

  await prisma.branch.upsert({
    where: { code: 'DEMO-NORTE' },
    update: {
      ...commonDatabase,
      name: 'Sucursal Norte',
      databaseName: 'gastroflow_demo_norte',
    },
    create: {
      ...commonDatabase,
      name: 'Sucursal Norte',
      code: 'DEMO-NORTE',
      address: 'Norte de la ciudad',
      databaseName: 'gastroflow_demo_norte',
    },
  });

  await prisma.platformAdmin.upsert({
    where: { email: 'platform.admin@demo.com' },
    update: {
      name: 'Administrador de Plataforma',
      passwordHash,
      isActive: true,
    },
    create: {
      name: 'Administrador de Plataforma',
      email: 'platform.admin@demo.com',
      passwordHash,
    },
  });

  console.log(
    `Seed de control completado: planes ${basicPlan.name} y ${professionalPlan.name}`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      'Falló el seed de control:',
      error instanceof Error ? error.message : 'error desconocido',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
