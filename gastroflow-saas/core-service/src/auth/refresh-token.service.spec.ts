import { RpcException } from '@nestjs/microservices';
import { ControlPrismaService } from '../database/control/control-prisma.service';
import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService concurrent rotation', () => {
  function harness() {
    let active = true;
    const created: string[] = [];
    const tx = {
      refreshToken: {
        updateMany: jest.fn(() => {
          if (!active) return Promise.resolve({ count: 0 });
          active = false;
          return Promise.resolve({ count: 1 });
        }),
        create: jest.fn(({ data }: { data: { tokenHash: string } }) => {
          created.push(data.tokenHash);
          return Promise.resolve(data);
        }),
      },
    };
    const db = {
      $transaction: jest.fn((callback: (client: typeof tx) => Promise<void>) =>
        callback(tx),
      ),
    } as unknown as ControlPrismaService;
    return {
      service: new RefreshTokenService(db),
      created,
      isOriginalActive: () => active,
    };
  }

  async function assertSingleWinner(operation: 'refresh' | 'branch selection') {
    const { service, created, isOriginalActive } = harness();
    const base = {
      recordId: 'original',
      userId: 'user',
      expiresAt: new Date(Date.now() + 60_000),
    };
    const results = await Promise.allSettled([
      service.rotate({ ...base, tokenHash: `${operation}-one` }),
      service.rotate({ ...base, tokenHash: `${operation}-two` }),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(RpcException);
    expect(created).toHaveLength(1);
    expect(isOriginalActive()).toBe(false);
  }

  it('allows exactly one refresh with the same original token', () =>
    assertSingleWinner('refresh'));
  it('allows exactly one branch selection rotation with the same original token', () =>
    assertSingleWinner('branch selection'));
});
