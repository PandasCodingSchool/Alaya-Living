import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { User, VerificationKind } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KycService } from './kyc.service';

class SubmitKycDto {
  @IsEnum(VerificationKind)
  kind!: VerificationKind;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  documentRef?: string;

  @IsOptional()
  @IsString()
  pgListingId?: string;

  @IsOptional()
  @IsString()
  flatListingId?: string;
}

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.kyc.mine(user.id);
  }

  @Post('submit')
  submit(@CurrentUser() user: User, @Body() dto: SubmitKycDto) {
    return this.kyc.submit(user, dto);
  }
}
