import { ConfigService } from '@nestjs/config';
import { NEVER, of } from 'rxjs';
import { BranchConnectionResolverClient } from './branch-connection-resolver.client';

const ID = '20000000-0000-4000-8000-000000000001';
const response = {
  branchId: ID,
  host: 'localhost',
  port: 5432,
  database: 'gastroflow_demo_principal',
  user: 'postgres',
  password: 'secret',
};

describe('BranchConnectionResolverClient', () => {
  it('uses the internal TCP contract and validates the response', async () => {
    const proxy = { send: jest.fn().mockReturnValue(of(response)) };
    const resolver = new BranchConnectionResolverClient(
      proxy as never,
      new ConfigService({
        INTERNAL_SERVICE_TOKEN: 'token',
        BRANCH_RESOLVER_TIMEOUT_MS: '50',
      }),
    );
    await expect(resolver.resolve(ID)).resolves.toEqual(response);
    expect(proxy.send).toHaveBeenCalledWith(
      { cmd: 'branch.connection.resolve' },
      { branchId: ID, internalToken: 'token' },
    );
  });

  it('times out with a sanitized error', async () => {
    const resolver = new BranchConnectionResolverClient(
      { send: () => NEVER } as never,
      new ConfigService({
        INTERNAL_SERVICE_TOKEN: 'token',
        BRANCH_RESOLVER_TIMEOUT_MS: '1',
      }),
    );
    await expect(resolver.resolve(ID)).rejects.toMatchObject({
      code: 'BRANCH_RESOLUTION_TIMEOUT',
    });
  });

  it('rejects an invalid Core response without exposing it', async () => {
    const resolver = new BranchConnectionResolverClient(
      { send: () => of({ password: 'secret' }) } as never,
      new ConfigService({ INTERNAL_SERVICE_TOKEN: 'token' }),
    );
    await expect(resolver.resolve(ID)).rejects.toMatchObject({
      code: 'INVALID_BRANCH_CONNECTION',
      message: 'Core returned an invalid branch connection',
    });
  });
});
