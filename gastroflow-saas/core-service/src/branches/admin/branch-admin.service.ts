import { createHash, randomBytes } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { Prisma } from '../../generated/control-client/client';
import type {
  Branch,
  BranchStatus,
} from '../../generated/control-client/client';
import { ControlPrismaService } from '../../database/control/control-prisma.service';
import { DatabaseCredentialsEncryptionService } from '../../security/database-credentials-encryption.service';
import { OPERATIONS_PROVISIONING_CLIENT } from '../provisioning/branch-provisioning-processor.service';

export interface CreateBranchInput {
  name: string;
  code: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  templateBranchId?: string;
  initialStaff?: Array<{ userId: string; roleIds: string[] }>;
}

@Injectable()
export class BranchAdminService {
  private readonly internalToken: string;
  private readonly host: string;
  private readonly port: number;
  private readonly namePrefix: string;
  private readonly userPrefix: string;
  private readonly maxAttempts: number;
  constructor(
    private readonly db: ControlPrismaService,
    private readonly encryption: DatabaseCredentialsEncryptionService,
    @Inject(OPERATIONS_PROVISIONING_CLIENT)
    private readonly operations: ClientProxy,
    config: ConfigService,
  ) {
    this.internalToken = config.get('INTERNAL_SERVICE_TOKEN') ?? '';
    this.host = config.get('BRANCH_DATABASE_HOST') ?? '127.0.0.1';
    this.port = Number(config.get('BRANCH_DATABASE_PORT') ?? 5432);
    this.namePrefix = config.get('BRANCH_DATABASE_NAME_PREFIX') ?? 'gf';
    this.userPrefix = config.get('BRANCH_DATABASE_USER_PREFIX') ?? 'gf_b';
    this.maxAttempts = Number(
      config.get('BRANCH_PROVISIONING_MAX_ATTEMPTS') ?? 3,
    );
  }
  private authorize(token: string) {
    if (!this.internalToken || token !== this.internalToken)
      throw new RpcException({ statusCode: 401, message: 'Unauthorized' });
  }
  private fail(statusCode: number, message: string): never {
    throw new RpcException({ statusCode, message });
  }
  private async invalidateConnection(branchId: string) {
    try {
      await firstValueFrom(
        this.operations
          .send(
            { cmd: 'branch.connection.invalidate' },
            { internalToken: this.internalToken, branchId },
          )
          .pipe(timeout(3000)),
      );
    } catch {
      // The central status is authoritative; Operations also evicts stale clients on reuse.
    }
  }
  private safe(branch: Branch) {
    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      description: branch.description,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      latitude: branch.latitude == null ? null : Number(branch.latitude),
      longitude: branch.longitude == null ? null : Number(branch.longitude),
      isPrimary: branch.isPrimary,
      status: branch.status,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }
  async list(i: {
    internalToken: string;
    restaurantId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    city?: string;
  }) {
    this.authorize(i.internalToken);
    const page = Math.max(1, i.page ?? 1),
      limit = Math.min(100, Math.max(1, i.limit ?? 20));
    const allowedStatuses = ['PROVISIONING', 'ACTIVE', 'INACTIVE', 'FAILED'];
    if (i.status && !allowedStatuses.includes(i.status))
      this.fail(400, 'Invalid branch status');
    const where: Prisma.BranchWhereInput = {
      restaurantId: i.restaurantId,
      ...(i.status ? { status: i.status as BranchStatus } : {}),
      ...(i.city
        ? { city: { equals: i.city, mode: 'insensitive' as const } }
        : {}),
      ...(i.search
        ? {
            OR: [
              { name: { contains: i.search, mode: 'insensitive' as const } },
              { code: { contains: i.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.db.branch.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.branch.count({ where }),
    ]);
    return { items: items.map((x) => this.safe(x)), page, limit, total };
  }
  async get(i: { internalToken: string; restaurantId: string; id: string }) {
    this.authorize(i.internalToken);
    const branch = await this.db.branch.findFirst({
      where: { id: i.id, restaurantId: i.restaurantId },
    });
    if (!branch) this.fail(404, 'Branch not found');
    return this.safe(branch);
  }
  async create(i: {
    internalToken: string;
    restaurantId: string;
    userId: string;
    idempotencyKey: string;
    body: CreateBranchInput;
  }) {
    this.authorize(i.internalToken);
    const normalized = {
      ...i.body,
      name: i.body.name.trim(),
      code: i.body.code.trim().toUpperCase(),
      initialStaff: [...(i.body.initialStaff ?? [])].sort((a, b) =>
        a.userId.localeCompare(b.userId),
      ),
    };
    const requestHash = createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex');
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.db.$transaction(
          async (tx) => {
            const existing = await tx.branchProvisioningJob.findUnique({
              where: {
                restaurantId_idempotencyKey: {
                  restaurantId: i.restaurantId,
                  idempotencyKey: i.idempotencyKey,
                },
              },
              include: { branch: true },
            });
            if (existing) {
              if (existing.requestHash !== requestHash)
                this.fail(409, 'Idempotency key conflict');
              return {
                ...this.safe(existing.branch),
                provisioning: { status: existing.status },
              };
            }
            const restaurant = await tx.restaurant.findUnique({
              where: { id: i.restaurantId },
              include: { subscription: { include: { plan: true } } },
            });
            const sub = restaurant?.subscription;
            if (
              !restaurant?.isActive ||
              !sub ||
              !['TRIAL', 'ACTIVE'].includes(sub.status) ||
              sub.endDate <= new Date() ||
              !sub.plan.isActive
            )
              this.fail(403, 'Restaurant subscription is not active');
            const occupied = await tx.branch.count({
              where: {
                restaurantId: i.restaurantId,
                status: { in: ['PROVISIONING', 'ACTIVE', 'INACTIVE'] },
              },
            });
            if (occupied >= sub.plan.maxBranches)
              this.fail(409, 'Branch limit reached');
            const activeCount = await tx.branch.count({
              where: { restaurantId: i.restaurantId, status: 'ACTIVE' },
            });
            if (activeCount > 0 && !normalized.templateBranchId)
              this.fail(400, 'templateBranchId is required');
            if (normalized.templateBranchId) {
              const template = await tx.branch.findFirst({
                where: {
                  id: normalized.templateBranchId,
                  restaurantId: i.restaurantId,
                  status: 'ACTIVE',
                },
              });
              if (!template) this.fail(403, 'Invalid template branch');
            }
            const staff = normalized.initialStaff ?? [];
            if (staff.length + 1 > sub.plan.maxUsersPerBranch)
              this.fail(409, 'Branch staff limit reached');
            const users = staff.length
              ? await tx.user.findMany({
                  where: {
                    id: { in: staff.map((x) => x.userId) },
                    restaurantId: i.restaurantId,
                    isActive: true,
                  },
                })
              : [];
            if (users.length !== new Set(staff.map((x) => x.userId)).size)
              this.fail(403, 'Invalid initial staff');
            const roleIds = [...new Set(staff.flatMap((x) => x.roleIds))];
            const roles = roleIds.length
              ? await tx.role.findMany({
                  where: {
                    id: { in: roleIds },
                    restaurantId: i.restaurantId,
                    isActive: true,
                  },
                })
              : [];
            if (roles.length !== roleIds.length)
              this.fail(403, 'Invalid staff role');
            const suffix = randomBytes(5).toString('hex');
            const slug = restaurant.slug
              .replace(/-/g, '_')
              .replace(/[^a-z0-9_]/g, '')
              .slice(0, 24);
            const code = normalized.code
              .toLowerCase()
              .replace(/-/g, '_')
              .replace(/[^a-z0-9_]/g, '')
              .slice(0, 16);
            const databaseName =
              `${this.namePrefix}_${slug}_${code}_${suffix}`.slice(0, 63);
            const databaseUser = `${this.userPrefix}_${suffix}`.slice(0, 63);
            const encrypted = this.encryption.encrypt(
              randomBytes(32).toString('base64url'),
            );
            const branch = await tx.branch.create({
              data: {
                restaurantId: i.restaurantId,
                name: normalized.name,
                code: normalized.code,
                description: normalized.description,
                address: normalized.address,
                city: normalized.city,
                phone: normalized.phone,
                latitude: normalized.latitude,
                longitude: normalized.longitude,
                isPrimary: activeCount === 0,
                status: 'PROVISIONING',
                databaseName,
                databaseHost: this.host,
                databasePort: this.port,
                databaseUser,
                encryptedDatabasePassword: encrypted,
              },
            });
            const creator = await tx.user.findFirst({
              where: {
                id: i.userId,
                restaurantId: i.restaurantId,
                isActive: true,
              },
              include: { userRoles: true },
            });
            if (!creator) this.fail(403, 'Invalid requesting user');
            await tx.userBranch.create({
              data: { userId: i.userId, branchId: branch.id },
            });
            for (const userRole of creator.userRoles)
              await tx.userBranchRole.create({
                data: {
                  userId: i.userId,
                  branchId: branch.id,
                  roleId: userRole.roleId,
                },
              });
            for (const member of staff) {
              await tx.userBranch.create({
                data: { userId: member.userId, branchId: branch.id },
              });
              for (const roleId of member.roleIds)
                await tx.userBranchRole.create({
                  data: { userId: member.userId, branchId: branch.id, roleId },
                });
            }
            const job = await tx.branchProvisioningJob.create({
              data: {
                restaurantId: i.restaurantId,
                branchId: branch.id,
                templateBranchId: normalized.templateBranchId,
                requestedByUserId: i.userId,
                idempotencyKey: i.idempotencyKey,
                requestHash,
                maxAttempts: this.maxAttempts,
              },
            });
            return {
              ...this.safe(branch),
              provisioning: { status: job.status },
            };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if ((error as { code?: string }).code === 'P2034' && attempt < 2)
          continue;
        throw error;
      }
    }
    this.fail(409, 'Concurrent branch creation conflict');
  }
  async provisioning(i: {
    internalToken: string;
    restaurantId: string;
    id: string;
  }) {
    this.authorize(i.internalToken);
    const job = await this.db.branchProvisioningJob.findFirst({
      where: { branchId: i.id, restaurantId: i.restaurantId },
      include: { branch: true },
    });
    if (!job) this.fail(404, 'Provisioning job not found');
    return {
      branchId: job.branchId,
      branchStatus: job.branch.status,
      jobStatus: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      errorCode: job.lastErrorCode,
      errorMessage: job.lastErrorMessage,
    };
  }
  async update(i: {
    internalToken: string;
    restaurantId: string;
    id: string;
    body: Partial<CreateBranchInput>;
  }) {
    this.authorize(i.internalToken);
    const found = await this.db.branch.findFirst({
      where: { id: i.id, restaurantId: i.restaurantId },
    });
    if (!found) this.fail(404, 'Branch not found');
    const { name, description, address, city, phone, latitude, longitude } =
      i.body;
    return this.safe(
      await this.db.branch.update({
        where: { id: i.id },
        data: { name, description, address, city, phone, latitude, longitude },
      }),
    );
  }
  async status(i: {
    internalToken: string;
    restaurantId: string;
    id: string;
    status: 'ACTIVE' | 'INACTIVE';
  }) {
    this.authorize(i.internalToken);
    const branch = await this.db.branch.findFirst({
      where: { id: i.id, restaurantId: i.restaurantId },
    });
    if (!branch) this.fail(404, 'Branch not found');
    if (
      (i.status === 'INACTIVE' && branch.status !== 'ACTIVE') ||
      (i.status === 'ACTIVE' && branch.status !== 'INACTIVE')
    )
      this.fail(409, 'Invalid branch status transition');
    if (
      i.status === 'INACTIVE' &&
      (branch.isPrimary ||
        (await this.db.branch.count({
          where: { restaurantId: i.restaurantId, status: 'ACTIVE' },
        })) <= 1)
    )
      this.fail(409, 'Branch cannot be deactivated');
    const updated = await this.db.branch.update({
      where: { id: i.id },
      data: { status: i.status },
    });
    await this.invalidateConnection(i.id);
    return this.safe(updated);
  }
  async retry(i: { internalToken: string; restaurantId: string; id: string }) {
    this.authorize(i.internalToken);
    const job = await this.db.branchProvisioningJob.findFirst({
      where: { branchId: i.id, restaurantId: i.restaurantId },
      include: { branch: true },
    });
    if (!job || job.status !== 'FAILED')
      this.fail(409, 'Provisioning cannot be retried');
    await this.db.$transaction([
      this.db.branch.update({
        where: { id: i.id },
        data: { status: 'PROVISIONING', provisioningError: null },
      }),
      this.db.branchProvisioningJob.update({
        where: { id: job.id },
        data: {
          status: 'PENDING',
          attempts: 0,
          nextRetryAt: null,
          lastErrorCode: null,
          lastErrorMessage: null,
        },
      }),
    ]);
    return {
      id: i.id,
      status: 'PROVISIONING',
      provisioning: { status: 'PENDING' },
    };
  }
  async staff(i: { internalToken: string; restaurantId: string }) {
    this.authorize(i.internalToken);
    return this.db.user.findMany({
      where: { restaurantId: i.restaurantId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        employeeProfile: { select: { position: true } },
        userRoles: { include: { role: { select: { id: true, name: true } } } },
      },
    });
  }
}
