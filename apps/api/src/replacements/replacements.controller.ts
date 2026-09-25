import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReplacementsService } from './replacements.service';

class CreateReplacementDto {
  @IsString()
  roomId!: string;

  @IsString()
  departingName!: string;

  @IsDateString()
  leaveDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

@Controller('replacements')
@UseGuards(JwtAuthGuard)
export class ReplacementsController {
  constructor(private readonly replacements: ReplacementsService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.replacements.list(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.replacements.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateReplacementDto) {
    return this.replacements.create(user, dto);
  }

  @Post(':id/filled')
  filled(@CurrentUser() user: User, @Param('id') id: string) {
    return this.replacements.close(user, id, 'FILLED');
  }

  @Post(':id/close')
  close(@CurrentUser() user: User, @Param('id') id: string) {
    return this.replacements.close(user, id, 'CLOSED');
  }
}
