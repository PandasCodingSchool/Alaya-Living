import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { MembershipModule } from '../membership/membership.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [MembershipModule],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
