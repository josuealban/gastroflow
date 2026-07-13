import { ConfigService } from '@nestjs/config';
import { DatabaseCredentialsEncryptionService } from '../src/database/encryption/database-credentials-encryption.service';
import {
  buildBranchUrl,
  createBranchClient,
  createControlClient,
} from './lib/database';

async function main(): Promise<void> {
  const control = createControlClient();
  const encryption = new DatabaseCredentialsEncryptionService(
    new ConfigService(process.env),
  );

  try {
    const branches = await control.branch.findMany({
      orderBy: { code: 'asc' },
    });

    for (const branch of branches) {
      let connection = 'fallida';
      let migrations = 'no disponible';
      const client = createBranchClient(
        buildBranchUrl(
          branch,
          encryption.decrypt(branch.encryptedDatabasePassword),
        ),
      );

      try {
        await client.$connect();
        const result = await client.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint AS count
          FROM "_prisma_migrations"
          WHERE finished_at IS NOT NULL
        `;
        connection = 'exitosa';
        migrations = `${result[0]?.count ?? 0n} aplicadas`;
      } catch {
        connection = 'fallida';
      } finally {
        await client.$disconnect().catch(() => undefined);
      }

      console.log({
        branchId: branch.id,
        code: branch.code,
        databaseName: branch.databaseName,
        active: branch.isActive,
        connection,
        migrations,
      });
    }
  } finally {
    await control.$disconnect();
  }
}

void main().catch(() => {
  console.error('No fue posible consultar el estado de las sucursales');
  process.exitCode = 1;
});
