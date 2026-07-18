import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureHttpApp } from '../src/configure-http-app';
import {
  CORE_SERVICE_CLIENT,
  OPERATIONS_SERVICE_CLIENT,
} from '../src/injection-tokens';

const accessSecret = 'phase3-e2e-access-secret-clearly-fake';
const user = {
  id: 'user-1',
  name: 'Owner Demo',
  email: 'owner@gastroflow.com',
  restaurantId: 'restaurant-1',
  restaurantName: 'Restaurante Demo',
  branchId: null,
  roles: ['OWNER'],
  permissions: ['settings.manage'],
};
const branches = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'Principal',
    code: 'PRINCIPAL',
    city: 'Quito',
    isPrimary: true,
    status: 'ACTIVE',
    roles: ['OWNER'],
  },
];

describe('Authentication HTTP contracts (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshBearer: string;
  const core = { send: jest.fn() };

  beforeAll(async () => {
    Object.assign(process.env, {
      JWT_ACCESS_SECRET: accessSecret,
      JWT_ISSUER: 'gastroflow-core',
      JWT_AUDIENCE: 'gastroflow-api',
      INTERNAL_SERVICE_TOKEN: 'fake-internal-e2e-token',
      REFRESH_COOKIE_PATH: '/api/v1',
      REFRESH_TOKEN_TTL: '1h',
      AUTH_RATE_LIMIT_MAX: '10',
    });
    const jwt = new JwtService();
    accessToken = await jwt.signAsync(
      {
        sub: 'user-1',
        restaurantId: 'restaurant-1',
        branchId: null,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
        tokenType: 'access',
        jti: 'access-jti',
      },
      {
        secret: accessSecret,
        issuer: 'gastroflow-core',
        audience: 'gastroflow-api',
        algorithm: 'HS256',
        expiresIn: '15m',
      },
    );
    refreshBearer = await jwt.signAsync(
      {
        sub: 'user-1',
        restaurantId: 'restaurant-1',
        branchId: null,
        tokenType: 'refresh',
        jti: 'refresh-jti',
      },
      {
        secret: accessSecret,
        issuer: 'gastroflow-core',
        audience: 'gastroflow-api',
        algorithm: 'HS256',
        expiresIn: '15m',
      },
    );
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CORE_SERVICE_CLIENT)
      .useValue(core)
      .overrideProvider(OPERATIONS_SERVICE_CLIENT)
      .useValue({
        send: jest.fn(() =>
          of({
            service: 'operations-service',
            status: 'ok',
            transport: 'tcp',
            timestamp: new Date().toISOString(),
          }),
        ),
      })
      .compile();
    app = module.createNestApplication();
    configureHttpApp(app, app.get(ConfigService));
    await app.init();
  });
  afterAll(() => app.close());
  beforeEach(() => {
    core.send.mockImplementation(
      (pattern: { cmd: string }, data: Record<string, unknown>) => {
        if (pattern.cmd === 'core.health')
          return of({
            service: 'core-service',
            status: 'ok',
            transport: 'tcp',
            timestamp: new Date().toISOString(),
          });
        if (pattern.cmd === 'auth.login') {
          if (data.password !== 'valid-password')
            return throwError(() => ({
              statusCode: 401,
              message: 'Invalid credentials',
            }));
          return of({
            accessToken,
            refreshToken: 'opaque-refresh-token',
            expiresIn: 900,
            user,
            availableBranches: branches,
          });
        }
        if (pattern.cmd === 'auth.refresh') {
          if (data.refreshToken !== 'opaque-refresh-token')
            return throwError(() => ({
              statusCode: 401,
              message: 'Unauthorized',
            }));
          return of({
            accessToken: `${accessToken}.rotated`,
            refreshToken: 'rotated-refresh-token',
            expiresIn: 900,
            user,
            availableBranches: branches,
          });
        }
        if (pattern.cmd === 'session.branch.select') {
          if (data.branchId !== branches[0].id)
            return throwError(() => ({
              statusCode: 403,
              message: 'Forbidden',
            }));
          return of({
            accessToken: `${accessToken}.branch`,
            refreshToken: 'branch-refresh-token',
            expiresIn: 900,
            user: { ...user, branchId: branches[0].id },
            availableBranches: branches,
          });
        }
        if (pattern.cmd === 'auth.me') return of(user);
        if (pattern.cmd === 'session.branches.list') return of(branches);
        if (pattern.cmd === 'rbac.roles.list') return of(['OWNER']);
        if (pattern.cmd === 'auth.logout') return of({ success: true });
        return of([]);
      },
    );
  });
  function server(): Parameters<typeof request>[0] {
    return app.getHttpServer() as Parameters<typeof request>[0];
  }

  it('logs in without exposing refresh data and sets the configured HttpOnly cookie', async () => {
    const response = await request(server())
      .post('/api/v1/auth/login')
      .send({
        restaurantSlug: 'restaurante-demo',
        email: user.email,
        password: 'valid-password',
      })
      .expect(200);
    const body = response.body as {
      accessToken?: string;
      refreshToken?: string;
    };
    expect(body.accessToken).toBe(accessToken);
    expect(body.refreshToken).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('passwordHash');
    expect(response.headers['set-cookie'][0]).toMatch(
      /Path=\/api\/v1.*HttpOnly.*SameSite=Lax/i,
    );
    expect(response.headers['set-cookie'][0]).not.toContain('Secure');
  });
  it.each(['wrong-password', 'missing-user', 'missing-restaurant'])(
    'returns the same 401 for invalid credentials (%s)',
    async (password) => {
      const response = await request(server())
        .post('/api/v1/auth/login')
        .send({
          restaurantSlug: 'restaurante-demo',
          email: user.email,
          password,
        })
        .expect(401);
      expect((response.body as { message?: string }).message).toBe(
        'Invalid credentials',
      );
    },
  );
  it('rejects invalid login DTOs', () =>
    request(server())
      .post('/api/v1/auth/login')
      .send({ restaurantSlug: 'x' })
      .expect(400));
  it('rotates using the cookie and rejects missing or invalid cookies', async () => {
    const ok = await request(server())
      .post('/api/v1/auth/refresh')
      .set('Cookie', 'gastroflow_refresh=opaque-refresh-token')
      .expect(200);
    const body = ok.body as { accessToken?: string; refreshToken?: string };
    expect(body.accessToken).toContain('rotated');
    expect(body.refreshToken).toBeUndefined();
    expect(ok.headers['set-cookie'][0]).toContain('rotated-refresh-token');
    await request(server()).post('/api/v1/auth/refresh').expect(401);
    await request(server())
      .post('/api/v1/auth/refresh')
      .set('Cookie', 'gastroflow_refresh=invalid')
      .expect(401);
  });
  it('protects me and rejects refresh token type as Bearer', async () => {
    await request(server())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    await request(server()).get('/api/v1/auth/me').expect(401);
    await request(server())
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid')
      .expect(401);
    await request(server())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${refreshBearer}`)
      .expect(401);
  });
  it('lists only assigned branches and rotates on valid selection', async () => {
    const listed = await request(server())
      .get('/api/v1/session/branches')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(listed.body).toEqual(branches);
    const selected = await request(server())
      .post('/api/v1/session/branch')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', 'gastroflow_refresh=opaque-refresh-token')
      .send({ branchId: branches[0].id })
      .expect(200);
    expect((selected.body as { accessToken?: string }).accessToken).toContain(
      'branch',
    );
    expect(selected.headers['set-cookie'][0]).toContain('branch-refresh-token');
    await request(server())
      .post('/api/v1/session/branch')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ branchId: 'invalid' })
      .expect(400);
    await request(server())
      .post('/api/v1/session/branch')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ branchId: '20000000-0000-4000-8000-000000000099' })
      .expect(403);
  });
  it('allows OWNER and denies WAITER through the permissions guard', async () => {
    await request(server())
      .get('/api/v1/rbac/roles')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const waiter = await new JwtService().signAsync(
      {
        sub: 'waiter',
        restaurantId: 'restaurant-1',
        branchId: branches[0].id,
        email: 'waiter@gastroflow.com',
        roles: ['WAITER'],
        permissions: [],
        tokenType: 'access',
        jti: 'waiter-jti',
      },
      {
        secret: accessSecret,
        issuer: 'gastroflow-core',
        audience: 'gastroflow-api',
        algorithm: 'HS256',
      },
    );
    await request(server())
      .get('/api/v1/rbac/roles')
      .set('Authorization', `Bearer ${waiter}`)
      .expect(403);
  });
  it('logs out idempotently and clears the cookie with matching attributes', async () => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await request(server())
        .post('/api/v1/auth/logout')
        .set('Cookie', 'gastroflow_refresh=opaque-refresh-token')
        .expect(200);
      expect(response.headers['set-cookie'][0]).toMatch(
        /gastroflow_refresh=;.*Path=\/api\/v1.*HttpOnly.*SameSite=Lax/i,
      );
    }
  });
  it('limits only login attempts and leaves health available', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(server())
        .post('/api/v1/auth/login')
        .send({
          restaurantSlug: 'restaurante-demo',
          email: user.email,
          password: 'wrong',
        })
        .expect(401);
    }
    await request(server())
      .post('/api/v1/auth/login')
      .send({
        restaurantSlug: 'restaurante-demo',
        email: user.email,
        password: 'wrong',
      })
      .expect(429);
    await request(server()).get('/api/v1/health').expect(200);
  });
});
