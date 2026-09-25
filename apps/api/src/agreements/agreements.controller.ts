import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgreementsService } from './agreements.service';

class CreateAgreementDto {
  @IsString()
  matchId!: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  rentEach?: number;

  @IsOptional()
  @IsString()
  electricity?: string;

  @IsOptional()
  @IsString()
  internet?: string;

  @IsOptional()
  @IsString()
  cleaning?: string;

  @IsOptional()
  @IsString()
  groceries?: string;

  @IsOptional()
  @IsString()
  guests?: string;

  @IsOptional()
  @IsString()
  quietHours?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class UpdateAgreementDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  rentEach?: number;

  @IsOptional()
  @IsString()
  electricity?: string;

  @IsOptional()
  @IsString()
  internet?: string;

  @IsOptional()
  @IsString()
  cleaning?: string;

  @IsOptional()
  @IsString()
  groceries?: string;

  @IsOptional()
  @IsString()
  guests?: string;

  @IsOptional()
  @IsString()
  quietHours?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

@Controller('agreements')
@UseGuards(JwtAuthGuard)
export class AgreementsController {
  constructor(private readonly agreements: AgreementsService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.agreements.list(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateAgreementDto) {
    return this.agreements.create(user, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateAgreementDto) {
    return this.agreements.update(user, id, dto);
  }

  @Post(':id/confirm')
  confirm(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.confirm(user, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agreements.cancel(user, id);
  }
}
