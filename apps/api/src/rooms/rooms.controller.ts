import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomDto, SearchRoomsDto, UpdateRoomDto } from './dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateRoomDto) {
    return this.rooms.create(user, dto);
  }

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.rooms.mine(user);
  }

  @Get()
  search(@Query() query: SearchRoomsDto) {
    return this.rooms.search(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.rooms.get(id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.rooms.update(user, id, dto);
  }

  @Delete(':id')
  close(@CurrentUser() user: User, @Param('id') id: string) {
    return this.rooms.close(user, id);
  }

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file'))
  addPhoto(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.rooms.addPhoto(user, id, file);
  }
}
