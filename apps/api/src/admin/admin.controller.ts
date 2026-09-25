import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ReportStatus, ReportTargetKind, SubscriptionStatus, UserRole, UserStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

class UpdateReportDto {
  @IsEnum(ReportStatus)
  status!: ReportStatus;
}

class CloseListingDto {
  @IsEnum(ReportTargetKind)
  kind!: ReportTargetKind;

  @IsString()
  targetId!: string;
}

class CreatePlanDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  amountPaise!: number;

  @IsInt()
  @Min(1)
  durationDays!: number;
}

class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  amountPaise?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

class GrantPremiumDto {
  @IsOptional()
  @IsString()
  planId?: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('users')
  users(
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
    @Query('premium') premium?: string,
    @Query('period') period?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.listUsers({
      role,
      status,
      premium,
      period,
      q,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('pg-owners')
  pgOwners(@Query('activeOnly') activeOnly?: string, @Query('q') q?: string) {
    return this.admin.listPgOwners({ activeOnly: activeOnly === 'true', q });
  }

  @Get('subscriptions')
  subscriptions(
    @Query('status') status?: SubscriptionStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.listSubscriptions({
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('plans')
  plans() {
    return this.admin.listPlans();
  }

  @Post('plans')
  createPlan(@Body() dto: CreatePlanDto) {
    return this.admin.createPlan(dto);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.admin.updatePlan(id, dto);
  }

  @Post('users/:id/premium')
  grantPremium(@Param('id') id: string, @Body() dto: GrantPremiumDto) {
    return this.admin.grantPremium(id, dto.planId);
  }

  @Delete('users/:id/premium')
  revokePremium(@Param('id') id: string) {
    return this.admin.revokePremium(id);
  }

  @Get('reports')
  reports(@Query('status') status?: ReportStatus) {
    return this.admin.listReports(status);
  }

  @Patch('reports/:id')
  updateReport(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.admin.updateReport(id, dto.status);
  }

  @Post('users/:id/suspend')
  suspendUser(@Param('id') id: string) {
    return this.admin.suspendUser(id);
  }

  @Post('users/:id/restore')
  restoreUser(@Param('id') id: string) {
    return this.admin.restoreUser(id);
  }

  @Post('listings/close')
  closeListing(@Body() dto: CloseListingDto) {
    return this.admin.closeListing(dto.kind, dto.targetId);
  }
}
