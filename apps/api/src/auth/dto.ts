import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  firstName!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class OtpRequestDto {
  @IsString()
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;
}

export class OtpVerifyDto {
  @IsString()
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;

  @IsString()
  @MinLength(4)
  code!: string;

  @IsOptional()
  @IsString()
  firstName?: string;
}
