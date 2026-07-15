import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/control-client/client';

@Injectable()
export class ControlPrismaService
  extends PrismaClient
  implements OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('CONTROL_DATABASE_URL');
    if (!connectionString) {
      throw new Error('CONTROL_DATABASE_URL is required');
    }

    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async connect(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
