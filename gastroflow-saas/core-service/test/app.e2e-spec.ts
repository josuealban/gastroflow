import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';

/**
 * core-service es un microservicio TCP, no una aplicación HTTP.
 * Las pruebas e2e validan el comportamiento del controlador de mensajes
 * directamente sin levantar un servidor TCP real.
 */
describe('CoreService (e2e)', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = moduleFixture.get<AppController>(AppController);
  });

  it('health.core should return ok', () => {
    const result = appController.getHealth();
    expect(result).toEqual({
      status: 'ok',
      service: 'core-service',
    });
  });
});
