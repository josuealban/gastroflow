import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CurrentUser, Permissions } from '../auth/auth.decorators';
import type { RequestUser } from '../auth/jwt.strategy';
import {
  BranchQueryDto,
  BranchStatusDto,
  CreateBranchDto,
  UpdateBranchDto,
} from './branches.dto';
@Controller('branches')
export class BranchesController {
  constructor(private readonly core: AuthService) {}
  private ctx(u: RequestUser) {
    return { restaurantId: u.restaurantId, userId: u.sub };
  }
  @Permissions('branches.read') @Get() list(
    @CurrentUser() u: RequestUser,
    @Query() q: BranchQueryDto,
  ) {
    return this.core.send('branches.list', { ...this.ctx(u), ...q });
  }
  @Permissions('branches.create') @Get('assignable-staff') staff(
    @CurrentUser() u: RequestUser,
  ) {
    return this.core.send('branches.assignable-staff', this.ctx(u));
  }
  @Permissions('branches.read') @Get(':id/provisioning') provisioning(
    @CurrentUser() u: RequestUser,
    @Param('id') id: string,
  ) {
    return this.core.send('branches.provisioning.get', { ...this.ctx(u), id });
  }
  @Permissions('branches.read') @Get(':id') get(
    @CurrentUser() u: RequestUser,
    @Param('id') id: string,
  ) {
    return this.core.send('branches.get', { ...this.ctx(u), id });
  }
  @Permissions('branches.create') @Post() @HttpCode(202) create(
    @CurrentUser() u: RequestUser,
    @Headers('idempotency-key') key: string | undefined,
    @Body() body: CreateBranchDto,
  ) {
    if (
      !key ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        key,
      )
    )
      throw new BadRequestException('Valid Idempotency-Key is required');
    return this.core.send('branches.create', {
      ...this.ctx(u),
      idempotencyKey: key,
      body,
    });
  }
  @Permissions('branches.update') @Patch(':id') update(
    @CurrentUser() u: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdateBranchDto,
  ) {
    return this.core.send('branches.update', { ...this.ctx(u), id, body });
  }
  @Permissions('branches.deactivate') @Patch(':id/status') status(
    @CurrentUser() u: RequestUser,
    @Param('id') id: string,
    @Body() body: BranchStatusDto,
  ) {
    return this.core.send('branches.status.update', {
      ...this.ctx(u),
      id,
      status: body.status,
    });
  }
  @Permissions('branches.retry-provisioning')
  @Post(':id/retry-provisioning')
  @HttpCode(202)
  retry(@CurrentUser() u: RequestUser, @Param('id') id: string) {
    return this.core.send('branches.provisioning.retry', {
      ...this.ctx(u),
      id,
    });
  }
}
