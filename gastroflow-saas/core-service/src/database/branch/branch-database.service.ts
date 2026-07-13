import { Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '../../generated/control-client/enums';
import { ControlPrismaService } from '../control/control-prisma.service';
import { DatabaseCredentialsEncryptionService } from '../encryption/database-credentials-encryption.service';
import { BranchConnectionCacheService } from './branch-connection-cache.service';
import { BranchPrismaClient } from './branch-prisma-client.factory';

export interface AvailableBranch {
  id: string;
  code: string;
  isActive: boolean;
  databaseName: string;
  databaseHost: string;
  databasePort: number;
  databaseUser: string;
  encryptedDatabasePassword: string;
  company: {
    isActive: boolean;
    subscription: {
      status: SubscriptionStatus;
      endDate: Date;
    } | null;
  };
}

@Injectable()
export class BranchDatabaseService {
  constructor(
    private readonly controlPrisma: ControlPrismaService,
    private readonly encryption: DatabaseCredentialsEncryptionService,
    private readonly cache: BranchConnectionCacheService,
  ) {}

  async getClientByBranchId(branchId: string): Promise<BranchPrismaClient> {
    const branch = await this.controlPrisma.branch.findUnique({
      where: { id: branchId },
      include: { company: { include: { subscription: true } } },
    });

    if (!branch) {
      throw new Error('Sucursal no disponible');
    }

    return this.getClient(branch);
  }

  async getClientByBranchCode(branchCode: string): Promise<BranchPrismaClient> {
    const branch = await this.controlPrisma.branch.findUnique({
      where: { code: branchCode },
      include: { company: { include: { subscription: true } } },
    });

    if (!branch) {
      throw new Error('Sucursal no disponible');
    }

    return this.getClient(branch);
  }

  validateBranchAvailability(branch: AvailableBranch): void {
    if (!branch.company.isActive) {
      throw new Error('Empresa inactiva');
    }
    if (!branch.isActive) {
      throw new Error('Sucursal inactiva');
    }

    const subscription = branch.company.subscription;
    if (
      !subscription ||
      ![SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE].includes(
        subscription.status as any,
      )
    ) {
      throw new Error('Suscripción no habilitada');
    }
    if (subscription.endDate.getTime() <= Date.now()) {
      throw new Error('Suscripción vencida');
    }

    if (
      !branch.databaseHost.trim() ||
      !branch.databaseUser.trim() ||
      !/^[a-z][a-z0-9_]{2,62}$/.test(branch.databaseName) ||
      !Number.isInteger(branch.databasePort) ||
      branch.databasePort <= 0 ||
      branch.databasePort > 65535 ||
      !branch.encryptedDatabasePassword
    ) {
      throw new Error('Configuración de sucursal inválida');
    }
  }

  private async getClient(
    branch: AvailableBranch,
  ): Promise<BranchPrismaClient> {
    this.validateBranchAvailability(branch);

    const password = this.encryption.decrypt(branch.encryptedDatabasePassword);

    return this.cache.getOrCreate(branch.id, {
      host: branch.databaseHost,
      port: branch.databasePort,
      user: branch.databaseUser,
      password,
      databaseName: branch.databaseName,
    });
  }
}
