import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';

describe('Core TCP health contract (e2e)', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    appController = moduleFixture.get(AppController);
  });

  it('core.health returns a valid service response without PostgreSQL', () => {
    const result = appController.getHealth();

    expect(result.service).toBe('core-service');
    expect(result.status).toBe('ok');
    expect(result.transport).toBe('tcp');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
