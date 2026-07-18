import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BranchAdminService } from './branch-admin.service';
@Controller()
export class BranchAdminController {
  constructor(private readonly service: BranchAdminService) {}
  @MessagePattern({ cmd: 'branches.list' })
  list(@Payload() p: Parameters<BranchAdminService['list']>[0]) {
    return this.service.list(p);
  }
  @MessagePattern({ cmd: 'branches.get' })
  get(@Payload() p: Parameters<BranchAdminService['get']>[0]) {
    return this.service.get(p);
  }
  @MessagePattern({ cmd: 'branches.create' })
  create(@Payload() p: Parameters<BranchAdminService['create']>[0]) {
    return this.service.create(p);
  }
  @MessagePattern({ cmd: 'branches.update' })
  update(@Payload() p: Parameters<BranchAdminService['update']>[0]) {
    return this.service.update(p);
  }
  @MessagePattern({ cmd: 'branches.status.update' })
  status(@Payload() p: Parameters<BranchAdminService['status']>[0]) {
    return this.service.status(p);
  }
  @MessagePattern({ cmd: 'branches.provisioning.get' }) provisioning(
    @Payload() p: Parameters<BranchAdminService['provisioning']>[0],
  ) {
    return this.service.provisioning(p);
  }
  @MessagePattern({ cmd: 'branches.provisioning.retry' }) retry(
    @Payload() p: Parameters<BranchAdminService['retry']>[0],
  ) {
    return this.service.retry(p);
  }
  @MessagePattern({ cmd: 'branches.assignable-staff' }) staff(
    @Payload() p: Parameters<BranchAdminService['staff']>[0],
  ) {
    return this.service.staff(p);
  }
}
