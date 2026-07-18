import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';
import { PERMISSIONS_KEY, ROLES_KEY } from './auth.decorators';
import { RequestUser } from './jwt.strategy';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
  canActivate(c: ExecutionContext) {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        c.getHandler(),
        c.getClass(),
      ])
    )
      return true;
    return super.canActivate(c);
  }
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly r: Reflector) {}
  canActivate(c: ExecutionContext) {
    const required = this.r.getAllAndOverride<string[]>(ROLES_KEY, [
      c.getHandler(),
      c.getClass(),
    ]);
    if (!required?.length) return true;
    const u = c.switchToHttp().getRequest<{ user?: RequestUser }>().user;
    if (!u || !required.some((x) => u.roles.includes(x)))
      throw new ForbiddenException();
    return true;
  }
}
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly r: Reflector) {}
  canActivate(c: ExecutionContext) {
    const required = this.r.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      c.getHandler(),
      c.getClass(),
    ]);
    if (!required?.length) return true;
    const u = c.switchToHttp().getRequest<{ user?: RequestUser }>().user;
    if (!u || !required.every((x) => u.permissions.includes(x)))
      throw new ForbiddenException();
    return true;
  }
}
