import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { AccessPayload, RefreshPayload, TokenPair } from './auth.types';

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly accessTtl: JwtSignOptions['expiresIn'];
  private readonly refreshTtl: JwtSignOptions['expiresIn'];
  private readonly accessExpiresIn: number;
  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.accessSecret = this.required(config, 'JWT_ACCESS_SECRET');
    this.refreshSecret = this.required(config, 'JWT_REFRESH_SECRET');
    if (this.accessSecret === this.refreshSecret)
      throw new Error('JWT secrets must be different');
    this.issuer = config.get('JWT_ISSUER') ?? 'gastroflow-core';
    this.audience = config.get('JWT_AUDIENCE') ?? 'gastroflow-api';
    this.accessTtl = config.get('ACCESS_TOKEN_TTL') ?? '15m';
    this.refreshTtl = config.get('REFRESH_TOKEN_TTL') ?? '7d';
    this.accessExpiresIn = this.ttlSeconds(String(this.accessTtl));
  }
  async issue(
    base: Omit<AccessPayload, 'tokenType' | 'jti'>,
  ): Promise<TokenPair> {
    const accessPayload: AccessPayload = {
      ...base,
      tokenType: 'access',
      jti: randomUUID(),
    };
    const refreshPayload: RefreshPayload = {
      sub: base.sub,
      restaurantId: base.restaurantId,
      branchId: base.branchId,
      tokenType: 'refresh',
      jti: randomUUID(),
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.accessSecret,
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256',
        expiresIn: this.accessTtl,
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.refreshSecret,
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256',
        expiresIn: this.refreshTtl,
      }),
    ]);
    return { accessToken, refreshToken, expiresIn: this.accessExpiresIn };
  }
  async verifyRefresh(token: string): Promise<RefreshPayload> {
    const payload = await this.jwt.verifyAsync<RefreshPayload>(token, {
      secret: this.refreshSecret,
      issuer: this.issuer,
      audience: this.audience,
      algorithms: ['HS256'],
    });
    if (payload.tokenType !== 'refresh') throw new Error('Invalid token type');
    return payload;
  }
  private ttlSeconds(value: string): number {
    const match = /^(\d+)(s|m|h|d)$/.exec(value);
    if (!match) throw new Error('ACCESS_TOKEN_TTL must use s, m, h or d');
    const factors = { s: 1, m: 60, h: 3600, d: 86400 } as const;
    return Number(match[1]) * factors[match[2] as keyof typeof factors];
  }
  private required(config: ConfigService, key: string): string {
    const value = config.get<string>(key);
    if (!value || value.startsWith('REPLACE_'))
      throw new Error(`${key} is required`);
    return value;
  }
}
