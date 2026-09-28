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
import { FlatBhk, User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFlatDto, UpdateFlatDto } from './dto';
import { FlatsService } from './flats.service';

@Controller('flats')
@UseGuards(JwtAuthGuard)
export class FlatsController {
  constructor(private readonly flats: FlatsService) {}

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.flats.mine(user);
  }

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

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateFlatDto) {
    return this.flats.create(user, dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.flats.get(id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateFlatDto) {
    return this.flats.update(user, id, dto);
  }

  @Delete(':id')
  close(@CurrentUser() user: User, @Param('id') id: string) {
    return this.flats.close(user, id);
  }

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file'))
  addPhoto(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.flats.addPhoto(user, id, file);
  }
}
