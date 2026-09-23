import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GeoOrigin } from '../lib/geo';
import { MatchingService } from './matching.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Get('discover/people')
  people(
    @CurrentUser() user: User,
    @Query('radiusKm') radiusKm?: string,
    @Query('origin') origin?: GeoOrigin,
  ) {
    return this.matching.people(user.id, this.geoQuery(radiusKm, origin));
  }

  @Get('discover/rooms')
  rooms(
    @CurrentUser() user: User,
    @Query('radiusKm') radiusKm?: string,
    @Query('origin') origin?: GeoOrigin,
  ) {
    return this.matching.rooms(user.id, this.geoQuery(radiusKm, origin));
  }

  @Get('people/:id/compatibility')
  compatibility(@CurrentUser() user: User, @Param('id') id: string) {
    return this.matching.personWithScore(user.id, id);
  }

  private geoQuery(radiusKm?: string, origin?: GeoOrigin) {
    const parsed = radiusKm == null || radiusKm === '' ? undefined : Number(radiusKm);
    return {
      radiusKm: Number.isFinite(parsed) ? parsed : undefined,
      origin: origin === 'home' ? 'home' as const : origin === 'office' ? 'office' as const : undefined,
    };
  }
}
