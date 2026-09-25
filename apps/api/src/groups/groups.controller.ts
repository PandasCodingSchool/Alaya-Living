import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GroupsService } from './groups.service';

class CreateGroupDto {
  @IsString()
  title!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(6)
  targetSize!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  targetRentEach!: number;

  @IsArray()
  @IsString({ each: true })
  localities!: string[];

  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class InviteDto {
  @IsString()
  userId!: string;
}

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.groups.list(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.groups.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateGroupDto) {
    return this.groups.create(user, dto);
  }

  @Post(':id/invite')
  invite(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: InviteDto) {
    return this.groups.invite(user, id, dto.userId);
  }

  @Post(':id/accept')
  accept(@CurrentUser() user: User, @Param('id') id: string) {
    return this.groups.accept(user, id);
  }

  @Post(':id/decline')
  decline(@CurrentUser() user: User, @Param('id') id: string) {
    return this.groups.decline(user, id);
  }

  @Post(':id/leave')
  leave(@CurrentUser() user: User, @Param('id') id: string) {
    return this.groups.leave(user, id);
  }

  @Post(':id/close')
  close(@CurrentUser() user: User, @Param('id') id: string) {
    return this.groups.close(user, id);
  }

  @Post(':id/search')
  search(@CurrentUser() user: User, @Param('id') id: string) {
    return this.groups.searchPgs(user, id);
  }
}
