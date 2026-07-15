import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/branch-client/client';

export type DemoBranchTarget = 'principal' | 'norte';

export function getBranchUrl(target: DemoBranchTarget): string {
  const variable =
    target === 'principal'
      ? 'DEMO_PRINCIPAL_DATABASE_URL'
      : 'DEMO_NORTE_DATABASE_URL';
  const value = process.env[variable];
  if (!value) throw new Error(`${variable} is required`);
  return value;
}

export function createBranchClient(target: DemoBranchTarget): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: getBranchUrl(target) }),
  });
}

export function safeDatabaseName(target: DemoBranchTarget): string {
  const name = new URL(getBranchUrl(target)).pathname.replace(/^\//, '');
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error('Configured branch database name is invalid');
  }
  return name;
}
