import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ReportStatus, ReportTargetKind, User, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SafetyService } from './safety.service';

class BlockDto {
  @IsString()
  userId!: string;
}

class ReportDto {
  @IsEnum(ReportTargetKind)
  targetKind!: ReportTargetKind;

  @IsString()
  targetId!: string;

  @IsString()
  @MinLength(3)
  reason!: string;

  @IsOptional()
  @IsString()
  details?: string;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class SafetyController {
  constructor(private readonly safety: SafetyService) {}

  @Post('blocks')
  block(@CurrentUser() user: User, @Body() dto: BlockDto) {
    return this.safety.block(user.id, dto.userId);
  }

  @Get('blocks')
  listBlocks(@CurrentUser() user: User) {
    return this.safety.list(user.id);
  }

  @Post('reports')
  report(@CurrentUser() user: User, @Body() dto: ReportDto) {
    return this.safety.report(user.id, dto);
  }

  @Get('reports')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  listReports(@Query('status') status?: ReportStatus) {
    return this.safety.listReports(status);
  }
}
