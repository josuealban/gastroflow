import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AuditSeverity,
  PrismaClient,
} from '../src/generated/audit-client/client';

const connectionString = process.env.AUDIT_DATABASE_URL;
if (!connectionString) {
  throw new Error('AUDIT_DATABASE_URL es obligatoria para el seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main(): Promise<void> {
  await prisma.auditLog.upsert({
    where: { externalEventId: 'phase-2-initialized' },
    update: { severity: AuditSeverity.INFO },
    create: {
      externalEventId: 'phase-2-initialized',
      action: 'PHASE_2_INITIALIZED',
      entity: 'Platform',
      severity: AuditSeverity.INFO,
      metadata: { environment: 'development' },
    },
  });
  console.log('Seed de auditoría completado');
}

main()
  .catch((error: unknown) => {
    console.error(
      'Falló el seed de auditoría:',
      error instanceof Error ? error.message : 'error desconocido',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
