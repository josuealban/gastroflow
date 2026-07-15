import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('Operations AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    appController = app.get(AppController);
  });

  it('returns the documented TCP health response', () => {
    const result = appController.getHealth();

    expect(result).toMatchObject({
      service: 'operations-service',
      status: 'ok',
      transport: 'tcp',
    });
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
