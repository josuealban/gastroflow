import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
export interface RequestUser {
  sub: string;
  restaurantId: string;
  branchId: string | null;
  email: string;
  roles: string[];
  permissions: string[];
  tokenType: 'access';
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow('JWT_ACCESS_SECRET'),
      issuer: config.get('JWT_ISSUER') ?? 'gastroflow-core',
      audience: config.get('JWT_AUDIENCE') ?? 'gastroflow-api',
      algorithms: ['HS256'],
    });
  }
  validate(payload: RequestUser) {
    if (
      payload.tokenType !== 'access' ||
      !payload.sub ||
      !Array.isArray(payload.roles) ||
      !Array.isArray(payload.permissions)
    )
      throw new UnauthorizedException();
    return payload;
  }
}
