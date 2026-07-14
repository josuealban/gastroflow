import { ConfigService } from '@nestjs/config';
import { OperationsPrismaService } from './operations-prisma.service';

describe('OperationsPrismaService', () => {
  it('requires OPERATIONS_DATABASE_URL without exposing a URL', () => {
    expect(() => new OperationsPrismaService(new ConfigService({}))).toThrow(
      'OPERATIONS_DATABASE_URL es obligatoria',
    );
  });

  it('disconnects cleanly', async () => {
    const service = new OperationsPrismaService(
      new ConfigService({
        OPERATIONS_DATABASE_URL:
          'postgresql://postgres:postgres@localhost:5432/gastroflow_operaciones',
      }),
    );
    const disconnect = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
