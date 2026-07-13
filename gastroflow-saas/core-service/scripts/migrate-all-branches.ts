import { ConfigService } from '@nestjs/config';
import { DatabaseCredentialsEncryptionService } from '../src/database/encryption/database-credentials-encryption.service';
import {
  buildBranchUrl,
  createControlClient,
  runPrismaForBranch,
  safeError,
} from './lib/database';

async function main(): Promise<void> {
  const control = createControlClient();
  const encryption = new DatabaseCredentialsEncryptionService(
    new ConfigService(process.env),
  );

  try {
    const branches = await control.branch.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
    let succeeded = 0;
    let failed = 0;

    for (const branch of branches) {
      try {
        const password = encryption.decrypt(branch.encryptedDatabasePassword);
        runPrismaForBranch(
          ['migrate', 'deploy', '--config', 'prisma/branch/prisma.config.ts'],
          buildBranchUrl(branch, password),
        );
        succeeded += 1;
        console.log(`${branch.code}: migración aplicada`);
      } catch (error: unknown) {
        failed += 1;
        console.error(`${branch.code}: ${safeError(error)}`);
      }
    }

    console.log(
      `Resumen de migraciones: ${succeeded} correctas, ${failed} fallidas`,
    );
    if (failed > 0) process.exitCode = 1;
  } finally {
    await control.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(`No fue posible migrar las sucursales: ${safeError(error)}`);
  process.exitCode = 1;
});
