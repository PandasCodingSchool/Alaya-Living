import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchingService } from './matching.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Get('discover/people')
  people(@CurrentUser() user: User) {
    return this.matching.people(user.id);
  }

  @Get('discover/rooms')
  rooms(@CurrentUser() user: User) {
    return this.matching.rooms(user.id);
  }

  @Get('people/:id/compatibility')
  compatibility(@CurrentUser() user: User, @Param('id') id: string) {
    return this.matching.personWithScore(user.id, id);
  }
}
