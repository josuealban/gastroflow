import { Module } from '@nestjs/common';
import { PersonalPrismaService } from './personal-prisma.service';

@Module({
  providers: [PersonalPrismaService],
  exports: [PersonalPrismaService],
})
export class PersonalPrismaModule {}
