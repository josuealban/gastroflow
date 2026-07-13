import { ConfigService } from '@nestjs/config';
import { DatabaseCredentialsEncryptionService } from './database-credentials-encryption.service';

const VALID_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('DatabaseCredentialsEncryptionService', () => {
  it('encrypts and decrypts a database password', () => {
    const service = new DatabaseCredentialsEncryptionService(
      new ConfigService({ BRANCH_DB_ENCRYPTION_KEY: VALID_KEY }),
    );

    const encrypted = service.encrypt('database-password');

    expect(encrypted).not.toContain('database-password');
    expect(service.decrypt(encrypted)).toBe('database-password');
  });

  it('rejects an invalid encryption key', () => {
    expect(
      () =>
        new DatabaseCredentialsEncryptionService(
          new ConfigService({ BRANCH_DB_ENCRYPTION_KEY: 'short-key' }),
        ),
    ).toThrow('exactamente 32 bytes');
  });

  it('does not expose encrypted content when decryption fails', () => {
    const service = new DatabaseCredentialsEncryptionService(
      new ConfigService({ BRANCH_DB_ENCRYPTION_KEY: VALID_KEY }),
    );
    const invalidPayload = 'postgresql://admin:secret@internal/database';

    expect(() => service.decrypt(invalidPayload)).toThrow(
      'No fue posible descifrar la credencial de la sucursal',
    );
    try {
      service.decrypt(invalidPayload);
    } catch (error: unknown) {
      expect((error as Error).message).not.toContain('secret');
    }
  });
});
