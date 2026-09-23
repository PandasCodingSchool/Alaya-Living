import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  AlcoholPreference,
  FoodPreference,
  Gender,
  SmokingPreference,
  UserIntent,
  WorkMode,
} from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(80)
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  workLocation?: string;

  @IsOptional()
  @IsEnum(WorkMode)
  workMode?: WorkMode;

  @IsOptional()
  @IsEnum(UserIntent)
  intent?: UserIntent;

  @IsOptional()
  @IsBoolean()
  onboardingDone?: boolean;
}

export class UpdatePreferencesDto {
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
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(23)
  sleepStart?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(23)
  sleepEnd?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  cleanliness?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  noiseTolerance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  cookingFrequency?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  guestFrequency?: number;

  @IsOptional()
  @IsEnum(FoodPreference)
  foodPreference?: FoodPreference;

  @IsOptional()
  @IsEnum(SmokingPreference)
  smokingPreference?: SmokingPreference;

  @IsOptional()
  @IsBoolean()
  smokingRequired?: boolean;

  @IsOptional()
  @IsEnum(AlcoholPreference)
  alcoholPreference?: AlcoholPreference;

  @IsOptional()
  @IsBoolean()
  pets?: boolean;

  @IsOptional()
  @IsBoolean()
  languageMatters?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(Gender, { each: true })
  preferredGenders?: Gender[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  localities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  preferredRadiusKm?: number;
}
