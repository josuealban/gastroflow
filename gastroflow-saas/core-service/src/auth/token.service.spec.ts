import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
const config = new ConfigService({
  JWT_ACCESS_SECRET: 'a'.repeat(64),
  JWT_REFRESH_SECRET: 'b'.repeat(64),
  JWT_ISSUER: 'gastroflow-core',
  JWT_AUDIENCE: 'gastroflow-api',
});
describe('TokenService', () => {
  it('issues distinct typed tokens with null and selected branches', async () => {
    const s = new TokenService(new JwtService(), config);
    const pair = await s.issue({
      sub: 'u',
      restaurantId: 'r',
      branchId: null,
      email: 'a@b.com',
      roles: ['OWNER'],
      permissions: ['settings.manage'],
    });
    expect(pair.accessToken).not.toBe(pair.refreshToken);
    expect((await s.verifyRefresh(pair.refreshToken)).branchId).toBeNull();
    const selected = await s.issue({
      sub: 'u',
      restaurantId: 'r',
      branchId: 'b',
      email: 'a@b.com',
      roles: [],
      permissions: [],
    });
    expect((await s.verifyRefresh(selected.refreshToken)).branchId).toBe('b');
  });
  it('rejects the wrong secret and equal secrets', async () => {
    const s = new TokenService(new JwtService(), config);
    await expect(
      s.verifyRefresh(
        await new JwtService().signAsync(
          { tokenType: 'refresh' },
          { secret: 'wrong' },
        ),
      ),
    ).rejects.toThrow();
    expect(
      () =>
        new TokenService(
          new JwtService(),
          new ConfigService({
            JWT_ACCESS_SECRET: 'same',
            JWT_REFRESH_SECRET: 'same',
          }),
        ),
    ).toThrow();
  });
  it('uses the configured access TTL in the token and response', async () => {
    const configured = new ConfigService({
      JWT_ACCESS_SECRET: 'a'.repeat(64),
      JWT_REFRESH_SECRET: 'b'.repeat(64),
      ACCESS_TOKEN_TTL: '2m',
    });
    const service = new TokenService(new JwtService(), configured);
    const pair = await service.issue({
      sub: 'u',
      restaurantId: 'r',
      branchId: null,
      email: 'a@b.com',
      roles: [],
      permissions: [],
    });
    const decoded: unknown = new JwtService().decode(pair.accessToken);
    if (
      !decoded ||
      typeof decoded !== 'object' ||
      !('exp' in decoded) ||
      !('iat' in decoded) ||
      typeof decoded.exp !== 'number' ||
      typeof decoded.iat !== 'number'
    ) {
      throw new Error('Access token timestamps are missing');
    }
    expect(pair.expiresIn).toBe(120);
    expect(decoded.exp - decoded.iat).toBe(120);
  });
  it('rejects a non-refresh token even when signed with the refresh secret', async () => {
    const service = new TokenService(new JwtService(), config);
    const token = await new JwtService().signAsync(
      {
        sub: 'u',
        restaurantId: 'r',
        branchId: null,
        tokenType: 'access',
        jti: 'j',
      },
      {
        secret: 'b'.repeat(64),
        issuer: 'gastroflow-core',
        audience: 'gastroflow-api',
        algorithm: 'HS256',
      },
    );
    await expect(service.verifyRefresh(token)).rejects.toThrow(
      'Invalid token type',
    );
  });
});
