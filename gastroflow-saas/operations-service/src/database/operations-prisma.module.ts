import { Module } from '@nestjs/common';
import { OperationsPrismaService } from './operations-prisma.service';

@Module({
  providers: [OperationsPrismaService],
  exports: [OperationsPrismaService],
})
export class OperationsPrismaModule {}
