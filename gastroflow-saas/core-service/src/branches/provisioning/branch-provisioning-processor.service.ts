import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ControlPrismaService } from '../../database/control/control-prisma.service';
import { DatabaseCredentialsEncryptionService } from '../../security/database-credentials-encryption.service';
export const OPERATIONS_PROVISIONING_CLIENT = Symbol(
  'OPERATIONS_PROVISIONING_CLIENT',
);
@Injectable()
export class BranchProvisioningProcessorService
  implements OnModuleInit, OnModuleDestroy
{
  private timer?: NodeJS.Timeout;
  private readonly token: string;
  private readonly interval: number;
  private readonly timeoutMs: number;
  constructor(
    private readonly db: ControlPrismaService,
    private readonly encryption: DatabaseCredentialsEncryptionService,
    @Inject(OPERATIONS_PROVISIONING_CLIENT)
    private readonly operations: ClientProxy,
    config: ConfigService,
  ) {
    this.token = config.get('INTERNAL_SERVICE_TOKEN') ?? '';
    this.interval = Number(
      config.get('BRANCH_PROVISIONING_INTERVAL_MS') ?? 3000,
    );
    this.timeoutMs = Number(
      config.get('BRANCH_PROVISIONING_TIMEOUT_MS') ?? 120000,
    );
  }
  async onModuleInit() {
    await this.recover();
    this.timer = setInterval(() => void this.processNext(), this.interval);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async recover() {
    const stale = new Date(Date.now() - this.timeoutMs);
    const jobs = await this.db.branchProvisioningJob.findMany({
      where: { status: 'PROCESSING', startedAt: { lt: stale } },
    });
    for (const job of jobs) {
      const failed = job.attempts >= job.maxAttempts;
      await this.db.$transaction([
        this.db.branchProvisioningJob.update({
          where: { id: job.id },
          data: {
            status: failed ? 'FAILED' : 'PENDING',
            startedAt: null,
            lastErrorCode: failed ? 'PROVISIONING_TIMEOUT' : null,
            lastErrorMessage: failed ? 'Provisioning timed out' : null,
          },
        }),
        this.db.branch.update({
          where: { id: job.branchId },
          data: { status: failed ? 'FAILED' : 'PROVISIONING' },
        }),
      ]);
    }
  }
  async processNext() {
    const job = await this.db.branchProvisioningJob.findFirst({
      where: {
        status: 'PENDING',
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
      },
      orderBy: { createdAt: 'asc' },
      include: { branch: true, restaurant: true },
    });
    if (!job) return;
    const claimed = await this.db.branchProvisioningJob.updateMany({
      where: {
        id: job.id,
        status: 'PENDING',
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
      },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
        attempts: { increment: 1 },
      },
    });
    if (claimed.count !== 1) return;
    try {
      const result = await firstValueFrom(
        this.operations
          .send<{ success: boolean }>(
            { cmd: 'branch.provision' },
            {
              internalToken: this.token,
              branchId: job.branchId,
              target: {
                host: job.branch.databaseHost,
                port: job.branch.databasePort,
                databaseName: job.branch.databaseName,
                databaseUser: job.branch.databaseUser,
                databasePassword: this.encryption.decrypt(
                  job.branch.encryptedDatabasePassword,
                ),
              },
              templateBranchId: job.templateBranchId,
              restaurantDefaults: {
                taxName: 'Impuesto configurable',
                taxRate: 0,
              },
            },
          )
          .pipe(timeout(this.timeoutMs)),
      );
      if (!result.success) throw new Error('Provisioning verification failed');
      const now = new Date();
      await this.db.$transaction([
        this.db.branch.update({
          where: { id: job.branchId },
          data: { status: 'ACTIVE', activatedAt: now, provisioningError: null },
        }),
        this.db.branchProvisioningJob.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            completedAt: now,
            lastErrorCode: null,
            lastErrorMessage: null,
          },
        }),
      ]);
    } catch {
      const current = await this.db.branchProvisioningJob.findUniqueOrThrow({
        where: { id: job.id },
      });
      const failed = current.attempts >= current.maxAttempts;
      await this.db.$transaction([
        this.db.branch.update({
          where: { id: job.branchId },
          data: {
            status: failed ? 'FAILED' : 'PROVISIONING',
            provisioningError: 'Provisioning failed',
          },
        }),
        this.db.branchProvisioningJob.update({
          where: { id: job.id },
          data: {
            status: failed ? 'FAILED' : 'PENDING',
            nextRetryAt: failed ? null : new Date(Date.now() + this.interval),
            lastErrorCode: 'PROVISIONING_FAILED',
            lastErrorMessage: 'Provisioning failed safely',
          },
        }),
      ]);
    }
  }
}
