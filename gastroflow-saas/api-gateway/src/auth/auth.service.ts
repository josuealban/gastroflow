import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { CORE_SERVICE_CLIENT, MICROSERVICE_TIMEOUT } from '../injection-tokens';
@Injectable()
export class AuthService {
  private readonly token: string;
  constructor(
    @Inject(CORE_SERVICE_CLIENT) private readonly core: ClientProxy,
    @Inject(MICROSERVICE_TIMEOUT) private readonly timeoutMs: number,
    config: ConfigService,
  ) {
    this.token = config.get<string>('INTERNAL_SERVICE_TOKEN') ?? '';
  }
  async send<T>(cmd: string, data: object): Promise<T> {
    try {
      return await firstValueFrom(
        this.core
          .send<T>({ cmd }, { ...data, internalToken: this.token })
          .pipe(timeout(this.timeoutMs)),
      );
    } catch (e: unknown) {
      const x = e as { statusCode?: number; message?: string };
      if (x.statusCode === 400) throw new BadRequestException(x.message);
      if (x.statusCode === 401) throw new UnauthorizedException(x.message);
      if (x.statusCode === 403) throw new ForbiddenException(x.message);
      throw new ServiceUnavailableException('Core Service unavailable');
    }
  }
}
