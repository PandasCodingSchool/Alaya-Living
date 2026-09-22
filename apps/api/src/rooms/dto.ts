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
} from 'class-validator';
import { PropertyType, RoomType, SharingPermission } from '@prisma/client';

export class CreateRoomDto {
  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @IsString()
  locality!: string;

  @IsOptional()
  @IsString()
  exactAddress?: string;

  @IsEnum(RoomType)
  roomType!: RoomType;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  monthlyRent!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  roommateContribution!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deposit?: number;

  @IsDateString()
  availableFrom!: string;

  @IsEnum(SharingPermission)
  sharingPermission!: SharingPermission;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  currentOccupants?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  availableSlots?: number;

  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRoomDto extends CreateRoomDto {}

export class SearchRoomsDto {
  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minBudget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxBudget?: number;

  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @IsOptional()
  @IsString()
  amenity?: string;
}
