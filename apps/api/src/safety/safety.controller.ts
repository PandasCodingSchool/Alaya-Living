import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SafetyService } from './safety.service';

class BlockDto {
  @IsString()
  userId!: string;
}

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class SafetyController {
  constructor(private readonly safety: SafetyService) {}

  @Post()
  block(@CurrentUser() user: User, @Body() dto: BlockDto) {
    return this.safety.block(user.id, dto.userId);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.safety.list(user.id);
  }
}
