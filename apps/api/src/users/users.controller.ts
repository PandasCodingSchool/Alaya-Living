import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePreferencesDto, UpdateProfileDto } from './dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('users/me')
  me(@CurrentUser() user: User) {
    return this.users.me(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('preferences')
  updatePreferences(@CurrentUser() user: User, @Body() dto: UpdatePreferencesDto) {
    return this.users.updatePreferences(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users/me/photo')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.users.uploadPhoto(user, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('people/:id')
  publicProfile(@Param('id') id: string) {
    return this.users.publicProfile(id);
  }
}
