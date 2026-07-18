import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BranchDatabaseService } from '../database/branch/branch-database.service';
import {
  BranchProvisioningService,
  ProvisionInput,
} from './branch-provisioning.service';
@Controller()
export class BranchProvisioningController {
  constructor(
    private readonly service: BranchProvisioningService,
    private readonly branches: BranchDatabaseService,
  ) {}
  @MessagePattern({ cmd: 'branch.provision' }) provision(
    @Payload() p: ProvisionInput & { internalToken: string },
  ) {
    this.service.authorize(p.internalToken);
    return this.service.provision(p);
  }
  @MessagePattern({ cmd: 'branch.connection.invalidate' }) invalidate(
    @Payload() p: { internalToken: string; branchId: string },
  ) {
    this.service.authorize(p.internalToken);
    return this.branches.evict(p.branchId).then(() => ({ success: true }));
  }
}
