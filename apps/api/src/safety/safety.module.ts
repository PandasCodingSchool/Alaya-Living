import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';

@Module({
  controllers: [SafetyController],
  providers: [SafetyService, RolesGuard],
})
export class SafetyModule {}
