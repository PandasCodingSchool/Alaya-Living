import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto, OtpVerifyDto, RegisterDto } from './dto';
import { OtpProvider } from './otp.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly otp: OtpProvider,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        emailVerified: true,
        profile: { create: { firstName: dto.firstName } },
        preferences: { create: { localities: [] } },
      },
    });
    return this.issue(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issue(user);
  }

  requestOtp(phone: string) {
    return this.otp.request(phone);
  }

  async verifyOtp(dto: OtpVerifyDto, currentUser?: User) {
    const valid = await this.otp.verify(dto.phone, dto.code);
    if (!valid) throw new UnauthorizedException('Invalid or expired OTP');

    if (currentUser) {
      const user = await this.prisma.user.update({
        where: { id: currentUser.id },
        data: { phone: dto.phone, phoneVerified: true },
      });
      return this.issue(user);
    }

    let user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          phoneVerified: true,
          profile: { create: { firstName: dto.firstName || 'Member' } },
          preferences: { create: { localities: [] } },
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }
    return this.issue(user);
  }

  async refresh(refreshToken: string) {
    const userId = await this.redis.client.get(`refresh:${refreshToken}`);
    if (!userId) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    await this.redis.client.del(`refresh:${refreshToken}`);
    return this.issue(user);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) await this.redis.client.del(`refresh:${refreshToken}`);
  }

  private async issue(user: User) {
    const accessToken = await this.jwt.signAsync({ sub: user.id });
    const refreshToken = randomUUID();
    await this.redis.client.setex(`refresh:${refreshToken}`, 60 * 60 * 24 * 7, user.id);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
      },
    };
  }
}
