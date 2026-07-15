import { ConfigService } from '@nestjs/config';
import { DatabaseCredentialsEncryptionService } from './database-credentials-encryption.service';

const KEY = 'a'.repeat(64);

describe('DatabaseCredentialsEncryptionService', () => {
  const create = (key = KEY) =>
    new DatabaseCredentialsEncryptionService(
      new ConfigService({ BRANCH_DB_ENCRYPTION_KEY: key }),
    );

  it('encrypts and decrypts a credential', () => {
    const service = create();
    expect(service.decrypt(service.encrypt('secret-password'))).toBe(
      'secret-password',
    );
  });

  it('uses a random IV for each ciphertext', () => {
    const service = create();
    expect(service.encrypt('same')).not.toBe(service.encrypt('same'));
  });

  it.each(['', 'short', 'z'.repeat(64)])('rejects an invalid key', (key) => {
    expect(() => create(key)).toThrow('64 hexadecimal characters');
  });

  it('detects a modified payload without exposing the plaintext', () => {
    const service = create();
    const payload = service.encrypt('never-print-this');
    const parts = payload.split('.');
    parts[3] = (parts[3].startsWith('A') ? 'B' : 'A') + parts[3].slice(1);
    const modified = parts.join('.');
    expect(() => service.decrypt(modified)).toThrow('failed authentication');
    try {
      service.decrypt(modified);
    } catch (error) {
      expect((error as Error).message).not.toContain('never-print-this');
    }
  });

  it.each(['invalid', 'v2.a.b.c', 'v1.a.b.c'])(
    'rejects malformed payloads',
    (payload) => {
      expect(() => create().decrypt(payload)).toThrow();
    },
  );
});
