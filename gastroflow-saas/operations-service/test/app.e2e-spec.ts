import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';

describe('OperationsService (e2e)', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    appController = moduleFixture.get<AppController>(AppController);
  });

  it('health.operations should return ok', () => {
    expect(appController.getHealth()).toEqual({
      status: 'ok',
      service: 'operations-service',
    });
  });
});
