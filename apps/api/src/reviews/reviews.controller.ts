import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReviewTargetKind, User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';

class CreateReviewDto {
  @IsEnum(ReviewTargetKind)
  targetKind!: ReviewTargetKind;

  @IsString()
  targetId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  summary(@Query('targetKind') targetKind: ReviewTargetKind, @Query('targetId') targetId: string) {
    return this.reviews.summary(targetKind, targetId);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, dto.targetKind, dto.targetId, dto.rating, dto.comment);
  }
}
