import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginDto, OtpRequestDto, OtpVerifyDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.attach(res, await this.auth.register(dto));
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.attach(res, await this.auth.login(dto));
  }

  @Post('otp/request')
  requestOtp(@Body() dto: OtpRequestDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @Post('otp/verify')
  async verifyOtp(
    @Body() dto: OtpVerifyDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const current = (req as Request & { user?: User }).user;
    return this.attach(res, await this.auth.verifyOtp(dto, current));
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token as string | undefined;
    return this.attach(res, await this.auth.refresh(token || ''));
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.refresh_token);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { ok: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('otp/link')
  async linkPhone(
    @Body() dto: OtpVerifyDto,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.attach(res, await this.auth.verifyOtp(dto, user));
  }

  private attach(res: Response, tokens: Awaited<ReturnType<AuthService['login']>>) {
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return tokens;
  }
}
