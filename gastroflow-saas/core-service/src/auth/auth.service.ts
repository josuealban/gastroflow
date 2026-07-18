import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ControlPrismaService } from '../database/control/control-prisma.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { BranchSummary, TokenPair } from './auth.types';

@Injectable()
export class AuthService {
  private readonly internalToken: string;
  constructor(
    private readonly db: ControlPrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    config: ConfigService,
  ) {
    this.internalToken = config.get<string>('INTERNAL_SERVICE_TOKEN') ?? '';
  }
  private authorize(value: string): void {
    if (!this.internalToken || value !== this.internalToken)
      throw new RpcException({ statusCode: 401, message: 'Unauthorized' });
  }
  private fail(statusCode: number, message: string): never {
    throw new RpcException({ statusCode, message });
  }
  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
  private async context(userId: string, branchId: string | null) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        restaurant: { include: { subscription: true } },
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
        userBranches: {
          where: { isActive: true, branch: { status: 'ACTIVE' } },
          include: {
            branch: true,
            roles: {
              include: {
                role: {
                  include: {
                    rolePermissions: { include: { permission: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!user?.isActive || !user.restaurant.isActive)
      this.fail(401, 'Unauthorized');
    const subscription = user.restaurant.subscription;
    if (
      !subscription ||
      !['TRIAL', 'ACTIVE'].includes(subscription.status) ||
      subscription.endDate <= new Date()
    )
      this.fail(403, 'Forbidden');
    const selected = branchId
      ? user.userBranches.find((item) => item.branchId === branchId)
      : undefined;
    if (branchId && !selected) this.fail(403, 'Forbidden');
    const roleRecords = [
      ...user.userRoles.map((x) => x.role),
      ...(selected?.roles.map((x) => x.role) ?? []),
    ].filter((x) => x.isActive);
    const roles = [...new Set(roleRecords.map((x) => x.name))];
    const permissions = [
      ...new Set(
        roleRecords.flatMap((x) =>
          x.rolePermissions.map((p) => p.permission.name),
        ),
      ),
    ];
    const branches: BranchSummary[] = user.userBranches.map((x) => ({
      id: x.branch.id,
      name: x.branch.name,
      code: x.branch.code,
      city: x.branch.city,
      isPrimary: x.branch.isPrimary,
      status: x.branch.status,
      roles: [...new Set(x.roles.map((r) => r.role.name))],
    }));
    return { user, roles, permissions, branches };
  }
  private async persist(pair: TokenPair, userId: string): Promise<void> {
    const payload = await this.tokens.verifyRefresh(pair.refreshToken);
    await this.db.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hash(pair.refreshToken),
        expiresAt: new Date((payload as unknown as { exp: number }).exp * 1000),
      },
    });
  }
  private publicResponse(
    pair: TokenPair,
    ctx: Awaited<ReturnType<AuthService['context']>>,
    branchId: string | null,
  ) {
    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      expiresIn: pair.expiresIn,
      user: {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        restaurantId: ctx.user.restaurantId,
        restaurantName: ctx.user.restaurant.name,
        branchId,
        roles: ctx.roles,
        permissions: ctx.permissions,
      },
      availableBranches: ctx.branches,
    };
  }
  async login(input: {
    restaurantSlug: string;
    email: string;
    password: string;
    internalToken: string;
  }) {
    this.authorize(input.internalToken);
    const slug = input.restaurantSlug.trim().toLowerCase(),
      email = input.email.trim().toLowerCase();
    const restaurant = await this.db.restaurant.findUnique({ where: { slug } });
    const user = restaurant
      ? await this.db.user.findUnique({
          where: { restaurantId_email: { restaurantId: restaurant.id, email } },
        })
      : null;
    if (
      !restaurant ||
      !user ||
      !(await this.passwords.compare(input.password, user.passwordHash))
    )
      this.fail(401, 'Invalid credentials');
    const initial = await this.context(user.id, null);
    const branchId =
      initial.branches.length === 1 ? initial.branches[0].id : null;
    const ctx = await this.context(user.id, branchId);
    const pair = await this.tokens.issue({
      sub: user.id,
      restaurantId: user.restaurantId,
      branchId,
      email: user.email,
      roles: ctx.roles,
      permissions: ctx.permissions,
    });
    await this.persist(pair, user.id);
    return this.publicResponse(pair, ctx, branchId);
  }
  async refresh(input: { refreshToken: string; internalToken: string }) {
    this.authorize(input.internalToken);
    let payload;
    try {
      payload = await this.tokens.verifyRefresh(input.refreshToken);
      if (payload.tokenType !== 'refresh') throw new Error();
    } catch {
      this.fail(401, 'Unauthorized');
    }
    const hash = this.hash(input.refreshToken);
    const record = await this.db.refreshToken.findUnique({
      where: { tokenHash: hash },
    });
    if (!record || record.revokedAt || record.expiresAt <= new Date())
      this.fail(401, 'Unauthorized');
    const ctx = await this.context(payload.sub, payload.branchId);
    const pair = await this.tokens.issue({
      sub: payload.sub,
      restaurantId: payload.restaurantId,
      branchId: payload.branchId,
      email: ctx.user.email,
      roles: ctx.roles,
      permissions: ctx.permissions,
    });
    const nextPayload = await this.tokens.verifyRefresh(pair.refreshToken);
    await this.db.$transaction([
      this.db.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      }),
      this.db.refreshToken.create({
        data: {
          userId: payload.sub,
          tokenHash: this.hash(pair.refreshToken),
          expiresAt: new Date(
            (nextPayload as unknown as { exp: number }).exp * 1000,
          ),
        },
      }),
    ]);
    return this.publicResponse(pair, ctx, payload.branchId);
  }
  async logout(input: { refreshToken?: string; internalToken: string }) {
    this.authorize(input.internalToken);
    if (input.refreshToken)
      await this.db.refreshToken.updateMany({
        where: { tokenHash: this.hash(input.refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    return { success: true };
  }
  async me(input: {
    userId: string;
    branchId: string | null;
    internalToken: string;
  }) {
    this.authorize(input.internalToken);
    const ctx = await this.context(input.userId, input.branchId);
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      restaurantId: ctx.user.restaurantId,
      restaurantName: ctx.user.restaurant.name,
      branchId: input.branchId,
      roles: ctx.roles,
      permissions: ctx.permissions,
    };
  }
  async branches(input: { userId: string; internalToken: string }) {
    this.authorize(input.internalToken);
    return (await this.context(input.userId, null)).branches;
  }
  async selectBranch(input: {
    userId: string;
    restaurantId: string;
    branchId: string;
    refreshToken: string;
    internalToken: string;
  }) {
    this.authorize(input.internalToken);
    const old = await this.tokens
      .verifyRefresh(input.refreshToken)
      .catch(() => this.fail(401, 'Unauthorized'));
    if (old.sub !== input.userId || old.restaurantId !== input.restaurantId)
      this.fail(403, 'Forbidden');
    const record = await this.db.refreshToken.findUnique({
      where: { tokenHash: this.hash(input.refreshToken) },
    });
    if (!record || record.revokedAt) this.fail(401, 'Unauthorized');
    const ctx = await this.context(input.userId, input.branchId);
    const pair = await this.tokens.issue({
      sub: input.userId,
      restaurantId: input.restaurantId,
      branchId: input.branchId,
      email: ctx.user.email,
      roles: ctx.roles,
      permissions: ctx.permissions,
    });
    const np = await this.tokens.verifyRefresh(pair.refreshToken);
    await this.db.$transaction([
      this.db.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      }),
      this.db.refreshToken.create({
        data: {
          userId: input.userId,
          tokenHash: this.hash(pair.refreshToken),
          expiresAt: new Date((np as unknown as { exp: number }).exp * 1000),
        },
      }),
    ]);
    return this.publicResponse(pair, ctx, input.branchId);
  }
  async roles(input: {
    userId: string;
    branchId: string | null;
    internalToken: string;
  }) {
    this.authorize(input.internalToken);
    return (await this.context(input.userId, input.branchId)).roles;
  }
  async permissions(input: {
    userId: string;
    branchId: string | null;
    internalToken: string;
  }) {
    this.authorize(input.internalToken);
    return (await this.context(input.userId, input.branchId)).permissions;
  }
}
