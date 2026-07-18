import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BranchAdminService } from './branch-admin.service';
@Controller()
export class BranchAdminController {
  constructor(private readonly service: BranchAdminService) {}
  @MessagePattern({ cmd: 'branches.list' }) list(@Payload() p: any) {
    return this.service.list(p);
  }
  @MessagePattern({ cmd: 'branches.get' }) get(@Payload() p: any) {
    return this.service.get(p);
  }
  @MessagePattern({ cmd: 'branches.create' }) create(@Payload() p: any) {
    return this.service.create(p);
  }
  @MessagePattern({ cmd: 'branches.update' }) update(@Payload() p: any) {
    return this.service.update(p);
  }
  @MessagePattern({ cmd: 'branches.status.update' }) status(@Payload() p: any) {
    return this.service.status(p);
  }
  @MessagePattern({ cmd: 'branches.provisioning.get' }) provisioning(
    @Payload() p: any,
  ) {
    return this.service.provisioning(p);
  }
  @MessagePattern({ cmd: 'branches.provisioning.retry' }) retry(
    @Payload() p: any,
  ) {
    return this.service.retry(p);
  }
  @MessagePattern({ cmd: 'branches.assignable-staff' }) staff(
    @Payload() p: any,
  ) {
    return this.service.staff(p);
  }
}
