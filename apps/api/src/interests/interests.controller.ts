import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterestsService } from './interests.service';

class ExpressInterestDto {
  @IsString()
  toUserId!: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  pgListingId?: string;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class InterestsController {
  constructor(private readonly interests: InterestsService) {}

  @Post('interests')
  express(@CurrentUser() user: User, @Body() dto: ExpressInterestDto) {
    return this.interests.express(user.id, dto.toUserId, dto.roomId, dto.pgListingId);
  }

  @Get('interests')
  mine(@CurrentUser() user: User) {
    return this.interests.mine(user.id);
  }

  @Get('interests/:userId')
  state(@CurrentUser() user: User, @Param('userId') userId: string) {
    return this.interests.currentState(user.id, userId);
  }
}
