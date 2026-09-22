import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MembershipService } from './membership.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MembershipController {
  constructor(private readonly membership: MembershipService) {}

  @Get('membership')
  status(@CurrentUser() user: User) {
    return this.membership.status(user.id);
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
