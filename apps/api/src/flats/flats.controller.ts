import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FlatBhk } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FlatsService } from './flats.service';

@Controller('flats')
@UseGuards(JwtAuthGuard)
export class FlatsController {
  constructor(private readonly flats: FlatsService) {}

  @Get()
  list(
    @Query('locality') locality?: string,
    @Query('bhk') bhk?: FlatBhk,
    @Query('minRent') minRent?: string,
    @Query('maxRent') maxRent?: string,
  ) {
    return this.flats.list({
      locality,
      bhk,
      minRent: minRent ? Number(minRent) : undefined,
      maxRent: maxRent ? Number(maxRent) : undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.flats.get(id);
  }
}
