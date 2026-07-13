import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { NEVER, of, throwError } from 'rxjs';
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
    jest.useRealTimers();
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
        core: 'up',
        audit: 'up',
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
        core: 'up',
        audit: 'down',
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
          core: 'down',
          audit: 'up',
        },
      },
    });
  });

  it('should return unavailable when both services fail', async () => {
    mockCoreClient.send.mockReturnValue(throwError(() => new Error('down')));
    mockAuditClient.send.mockReturnValue(throwError(() => new Error('down')));

    await expect(appController.getHealth()).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      response: {
        status: 'unavailable',
        service: 'api-gateway',
        dependencies: {
          core: 'down',
          audit: 'down',
        },
      },
    });
  });

  it('should return unavailable after the core-service timeout', async () => {
    jest.useFakeTimers();
    mockCoreClient.send.mockReturnValue(NEVER);
    mockAuditClient.send.mockReturnValue(of({ status: 'ok' }));

    const healthPromise = appController.getHealth();
    await jest.advanceTimersByTimeAsync(2000);

    await expect(healthPromise).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      response: {
        status: 'unavailable',
        dependencies: { core: 'down', audit: 'up' },
      },
    });
  });

  it('should return degraded after the audit-service timeout', async () => {
    jest.useFakeTimers();
    mockCoreClient.send.mockReturnValue(of({ status: 'ok' }));
    mockAuditClient.send.mockReturnValue(NEVER);

    const healthPromise = appController.getHealth();
    await jest.advanceTimersByTimeAsync(2000);

    await expect(healthPromise).resolves.toEqual({
      status: 'degraded',
      service: 'api-gateway',
      dependencies: { core: 'up', audit: 'down' },
    });
  });

  it('should query the expected TCP message patterns', async () => {
    mockCoreClient.send.mockReturnValue(of({ status: 'ok' }));
    mockAuditClient.send.mockReturnValue(of({ status: 'ok' }));

    await appController.getHealth();

    expect(mockCoreClient.send).toHaveBeenCalledWith(
      { cmd: 'health.core' },
      {},
    );
    expect(mockAuditClient.send).toHaveBeenCalledWith(
      { cmd: 'health.audit' },
      {},
    );
  });
});
