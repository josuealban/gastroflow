import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ControlPrismaService } from '../database/control/control-prisma.service';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly db: ControlPrismaService) {}

  async rotate(input: {
    recordId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    const now = new Date();
    await this.db.$transaction(async (tx) => {
      const revoked = await tx.refreshToken.updateMany({
        where: { id: input.recordId, revokedAt: null, expiresAt: { gt: now } },
        data: { revokedAt: now },
      });
      if (revoked.count !== 1) {
        throw new RpcException({ statusCode: 401, message: 'Unauthorized' });
      }
      await tx.refreshToken.create({
        data: {
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      });
    });
  }
}
