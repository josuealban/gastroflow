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
describe('Branches administration (e2e)', () => {
  let app: INestApplication, owner: string, waiter: string;
  const core = { send: jest.fn() };
  beforeAll(async () => {
    Object.assign(process.env, {
      JWT_ACCESS_SECRET: 'phase4-fake-access-secret-for-tests-only',
      INTERNAL_SERVICE_TOKEN: 'fake-internal',
      AUTH_RATE_LIMIT_MAX: '100',
    });
    const jwt = new JwtService(),
      options = {
        secret: process.env.JWT_ACCESS_SECRET,
        issuer: 'gastroflow-core',
        audience: 'gastroflow-api',
      };
    owner = await jwt.signAsync(
      {
        sub: 'owner',
        restaurantId: 'restaurant',
        branchId: null,
        email: 'owner@test.dev',
        roles: ['OWNER'],
        permissions: [
          'branches.read',
          'branches.create',
          'branches.update',
          'branches.deactivate',
          'branches.retry-provisioning',
        ],
        tokenType: 'access',
        jti: '1',
      },
      options,
    );
    waiter = await jwt.signAsync(
      {
        sub: 'waiter',
        restaurantId: 'restaurant',
        branchId: 'b',
        email: 'waiter@test.dev',
        roles: ['WAITER'],
        permissions: [],
        tokenType: 'access',
        jti: '2',
      },
      options,
    );
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CORE_SERVICE_CLIENT)
      .useValue(core)
      .overrideProvider(OPERATIONS_SERVICE_CLIENT)
      .useValue({ send: jest.fn(() => of({})) })
      .compile();
    app = module.createNestApplication();
    configureHttpApp(app, app.get(ConfigService));
    await app.init();
  });
  afterAll(() => app.close());
  beforeEach(() =>
    core.send.mockImplementation(
      (pattern: { cmd: string }, data: Record<string, unknown>) => {
        if (pattern.cmd === 'branches.list')
          return of({
            items: [],
            page: data.page ?? 1,
            limit: data.limit ?? 20,
            total: 0,
          });
        if (pattern.cmd === 'branches.create')
          return of({
            id: 'branch',
            name: 'Nueva',
            code: 'NUEVA',
            status: 'PROVISIONING',
            provisioning: { status: 'PENDING' },
          });
        if (pattern.cmd === 'branches.provisioning.get')
          return of({
            branchId: 'branch',
            branchStatus: 'PROVISIONING',
            jobStatus: 'PENDING',
            attempts: 0,
            maxAttempts: 3,
          });
        if (pattern.cmd === 'branches.get')
          return throwError(() => ({
            statusCode: 404,
            message: 'Branch not found',
          }));
        if (pattern.cmd === 'branches.status.update')
          return throwError(() => ({
            statusCode: 409,
            message: 'Branch cannot be deactivated',
          }));
        return of({});
      },
    ),
  );
  const server = () => app.getHttpServer() as Parameters<typeof request>[0];
  it('allows OWNER list with pagination and denies WAITER', async () => {
    await request(server())
      .get('/api/v1/branches?page=2&limit=5&city=Quito')
      .set('Authorization', `Bearer ${owner}`)
      .expect(200);
    await request(server())
      .get('/api/v1/branches')
      .set('Authorization', `Bearer ${waiter}`)
      .expect(403);
  });
  it('creates PROVISIONING with idempotency and no credentials', async () => {
    const response = await request(server())
      .post('/api/v1/branches')
      .set('Authorization', `Bearer ${owner}`)
      .set('Idempotency-Key', '10000000-0000-4000-8000-000000000001')
      .send({
        name: 'Nueva Sucursal',
        code: 'NUEVA',
        templateBranchId: '20000000-0000-4000-8000-000000000001',
      })
      .expect(202);
    const body = response.body as { status?: string };
    expect(body.status).toBe('PROVISIONING');
    expect(JSON.stringify(body)).not.toMatch(/database|password/i);
  });
  it('normalizes a lowercase branch code before sending it to Core', async () => {
    await request(server())
      .post('/api/v1/branches')
      .set('Authorization', `Bearer ${owner}`)
      .set('Idempotency-Key', '10000000-0000-4000-8000-000000000002')
      .send({
        name: 'Sucursal Norte',
        code: '  norte-01  ',
        templateBranchId: '20000000-0000-4000-8000-000000000001',
      })
      .expect(202);
    const calls = core.send.mock.calls as Array<
      [{ cmd: string }, { body: { code: string } }]
    >;
    const createCall = calls.findLast(
      ([pattern]) => pattern.cmd === 'branches.create',
    );
    expect(createCall?.[1].body.code).toBe('NORTE-01');
  });
  it('rejects missing key and invalid body', async () => {
    await request(server())
      .post('/api/v1/branches')
      .set('Authorization', `Bearer ${owner}`)
      .send({ name: 'Nueva Sucursal', code: 'NUEVA' })
      .expect(400);
    await request(server())
      .post('/api/v1/branches')
      .set('Authorization', `Bearer ${owner}`)
      .set('Idempotency-Key', 'invalid')
      .send({ name: 'x' })
      .expect(400);
  });
  it('returns safe provisioning and maps 404/409', async () => {
    await request(server())
      .get('/api/v1/branches/10000000-0000-4000-8000-000000000001/provisioning')
      .set('Authorization', `Bearer ${owner}`)
      .expect(200);
    await request(server())
      .get('/api/v1/branches/10000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${owner}`)
      .expect(404);
    await request(server())
      .patch('/api/v1/branches/10000000-0000-4000-8000-000000000001/status')
      .set('Authorization', `Bearer ${owner}`)
      .send({ status: 'INACTIVE' })
      .expect(409);
  });
});
