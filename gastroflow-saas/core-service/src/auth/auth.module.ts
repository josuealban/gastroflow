import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ControlPrismaModule } from '../database/control/control-prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
@Module({
  imports: [ControlPrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService],
})
export class AuthModule {}
