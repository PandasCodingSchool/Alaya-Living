import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';
import { EmailService } from '../email/email.service';
import { RedisService } from '../redis/redis.service';

const DEV_CODE = '123456';
const CODE_TTL_SEC = 60 * 30;
const TOKEN_TTL_SEC = 60 * 60 * 24;

@Injectable()
export class EmailVerificationProvider {
  private readonly logger = new Logger(EmailVerificationProvider.name);

  constructor(
    private readonly redis: RedisService,
    private readonly email: EmailService,
  ) {}

  async send(userId: string, email: string) {
    const code = process.env.NODE_ENV === 'production' ? String(randomInt(100000, 999999)) : DEV_CODE;
    const token = randomBytes(24).toString('hex');
    await this.redis.client.setex(`email-code:${userId}`, CODE_TTL_SEC, code);
    await this.redis.client.setex(`email-token:${token}`, TOKEN_TTL_SEC, userId);

    const webOrigin = (process.env.WEB_ORIGIN || 'http://localhost:3000').split(',')[0].trim();
    const link = `${webOrigin}/verify-email?token=${token}`;

    await this.email.send(
      email,
      'Verify your Alaya email',
      [
        'Confirm your email to unlock trust badges on your profile.',
        '',
        `Verification code: ${code}`,
        `Or open this link: ${link}`,
        '',
        'The code expires in 30 minutes.',
      ].join('\n'),
    );

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`[email-verify] user=${userId} code=${code} link=${link}`);
    }

    return { ok: true, devCode: process.env.NODE_ENV !== 'production' ? DEV_CODE : undefined };
  }

  async verifyCode(userId: string, code: string) {
    const stored = await this.redis.client.get(`email-code:${userId}`);
    if (!stored || stored !== code.trim()) return false;
    await this.redis.client.del(`email-code:${userId}`);
    return true;
  }

  async verifyToken(token: string) {
    const userId = await this.redis.client.get(`email-token:${token}`);
    if (!userId) return null;
    await this.redis.client.del(`email-token:${token}`);
    await this.redis.client.del(`email-code:${userId}`);
    return userId;
  }
}
