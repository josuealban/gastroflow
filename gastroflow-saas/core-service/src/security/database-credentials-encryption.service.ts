import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const IV_BYTES = 12;
const TAG_BYTES = 16;

@Injectable()
export class DatabaseCredentialsEncryptionService {
  private readonly key: Buffer;

  constructor(configService: ConfigService) {
    const configuredKey = configService.get<string>('BRANCH_DB_ENCRYPTION_KEY');

    if (!configuredKey || !/^[a-fA-F0-9]{64}$/.test(configuredKey)) {
      throw new Error(
        'BRANCH_DB_ENCRYPTION_KEY must contain exactly 64 hexadecimal characters',
      );
    }

    this.key = Buffer.from(configuredKey, 'hex');
  }

  encrypt(plainText: string): string {
    if (!plainText) {
      throw new Error('Database credential cannot be empty');
    }

    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return [VERSION, iv, tag, ciphertext]
      .map((part) =>
        typeof part === 'string' ? part : part.toString('base64url'),
      )
      .join('.');
  }

  decrypt(encryptedPayload: string): string {
    const parts = encryptedPayload.split('.');
    if (parts.length !== 4 || parts[0] !== VERSION) {
      throw new Error('Encrypted database credential has an invalid format');
    }

    try {
      const iv = Buffer.from(parts[1], 'base64url');
      const tag = Buffer.from(parts[2], 'base64url');
      const ciphertext = Buffer.from(parts[3], 'base64url');
      if (
        iv.length !== IV_BYTES ||
        tag.length !== TAG_BYTES ||
        ciphertext.length === 0
      ) {
        throw new Error('invalid payload');
      }

      const decipher = createDecipheriv(ALGORITHM, this.key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new Error('Encrypted database credential failed authentication');
    }
  }
}
