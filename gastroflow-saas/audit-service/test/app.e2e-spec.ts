import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';

/**
 * audit-service es un microservicio TCP, no una aplicación HTTP.
 * Las pruebas e2e validan el comportamiento del controlador de mensajes
 * directamente sin levantar un servidor TCP real.
 */
describe('AuditService (e2e)', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = moduleFixture.get<AppController>(AppController);
  });

  it('health.audit should return ok', () => {
    const result = appController.getHealth();
    expect(result).toEqual({
      status: 'ok',
      service: 'audit-service',
    });
  });
});
