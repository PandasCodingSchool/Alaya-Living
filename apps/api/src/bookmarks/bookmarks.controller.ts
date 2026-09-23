import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BookmarkKind, User } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookmarksService } from './bookmarks.service';

class ToggleBookmarkDto {
  @IsEnum(BookmarkKind)
  kind!: BookmarkKind;

  @IsString()
  targetId!: string;
}

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarks: BookmarksService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.bookmarks.list(user.id);
  }

  @Get('ids')
  async ids(@CurrentUser() user: User) {
    const rows = await this.bookmarks.ids(user.id);
    return {
      people: rows.filter((row) => row.kind === BookmarkKind.PERSON).map((row) => row.targetId),
      rooms: rows.filter((row) => row.kind === BookmarkKind.ROOM).map((row) => row.targetId),
    };
  }

  @Get('check')
  check(
    @CurrentUser() user: User,
    @Query('kind') kind: BookmarkKind,
    @Query('targetId') targetId: string,
  ) {
    return this.bookmarks.check(user.id, kind, targetId);
  }

  @Post()
  toggle(@CurrentUser() user: User, @Body() dto: ToggleBookmarkDto) {
    return this.bookmarks.toggle(user, dto.kind, dto.targetId);
  }
}
