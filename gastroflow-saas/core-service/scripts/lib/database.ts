import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { spawnSync } from 'node:child_process';
import { PrismaClient as BranchPrismaClient } from '../../src/generated/branch-client/client';
import { PrismaClient as ControlPrismaClient } from '../../src/generated/control-client/client';

export interface StoredBranchConnection {
  databaseHost: string;
  databasePort: number;
  databaseUser: string;
  databaseName: string;
}

export function createControlClient(): ControlPrismaClient {
  const connectionString = process.env.CONTROL_DATABASE_URL;
  if (!connectionString) {
    throw new Error('CONTROL_DATABASE_URL es obligatoria');
  }
  return new ControlPrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export function buildBranchUrl(
  branch: StoredBranchConnection,
  password: string,
): string {
  const url = new URL('postgresql://localhost');
  url.hostname = branch.databaseHost;
  url.port = String(branch.databasePort);
  url.username = branch.databaseUser;
  url.password = password;
  url.pathname = `/${branch.databaseName}`;
  url.searchParams.set('schema', 'public');
  return url.toString();
}

export function createBranchClient(
  connectionString: string,
): BranchPrismaClient {
  return new BranchPrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export function runPrismaForBranch(
  args: string[],
  connectionString: string,
  additionalEnvironment: NodeJS.ProcessEnv = {},
): void {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(command, ['prisma', ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...additionalEnvironment,
      BRANCH_DATABASE_URL: connectionString,
    },
    encoding: 'utf8',
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(
      'El proceso de migración de la sucursal no finalizó correctamente',
    );
  }
}

export function safeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.replace(/postgresql:\/\/[^\s]+/gi, '[URL OCULTA]');
  }
  return 'error desconocido';
}
