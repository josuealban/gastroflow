import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NEVER, of, throwError } from 'rxjs';
import { AppController, HealthCheckResult } from './app.controller';
import {
  CORE_SERVICE_CLIENT,
  MICROSERVICE_TIMEOUT,
  OPERATIONS_SERVICE_CLIENT,
} from './injection-tokens';
import {
  CORE_HEALTH_PATTERN,
  OPERATIONS_HEALTH_PATTERN,
  TcpHealthResponse,
} from './service-contracts';

const timestamp = '2026-07-15T00:00:00.000Z';

function healthResponse(
  service: TcpHealthResponse['service'],
): TcpHealthResponse {
  return { service, status: 'ok', transport: 'tcp', timestamp };
}

describe('AppController', () => {
  let appController: AppController;
  const mockCoreClient = { send: jest.fn() };
  const mockOperationsClient = { send: jest.fn() };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: CORE_SERVICE_CLIENT, useValue: mockCoreClient },
        { provide: OPERATIONS_SERVICE_CLIENT, useValue: mockOperationsClient },
        { provide: MICROSERVICE_TIMEOUT, useValue: 50 },
      ],
    }).compile();

    appController = app.get(AppController);
    mockCoreClient.send.mockReturnValue(of(healthResponse('core-service')));
    mockOperationsClient.send.mockReturnValue(
      of(healthResponse('operations-service')),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('returns a stable JSON result when both TCP services respond', async () => {
    const response = await appController.getHealth();

    expect(response).toEqual({
      status: 'ok',
      services: {
        apiGateway: { status: 'ok' },
        coreService: { status: 'ok' },
        operationsService: { status: 'ok' },
      },
      timestamp: expect.any(String) as string,
    } satisfies HealthCheckResult);
    expect(Number.isNaN(Date.parse(response.timestamp))).toBe(false);
  });

  it('returns 503 degraded when Core is unavailable', async () => {
    mockCoreClient.send.mockReturnValue(throwError(() => new Error('down')));

    await expect(appController.getHealth()).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      response: {
        status: 'degraded',
        services: {
          apiGateway: { status: 'ok' },
          coreService: { status: 'unavailable' },
          operationsService: { status: 'ok' },
        },
      },
    });
  });

  it('returns 503 degraded when Operations is unavailable', async () => {
    mockOperationsClient.send.mockReturnValue(
      throwError(() => new Error('down')),
    );

    await expect(appController.getHealth()).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      response: {
        status: 'degraded',
        services: {
          apiGateway: { status: 'ok' },
          coreService: { status: 'ok' },
          operationsService: { status: 'unavailable' },
        },
      },
    });
  });

  it('returns 503 unavailable when both services are unavailable', async () => {
    mockCoreClient.send.mockReturnValue(throwError(() => new Error('down')));
    mockOperationsClient.send.mockReturnValue(
      throwError(() => new Error('down')),
    );

    await expect(appController.getHealth()).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      response: { status: 'unavailable' },
    });
  });

  it('applies the configured timeout to TCP calls', async () => {
    jest.useFakeTimers();
    mockOperationsClient.send.mockReturnValue(NEVER);

    const expectation = expect(appController.getHealth()).rejects.toMatchObject(
      { status: HttpStatus.SERVICE_UNAVAILABLE },
    );
    await jest.advanceTimersByTimeAsync(50);
    await expectation;
  });

  it('rejects malformed TCP health responses', async () => {
    mockCoreClient.send.mockReturnValue(
      of({ ...healthResponse('core-service'), transport: 'http' }),
    );

    await expect(appController.getHealth()).rejects.toMatchObject({
      response: {
        services: { coreService: { status: 'unavailable' } },
      },
    });
  });

  it('does not expose dependency errors or credentials', async () => {
    mockCoreClient.send.mockReturnValue(
      throwError(
        () => new Error('postgresql://admin:secret@database/internal'),
      ),
    );

    try {
      await appController.getHealth();
      throw new Error('Expected health to fail');
    } catch (error: unknown) {
      const response = (error as HttpException).getResponse();
      expect(JSON.stringify(response)).not.toMatch(
        /postgres|password|secret|database_url/i,
      );
    }
  });

  it('uses the documented TCP message patterns', async () => {
    await appController.getHealth();

    expect(mockCoreClient.send).toHaveBeenCalledWith(CORE_HEALTH_PATTERN, {});
    expect(mockOperationsClient.send).toHaveBeenCalledWith(
      OPERATIONS_HEALTH_PATTERN,
      {},
    );
  });
});
