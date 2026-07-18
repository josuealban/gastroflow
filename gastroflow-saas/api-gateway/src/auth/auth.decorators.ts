import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
export const ROLES_KEY = 'roles',
  PERMISSIONS_KEY = 'permissions';
export const Roles = (...v: string[]) => SetMetadata(ROLES_KEY, v);
export const Permissions = (...v: string[]) => SetMetadata(PERMISSIONS_KEY, v);
export const CurrentUser = createParamDecorator(
  (_d: unknown, c: ExecutionContext): unknown =>
    c.switchToHttp().getRequest<{ user?: unknown }>().user,
);
