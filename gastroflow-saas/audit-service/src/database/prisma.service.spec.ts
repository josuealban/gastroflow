import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('requires AUDIT_DATABASE_URL', () => {
    expect(() => new PrismaService(new ConfigService({}))).toThrow(
      'AUDIT_DATABASE_URL es obligatoria',
    );
  });

  it('configures the audit client and disconnects cleanly', async () => {
    const service = new PrismaService(
      new ConfigService({
        AUDIT_DATABASE_URL:
          'postgresql://postgres:postgres@localhost:5432/gastroflow_audit',
      }),
    );
    const disconnect = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    expect(service.databaseUrlConfigured).toBe(true);
    await service.onModuleDestroy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
