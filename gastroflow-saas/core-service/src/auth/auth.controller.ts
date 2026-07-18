import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
interface Internal {
  internalToken: string;
}
interface LoginMessage extends Internal {
  restaurantSlug: string;
  email: string;
  password: string;
}
interface RefreshMessage extends Internal {
  refreshToken: string;
}
interface LogoutMessage extends Internal {
  refreshToken?: string;
}
interface SessionMessage extends Internal {
  userId: string;
  branchId: string | null;
}
interface UserMessage extends Internal {
  userId: string;
}
interface SelectMessage extends SessionMessage {
  restaurantId: string;
  branchId: string;
  refreshToken: string;
}
@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @MessagePattern({ cmd: 'auth.login' }) login(@Payload() p: LoginMessage) {
    return this.auth.login(p);
  }
  @MessagePattern({ cmd: 'auth.refresh' }) refresh(
    @Payload() p: RefreshMessage,
  ) {
    return this.auth.refresh(p);
  }
  @MessagePattern({ cmd: 'auth.logout' }) logout(@Payload() p: LogoutMessage) {
    return this.auth.logout(p);
  }
  @MessagePattern({ cmd: 'auth.me' }) me(@Payload() p: SessionMessage) {
    return this.auth.me(p);
  }
  @MessagePattern({ cmd: 'session.branches.list' }) branches(
    @Payload() p: UserMessage,
  ) {
    return this.auth.branches(p);
  }
  @MessagePattern({ cmd: 'session.branch.select' }) select(
    @Payload() p: SelectMessage,
  ) {
    return this.auth.selectBranch(p);
  }
  @MessagePattern({ cmd: 'rbac.roles.list' }) roles(
    @Payload() p: SessionMessage,
  ) {
    return this.auth.roles(p);
  }
  @MessagePattern({ cmd: 'rbac.permissions.list' }) permissions(
    @Payload() p: SessionMessage,
  ) {
    return this.auth.permissions(p);
  }
}
