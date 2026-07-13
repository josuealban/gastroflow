import { PrismaPg } from '@prisma/adapter-pg';
import {
  AuditSeverity,
  PrismaClient,
} from '../src/generated/audit-client/client';

const databaseTests =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

databaseTests('Audit PostgreSQL integration', () => {
  let prisma: PrismaClient;
  const externalEventId = 'integration-unique-event';

  beforeAll(async () => {
    const connectionString = process.env.AUDIT_DATABASE_URL;
    if (!connectionString) throw new Error('AUDIT_DATABASE_URL es obligatoria');
    prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
    await prisma.$connect();
    await prisma.auditLog.deleteMany({ where: { externalEventId } });
  });

  afterAll(async () => {
    await prisma?.auditLog.deleteMany({ where: { externalEventId } });
    await prisma?.$disconnect();
  });

  it('connects exclusively to the audit database', async () => {
    const database = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT current_database() AS name
    `;
    expect(database[0]?.name).toBe('gastroflow_audit');
  });

  it('enforces unique externalEventId', async () => {
    const data = {
      externalEventId,
      action: 'INTEGRATION_TEST',
      entity: 'Test',
      severity: AuditSeverity.INFO,
    };
    await prisma.auditLog.create({ data });
    await expect(prisma.auditLog.create({ data })).rejects.toThrow();
  });
});
