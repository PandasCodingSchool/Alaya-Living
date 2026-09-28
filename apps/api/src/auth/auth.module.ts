import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationProvider } from './email-verification.provider';
import { JwtStrategy } from './jwt.strategy';
import { OtpProvider } from './otp.provider';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    EmailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-me',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OtpProvider, EmailVerificationProvider, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
