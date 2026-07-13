import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

@Injectable()
export class DatabaseCredentialsEncryptionService {
  private readonly key: Buffer;

  constructor(configService: ConfigService) {
    this.key = this.parseKey(
      configService.get<string>('BRANCH_DB_ENCRYPTION_KEY'),
    );
  }

  encrypt(plaintext: string): string {
    if (!plaintext) {
      throw new Error('La credencial de base de datos no puede estar vacía');
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return ['v1', iv, authTag, encrypted]
      .map((part) =>
        typeof part === 'string' ? part : part.toString('base64url'),
      )
      .join(':');
  }

  decrypt(payload: string): string {
    try {
      const [version, ivValue, tagValue, encryptedValue] = payload.split(':');
      if (version !== 'v1' || !ivValue || !tagValue || !encryptedValue) {
        throw new Error('Formato no reconocido');
      }

      const decipher = createDecipheriv(
        ALGORITHM,
        this.key,
        Buffer.from(ivValue, 'base64url'),
      );
      decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));

      return Buffer.concat([
        decipher.update(Buffer.from(encryptedValue, 'base64url')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new Error('No fue posible descifrar la credencial de la sucursal');
    }
  }

  private parseKey(value: string | undefined): Buffer {
    if (!value) {
      throw new Error('BRANCH_DB_ENCRYPTION_KEY es obligatoria');
    }

    const key = /^[a-f\d]{64}$/i.test(value)
      ? Buffer.from(value, 'hex')
      : Buffer.from(value, 'base64');

    if (key.length !== 32) {
      throw new Error(
        'BRANCH_DB_ENCRYPTION_KEY debe representar exactamente 32 bytes',
      );
    }

    return key;
  }
}
