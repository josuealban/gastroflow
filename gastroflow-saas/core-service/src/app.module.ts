import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CustomersPrismaModule } from './database/customers/customers-prisma.module';
import { PersonalPrismaModule } from './database/personal/personal-prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PersonalPrismaModule,
    CustomersPrismaModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
