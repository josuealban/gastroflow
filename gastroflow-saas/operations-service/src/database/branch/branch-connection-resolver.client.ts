import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError, timeout } from 'rxjs';
import { BranchDatabaseError } from './branch-errors';
import { ResolvedBranchConnection } from './interfaces/resolved-branch-connection.interface';

export const CORE_BRANCH_CONNECTION_CLIENT = Symbol(
  'CORE_BRANCH_CONNECTION_CLIENT',
);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class BranchConnectionResolverClient {
  private readonly internalToken: string;
  private readonly timeoutMs: number;

  constructor(
    @Inject(CORE_BRANCH_CONNECTION_CLIENT)
    private readonly client: ClientProxy,
    configService: ConfigService,
  ) {
    this.internalToken =
      configService.get<string>('INTERNAL_SERVICE_TOKEN') ?? '';
    const configuredTimeout = Number(
      configService.get<string>('BRANCH_RESOLVER_TIMEOUT_MS') ?? 3000,
    );
    if (!this.internalToken) {
      throw new Error('INTERNAL_SERVICE_TOKEN is required');
    }
    if (!Number.isInteger(configuredTimeout) || configuredTimeout <= 0) {
      throw new Error('BRANCH_RESOLVER_TIMEOUT_MS must be a positive integer');
    }
    this.timeoutMs = configuredTimeout;
  }

  async resolve(branchId: string): Promise<ResolvedBranchConnection> {
    let response: unknown;
    try {
      response = await firstValueFrom(
        this.client
          .send(
            { cmd: 'branch.connection.resolve' },
            {
              branchId,
              internalToken: this.internalToken,
            },
          )
          .pipe(timeout(this.timeoutMs)),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new BranchDatabaseError(
          'BRANCH_RESOLUTION_TIMEOUT',
          'Core timed out while resolving the branch connection',
        );
      }
      throw error;
    }

    if (!this.isValidResponse(response, branchId)) {
      throw new BranchDatabaseError(
        'INVALID_BRANCH_CONNECTION',
        'Core returned an invalid branch connection',
      );
    }
    return response;
  }

  private isValidResponse(
    value: unknown,
    expectedBranchId: string,
  ): value is ResolvedBranchConnection {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return (
      candidate.branchId === expectedBranchId &&
      UUID_PATTERN.test(expectedBranchId) &&
      typeof candidate.host === 'string' &&
      candidate.host.length > 0 &&
      Number.isInteger(candidate.port) &&
      Number(candidate.port) > 0 &&
      Number(candidate.port) <= 65_535 &&
      typeof candidate.database === 'string' &&
      /^[a-zA-Z0-9_]+$/.test(candidate.database) &&
      typeof candidate.user === 'string' &&
      candidate.user.length > 0 &&
      typeof candidate.password === 'string' &&
      candidate.password.length > 0
    );
  }
}
