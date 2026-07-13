import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  const mockCoreClient = {
    send: jest.fn(),
  };

  const mockAuditClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: 'CORE_SERVICE',
          useValue: mockCoreClient,
        },
        {
          provide: 'AUDIT_SERVICE',
          useValue: mockAuditClient,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return ok when both services are up', async () => {
    mockCoreClient.send.mockReturnValue(of({ status: 'ok' }));
    mockAuditClient.send.mockReturnValue(of({ status: 'ok' }));

    const response = await appController.getHealth();
    expect(response).toEqual({
      status: 'ok',
      service: 'api-gateway',
      dependencies: {
        coreService: 'ok',
        auditService: 'ok',
      },
    });
  });

  it('should return degraded when audit-service fails', async () => {
    mockCoreClient.send.mockReturnValue(of({ status: 'ok' }));
    mockAuditClient.send.mockReturnValue(
      throwError(() => new Error('timeout')),
    );

    const response = await appController.getHealth();
    expect(response).toEqual({
      status: 'degraded',
      service: 'api-gateway',
      dependencies: {
        coreService: 'ok',
        auditService: 'down',
      },
    });
  });

  it('should throw Service Unavailable when core-service fails', async () => {
    mockCoreClient.send.mockReturnValue(throwError(() => new Error('timeout')));
    mockAuditClient.send.mockReturnValue(of({ status: 'ok' }));

    await expect(appController.getHealth()).rejects.toThrow(HttpException);
    await expect(appController.getHealth()).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      response: {
        status: 'unavailable',
        service: 'api-gateway',
        dependencies: {
          coreService: 'down',
          auditService: 'ok',
        },
      },
    });
  });
});
