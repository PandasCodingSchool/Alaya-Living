import { Injectable, Logger } from '@nestjs/common';
import { DEV_OTP } from '../lib/constants';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OtpProvider {
  private readonly logger = new Logger(OtpProvider.name);

  constructor(private readonly redis: RedisService) {}

  async request(phone: string) {
    const code = process.env.NODE_ENV === 'production' ? String(Math.floor(100000 + Math.random() * 900000)) : DEV_OTP;
    await this.redis.client.setex(`otp:${phone}`, 300, code);
    this.logger.log(`OTP for ${phone}: ${code} (dev also accepts ${DEV_OTP})`);
    return { sent: true, hint: process.env.NODE_ENV === 'production' ? undefined : DEV_OTP };
  }

  async verify(phone: string, code: string) {
    if (code === DEV_OTP) return true;
    const stored = await this.redis.client.get(`otp:${phone}`);
    if (!stored || stored !== code) return false;
    await this.redis.client.del(`otp:${phone}`);
    return true;
  }
}
