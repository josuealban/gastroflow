import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { spawnSync } from 'node:child_process';
import { DatabaseCredentialsEncryptionService } from '../src/database/encryption/database-credentials-encryption.service';
import { buildBranchUrl, createControlClient, safeError } from './lib/database';

interface BranchArguments {
  companyId: string;
  branchName: string;
  branchCode: string;
  databaseName: string;
}

function parseArguments(): BranchArguments {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const key = process.argv[index]?.replace(/^--/, '');
    const value = process.argv[index + 1];
    if (key && value) values.set(key, value);
  }

  const args = {
    companyId: values.get('companyId') ?? '',
    branchName: values.get('branchName') ?? '',
    branchCode: values.get('branchCode') ?? '',
    databaseName: values.get('databaseName') ?? '',
  };

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      args.companyId,
    )
  ) {
    throw new Error('companyId debe ser un UUID válido');
  }
  if (!args.branchName.trim() || args.branchName.length > 120) {
    throw new Error('branchName no es válido');
  }
  if (!/^[A-Z][A-Z0-9-]{2,31}$/.test(args.branchCode)) {
    throw new Error('branchCode debe usar mayúsculas, números y guiones');
  }
  if (!/^[a-z][a-z0-9_]{2,62}$/.test(args.databaseName)) {
    throw new Error('databaseName no es un identificador PostgreSQL seguro');
  }
  return args;
}

function runBranchSeed(connectionString: string): void {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(command, ['tsx', 'prisma/branch/seed.ts', 'empty'], {
    cwd: process.cwd(),
    env: { ...process.env, BRANCH_DATABASE_URL: connectionString },
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error('No fue posible aplicar el seed inicial');
  }
}

async function main(): Promise<void> {
  const args = parseArguments();
  const adminUrl = process.env.POSTGRES_ADMIN_DATABASE_URL;
  if (!adminUrl) {
    throw new Error('POSTGRES_ADMIN_DATABASE_URL es obligatoria');
  }

  const parsedAdminUrl = new URL(adminUrl);
  const control = createControlClient();
  const admin = new Client({ connectionString: adminUrl });
  const encryption = new DatabaseCredentialsEncryptionService(
    new ConfigService(process.env),
  );
  let databaseCreated = false;

  try {
    const company = await control.company.findUnique({
      where: { id: args.companyId },
      include: { subscription: { include: { plan: true } }, branches: true },
    });
    if (!company?.isActive || !company.subscription) {
      throw new Error('La empresa no está habilitada');
    }
    if (company.branches.length >= company.subscription.plan.maxBranches) {
      throw new Error('La empresa alcanzó el límite de sucursales de su plan');
    }
    const duplicate = await control.branch.findFirst({
      where: {
        OR: [{ code: args.branchCode }, { databaseName: args.databaseName }],
      },
    });
    if (duplicate) {
      throw new Error('Ya existe una sucursal con ese código o base de datos');
    }

    await admin.connect();
    const existing = await admin.query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists',
      [args.databaseName],
    );
    if (existing.rows[0]?.exists) {
      throw new Error('La base solicitada ya existe');
    }

    await admin.query(`CREATE DATABASE "${args.databaseName}"`);
    databaseCreated = true;

    const password = decodeURIComponent(parsedAdminUrl.password);
    const connection = {
      databaseHost: parsedAdminUrl.hostname,
      databasePort: Number(parsedAdminUrl.port || 5432),
      databaseUser: decodeURIComponent(parsedAdminUrl.username),
      databaseName: args.databaseName,
    };
    const branchUrl = buildBranchUrl(connection, password);

    const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const migration = spawnSync(
      command,
      [
        'prisma',
        'migrate',
        'deploy',
        '--config',
        'prisma/branch/prisma.config.ts',
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, BRANCH_DATABASE_URL: branchUrl },
        encoding: 'utf8',
        windowsHide: true,
      },
    );
    if (migration.status !== 0) {
      throw new Error('No fue posible aplicar las migraciones de sucursal');
    }
    runBranchSeed(branchUrl);

    await control.branch.create({
      data: {
        companyId: args.companyId,
        name: args.branchName,
        code: args.branchCode,
        databaseName: args.databaseName,
        databaseHost: connection.databaseHost,
        databasePort: connection.databasePort,
        databaseUser: connection.databaseUser,
        encryptedDatabasePassword: encryption.encrypt(password),
        isActive: true,
      },
    });

    console.log(`Sucursal ${args.branchCode} creada correctamente`);
  } catch (error: unknown) {
    if (databaseCreated) {
      await admin
        .query(`DROP DATABASE IF EXISTS "${args.databaseName}"`)
        .catch(() => undefined);
    }
    throw error;
  } finally {
    await Promise.all([
      admin.end().catch(() => undefined),
      control.$disconnect(),
    ]);
  }
}

void main().catch((error: unknown) => {
  console.error(`No fue posible crear la sucursal: ${safeError(error)}`);
  process.exitCode = 1;
});
