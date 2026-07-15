import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('Core AppController', () => {
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
      service: 'core-service',
      status: 'ok',
      transport: 'tcp',
    });
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
