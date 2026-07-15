import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HealthCheckResult } from '../src/app.controller';
import { configureHttpApp } from '../src/configure-http-app';
import {
  CORE_SERVICE_CLIENT,
  MICROSERVICE_TIMEOUT,
  OPERATIONS_SERVICE_CLIENT,
} from '../src/injection-tokens';
import { TcpHealthResponse } from '../src/service-contracts';
import { of, throwError } from 'rxjs';

const timestamp = '2026-07-15T00:00:00.000Z';

function healthResponse(
  service: TcpHealthResponse['service'],
): TcpHealthResponse {
  return { service, status: 'ok', transport: 'tcp', timestamp };
}

describe('API Gateway health (e2e)', () => {
  let app: INestApplication;
  const mockCoreClient = { send: jest.fn() };
  const mockOperationsClient = { send: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CORE_SERVICE_CLIENT)
      .useValue(mockCoreClient)
      .overrideProvider(OPERATIONS_SERVICE_CLIENT)
      .useValue(mockOperationsClient)
      .overrideProvider(MICROSERVICE_TIMEOUT)
      .useValue(50)
      .compile();

    app = moduleFixture.createNestApplication();
    configureHttpApp(app, app.get(ConfigService));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockCoreClient.send.mockReturnValue(of(healthResponse('core-service')));
    mockOperationsClient.send.mockReturnValue(
      of(healthResponse('operations-service')),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function httpServer(): Parameters<typeof request>[0] {
    return app.getHttpServer() as Parameters<typeof request>[0];
  }

  it('GET /api/v1/health returns 200 with a stable JSON structure', async () => {
    const response = await request(httpServer())
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = response.body as HealthCheckResult;

    expect(body).toMatchObject({
      status: 'ok',
      services: {
        apiGateway: { status: 'ok' },
        coreService: { status: 'ok' },
        operationsService: { status: 'ok' },
      },
    });
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it('GET /api/v1/health returns controlled 503 when a service fails', async () => {
    mockOperationsClient.send.mockReturnValue(
      throwError(() => new Error('not exposed')),
    );

    const response = await request(httpServer())
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(503);

    expect(response.body).toMatchObject({
      status: 'degraded',
      services: { operationsService: { status: 'unavailable' } },
    });
    expect(JSON.stringify(response.body)).not.toContain('not exposed');
  });

  it('uses the configured CORS origin', async () => {
    await request(httpServer())
      .options('/api/v1/health')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
      .expect('Access-Control-Allow-Origin', 'http://localhost:5173')
      .expect(204);
  });

  it('does not expose unversioned health routes', async () => {
    await request(httpServer()).get('/api/health').expect(404);
  });
});
