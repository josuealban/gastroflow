import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly rounds: number;
  constructor(config: ConfigService) {
    this.rounds = Number(config.get('BCRYPT_ROUNDS') ?? 12);
    if (!Number.isInteger(this.rounds) || this.rounds < 10)
      throw new Error('BCRYPT_ROUNDS must be an integer of at least 10');
  }
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }
  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
