import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CurrentUser, Permissions } from './auth.decorators';
import { LoginDto, SelectBranchDto } from './auth.dto';
import type { RequestUser } from './jwt.strategy';
import { Public } from './public.decorator';
import { parseDurationMs } from '../configuration';
interface CoreAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: unknown;
  availableBranches: unknown[];
}
@Controller()
export class AuthController {
  private readonly cookieName: string;
  private readonly cookiePath: string;
  private readonly secure: boolean;
  private readonly sameSite: 'lax' | 'strict' | 'none';
  private readonly domain?: string;
  private readonly cookieMaxAge: number;
  constructor(
    private readonly auth: AuthService,
    config: ConfigService,
  ) {
    this.cookieName = config.get('REFRESH_COOKIE_NAME') ?? 'gastroflow_refresh';
    this.cookiePath = config.get('REFRESH_COOKIE_PATH') ?? '/api/v1';
    this.secure = config.get('COOKIE_SECURE') === 'true';
    this.sameSite = config.get('COOKIE_SAME_SITE') ?? 'lax';
    this.domain = config.get('COOKIE_DOMAIN') || undefined;
    this.cookieMaxAge = parseDurationMs(
      config.get('REFRESH_TOKEN_TTL') ?? '7d',
      'REFRESH_TOKEN_TTL',
    );
  }
  private set(res: Response, value: string) {
    res.cookie(this.cookieName, value, {
      httpOnly: true,
      secure: this.secure,
      sameSite: this.sameSite,
      path: this.cookiePath,
      domain: this.domain,
      maxAge: this.cookieMaxAge,
    });
  }
  private clean(res: Response) {
    res.clearCookie(this.cookieName, {
      httpOnly: true,
      secure: this.secure,
      sameSite: this.sameSite,
      path: this.cookiePath,
      domain: this.domain,
    });
  }
  private withoutRefresh(x: CoreAuthResponse) {
    return {
      accessToken: x.accessToken,
      expiresIn: x.expiresIn,
      user: x.user,
      availableBranches: x.availableBranches,
    };
  }
  private readCookie(req: Request): string {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const value = cookies?.[this.cookieName];
    return typeof value === 'string' ? value : '';
  }
  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('auth/login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const x = await this.auth.send<CoreAuthResponse>('auth.login', body);
    this.set(res, x.refreshToken);
    return this.withoutRefresh(x);
  }
  @Public() @Post('auth/refresh') @HttpCode(200) async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const x = await this.auth.send<CoreAuthResponse>('auth.refresh', {
      refreshToken: this.readCookie(req),
    });
    this.set(res, x.refreshToken);
    return this.withoutRefresh(x);
  }
  @Public() @Post('auth/logout') @HttpCode(200) async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.send('auth.logout', {
      refreshToken: this.readCookie(req),
    });
    this.clean(res);
    return { success: true };
  }
  @Get('auth/me') me(@CurrentUser() u: RequestUser) {
    return this.auth.send('auth.me', { userId: u.sub, branchId: u.branchId });
  }
  @Get('session/branches') branches(@CurrentUser() u: RequestUser) {
    return this.auth.send('session.branches.list', { userId: u.sub });
  }
  @Post('session/branch') @HttpCode(200) async select(
    @Body() body: SelectBranchDto,
    @CurrentUser() u: RequestUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const x = await this.auth.send<CoreAuthResponse>('session.branch.select', {
      userId: u.sub,
      restaurantId: u.restaurantId,
      branchId: body.branchId,
      refreshToken: this.readCookie(req),
    });
    this.set(res, x.refreshToken);
    return this.withoutRefresh(x);
  }
  @Permissions('settings.manage') @Get('rbac/roles') roles(
    @CurrentUser() u: RequestUser,
  ) {
    return this.auth.send('rbac.roles.list', {
      userId: u.sub,
      branchId: u.branchId,
    });
  }
  @Permissions('settings.manage') @Get('rbac/permissions') permissions(
    @CurrentUser() u: RequestUser,
  ) {
    return this.auth.send('rbac.permissions.list', {
      userId: u.sub,
      branchId: u.branchId,
    });
  }
}
