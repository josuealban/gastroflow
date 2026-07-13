import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { of } from 'rxjs';
import { AppModule } from './../src/app.module';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as (app: unknown) => {
  get: (path: string) => {
    expect: (status: number) => {
      expect: (body: unknown) => Promise<void>;
    };
  };
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockCoreClient = {
    send: jest.fn().mockReturnValue(of({ status: 'ok' })),
  };

  const mockAuditClient = {
    send: jest.fn().mockReturnValue(of({ status: 'ok' })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('CORE_SERVICE')
      .useValue(mockCoreClient)
      .overrideProvider('AUDIT_SERVICE')
      .useValue(mockAuditClient)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns ok when both services are up', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect({
        status: 'ok',
        service: 'api-gateway',
        dependencies: {
          coreService: 'ok',
          auditService: 'ok',
        },
      });
  });
});
