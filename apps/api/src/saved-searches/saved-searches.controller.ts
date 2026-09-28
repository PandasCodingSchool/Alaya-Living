import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsEnum, IsObject, IsString } from 'class-validator';
import { SavedSearchKind, User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SavedSearchesService } from './saved-searches.service';

class CreateSavedSearchDto {
  @IsString()
  name!: string;

  @IsEnum(SavedSearchKind)
  kind!: SavedSearchKind;

  @IsObject()
  filters!: Record<string, unknown>;
}

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearches: SavedSearchesService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.savedSearches.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateSavedSearchDto) {
    return this.savedSearches.create(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.savedSearches.remove(user.id, id);
  }
}
