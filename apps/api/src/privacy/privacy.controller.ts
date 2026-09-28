import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrivacyService } from './privacy.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class PrivacyController {
  constructor(private readonly privacy: PrivacyService) {}

  @Get('rooms/:id/address')
  roomAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.privacy.revealRoomAddress(user.id, id);
  }

  @Get('pgs/:id/address')
  pgAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.privacy.revealPgAddress(user.id, id);
  }

  @Get('flats/:id/address')
  flatAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.privacy.revealFlatAddress(user.id, id);
  }
}
