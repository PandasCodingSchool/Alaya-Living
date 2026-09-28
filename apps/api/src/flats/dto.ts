import { FlatBhk } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateFlatDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  locality!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsEnum(FlatBhk)
  bhk!: FlatBhk;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  monthlyRent!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  deposit?: number;

  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @IsArray()
  @IsString({ each: true })
  amenities!: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  availableFrom!: string;

  @IsOptional()
  @IsString()
  exactAddress?: string;
}

export class UpdateFlatDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsEnum(FlatBhk)
  bhk?: FlatBhk;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  monthlyRent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  deposit?: number;

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

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsString()
  exactAddress?: string;
}
