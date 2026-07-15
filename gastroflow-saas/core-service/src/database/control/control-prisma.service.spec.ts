import { ConfigService } from '@nestjs/config';
import { ControlPrismaService } from './control-prisma.service';

describe('ControlPrismaService', () => {
  it('connects and disconnects through the Prisma lifecycle methods', async () => {
    const service = new ControlPrismaService(
      new ConfigService({
        CONTROL_DATABASE_URL:
          'postgresql://user:password@localhost:5432/control',
      }),
    );
    const connect = jest.spyOn(service, '$connect').mockResolvedValue();
    const disconnect = jest.spyOn(service, '$disconnect').mockResolvedValue();
    await service.connect();
    await service.onModuleDestroy();
    expect(connect).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('requires a control database URL without logging it', () => {
    const log = jest.spyOn(console, 'log').mockImplementation();
    expect(() => new ControlPrismaService(new ConfigService({}))).toThrow(
      'CONTROL_DATABASE_URL is required',
    );
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
