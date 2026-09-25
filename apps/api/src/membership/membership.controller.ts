import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MembershipService } from './membership.service';

class VerifyPaymentDto {
  @IsString()
  razorpay_order_id!: string;

  @IsString()
  razorpay_payment_id!: string;

  @IsString()
  razorpay_signature!: string;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class MembershipController {
  constructor(private readonly membership: MembershipService) {}

  @Get('membership')
  status(@CurrentUser() user: User) {
    return this.membership.status(user.id);
  }

  @Post('membership/checkout')
  checkout(@CurrentUser() user: User) {
    return this.membership.createCheckout(user.id);
  }

  @Post('membership/verify')
  verify(@CurrentUser() user: User, @Body() dto: VerifyPaymentDto) {
    return this.membership.verifyPayment(
      user.id,
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
  }

  @Post('membership/activate')
  activate(@CurrentUser() user: User) {
    return this.membership.activate(user.id);
  }

  @Get('contact/:userId')
  reveal(@CurrentUser() user: User, @Param('userId') userId: string) {
    return this.membership.reveal(user.id, userId);
  }
}
