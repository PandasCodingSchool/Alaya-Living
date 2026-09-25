import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { PgBedStatus, PgGenderPolicy, PgSharingType, PropertyType, SharingPermission, User, UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PgsService } from './pgs.service';

class SharingOptionDto {
  @IsEnum(PgSharingType)
  sharingType!: PgSharingType;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  monthlyRent!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedsAvailable!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalBeds!: number;
}

class BedDto {
  @IsString()
  roomLabel!: string;

  @IsString()
  bedLabel!: string;

  @IsEnum(PgSharingType)
  sharingType!: PgSharingType;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  monthlyRent!: number;

  @IsEnum(PgBedStatus)
  status!: PgBedStatus;
}

class QuickPgDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SharingOptionDto)
  sharingOptions?: SharingOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BedDto)
  beds?: BedDto[];
}

class CreatePgDto {
  @IsString()
  title!: string;

  @IsString()
  locality!: string;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  monthlyRent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deposit?: number;

  @IsOptional()
  @IsEnum(PgGenderPolicy)
  genderPolicy?: PgGenderPolicy;

  @IsOptional()
  @IsBoolean()
  mealsIncluded?: boolean;

  @IsOptional()
  @IsEnum(SharingPermission)
  sharingPermission?: SharingPermission;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedsAvailable?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalBeds?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SharingOptionDto)
  sharingOptions?: SharingOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BedDto)
  beds?: BedDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  availableFrom!: string;

  @IsOptional()
  @IsString()
  exactAddress?: string;
}

@Controller('pgs')
@UseGuards(JwtAuthGuard)
export class PgsController {
  constructor(private readonly pgs: PgsService) {}

  @Get()
  list(
    @CurrentUser() user: User,
    @Query('locality') locality?: string,
    @Query('minBudget') minBudget?: string,
    @Query('maxBudget') maxBudget?: string,
    @Query('gender') gender?: PgGenderPolicy,
  ) {
    if (user.role === UserRole.PG_OWNER) {
      throw new ForbiddenException('PG operators manage listings from the dashboard — marketplace browse is for seekers only');
    }
    return this.pgs.list({
      locality,
      minBudget: minBudget ? Number(minBudget) : undefined,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
      gender,
    });
  }

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.pgs.mine(user.id);
  }

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PG_OWNER, UserRole.ADMIN)
  dashboard(@CurrentUser() user: User) {
    return this.pgs.dashboard(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.pgs.get(user, id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreatePgDto) {
    return this.pgs.create(user, dto);
  }

  @Patch(':id/quick')
  quickUpdate(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: QuickPgDto) {
    return this.pgs.quickUpdate(user, id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreatePgDto) {
    return this.pgs.update(user, id, dto);
  }

  @Delete(':id')
  close(@CurrentUser() user: User, @Param('id') id: string) {
    return this.pgs.close(user, id);
  }

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file'))
  addPhoto(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pgs.addPhoto(user, id, file);
  }
}
