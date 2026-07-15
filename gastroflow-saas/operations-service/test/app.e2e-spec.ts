import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';

describe('Operations TCP health contract (e2e)', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    appController = moduleFixture.get(AppController);
  });

  it('operations.health returns a valid response without PostgreSQL', () => {
    const result = appController.getHealth();

    expect(result.service).toBe('operations-service');
    expect(result.status).toBe('ok');
    expect(result.transport).toBe('tcp');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
