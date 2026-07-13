import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/audit-client/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  readonly databaseUrlConfigured: boolean;

  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('AUDIT_DATABASE_URL');
    if (!connectionString) {
      throw new Error('AUDIT_DATABASE_URL es obligatoria');
    }

    super({ adapter: new PrismaPg({ connectionString }) });
    this.databaseUrlConfigured = true;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
