import { ConfigService } from '@nestjs/config';
import { SubscriptionStatus } from '../../generated/control-client/enums';
import { ControlPrismaService } from '../control/control-prisma.service';
import { DatabaseCredentialsEncryptionService } from '../encryption/database-credentials-encryption.service';
import { BranchConnectionCacheService } from './branch-connection-cache.service';
import {
  AvailableBranch,
  BranchDatabaseService,
} from './branch-database.service';

const VALID_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function availableBranch(): AvailableBranch {
  return {
    id: 'branch-id',
    code: 'DEMO-CENTRO',
    isActive: true,
    databaseName: 'gastroflow_demo_centro',
    databaseHost: '127.0.0.1',
    databasePort: 5432,
    databaseUser: 'postgres',
    encryptedDatabasePassword: 'encrypted-value',
    company: {
      isActive: true,
      subscription: {
        status: SubscriptionStatus.TRIAL,
        endDate: new Date(Date.now() + 86_400_000),
      },
    },
  };
}

describe('BranchDatabaseService', () => {
  const control = {
    branch: { findUnique: jest.fn() },
  } as unknown as ControlPrismaService;
  const encryption = new DatabaseCredentialsEncryptionService(
    new ConfigService({ BRANCH_DB_ENCRYPTION_KEY: VALID_KEY }),
  );
  const cache = {
    getOrCreate: jest.fn(),
  } as unknown as BranchConnectionCacheService;
  const service = new BranchDatabaseService(control, encryption, cache);

  it('rejects an inactive branch', () => {
    const branch = availableBranch();
    branch.isActive = false;
    expect(() => service.validateBranchAvailability(branch)).toThrow(
      'Sucursal inactiva',
    );
  });

  it('rejects an inactive company', () => {
    const branch = availableBranch();
    branch.company.isActive = false;
    expect(() => service.validateBranchAvailability(branch)).toThrow(
      'Empresa inactiva',
    );
  });

  it('rejects a suspended subscription', () => {
    const branch = availableBranch();
    branch.company.subscription = {
      status: SubscriptionStatus.SUSPENDED,
      endDate: new Date(Date.now() + 86_400_000),
    };
    expect(() => service.validateBranchAvailability(branch)).toThrow(
      'Suscripción no habilitada',
    );
  });

  it('rejects an expired subscription', () => {
    const branch = availableBranch();
    branch.company.subscription = {
      status: SubscriptionStatus.ACTIVE,
      endDate: new Date(Date.now() - 1),
    };
    expect(() => service.validateBranchAvailability(branch)).toThrow(
      'Suscripción vencida',
    );
  });

  it('does not expose stored credentials in errors', async () => {
    const branch = availableBranch();
    branch.encryptedDatabasePassword = 'postgresql://user:secret@private/db';
    (control.branch.findUnique as jest.Mock).mockResolvedValue(branch);

    await expect(service.getClientByBranchCode(branch.code)).rejects.toThrow(
      'No fue posible descifrar la credencial de la sucursal',
    );
    try {
      await service.getClientByBranchCode(branch.code);
    } catch (error: unknown) {
      expect((error as Error).message).not.toContain('secret');
      expect((error as Error).message).not.toContain('private');
    }
  });
});
