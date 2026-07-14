import { ConfigService } from '@nestjs/config';
import { PersonalPrismaService } from './personal-prisma.service';

describe('PersonalPrismaService', () => {
  it('requires PERSONAL_DATABASE_URL without exposing a URL', () => {
    expect(() => new PersonalPrismaService(new ConfigService({}))).toThrow(
      'PERSONAL_DATABASE_URL es obligatoria',
    );
  });

  it('disconnects cleanly', async () => {
    const service = new PersonalPrismaService(
      new ConfigService({
        PERSONAL_DATABASE_URL:
          'postgresql://postgres:postgres@localhost:5432/gastroflow_personal',
      }),
    );
    const disconnect = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
