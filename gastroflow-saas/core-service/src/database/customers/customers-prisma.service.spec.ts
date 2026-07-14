import { ConfigService } from '@nestjs/config';
import { CustomersPrismaService } from './customers-prisma.service';

describe('CustomersPrismaService', () => {
  it('requires CUSTOMERS_DATABASE_URL without exposing a URL', () => {
    expect(() => new CustomersPrismaService(new ConfigService({}))).toThrow(
      'CUSTOMERS_DATABASE_URL es obligatoria',
    );
  });

  it('disconnects cleanly', async () => {
    const service = new CustomersPrismaService(
      new ConfigService({
        CUSTOMERS_DATABASE_URL:
          'postgresql://postgres:postgres@localhost:5432/gastroflow_clientes',
      }),
    );
    const disconnect = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
