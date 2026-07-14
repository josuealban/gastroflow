import { Module } from '@nestjs/common';
import { CustomersPrismaService } from './customers-prisma.service';

@Module({
  providers: [CustomersPrismaService],
  exports: [CustomersPrismaService],
})
export class CustomersPrismaModule {}
