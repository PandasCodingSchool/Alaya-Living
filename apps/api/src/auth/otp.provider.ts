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
    const sent = await this.sendSms(phone, `Your Alaya verification code is ${code}. Valid for 5 minutes.`);
    if (!sent) {
      this.logger.log(`OTP for ${phone}: ${code} (dev also accepts ${DEV_OTP})`);
    }
    return { sent: true, hint: process.env.NODE_ENV === 'production' ? undefined : DEV_OTP };
  }

  async verify(phone: string, code: string) {
    if (code === DEV_OTP) return true;
    const stored = await this.redis.client.get(`otp:${phone}`);
    if (!stored || stored !== code) return false;
    await this.redis.client.del(`otp:${phone}`);
    return true;
  }

  private async sendSms(phone: string, message: string) {
    const msg91Key = process.env.MSG91_AUTH_KEY;
    const msg91Sender = process.env.MSG91_SENDER || 'ALAYAA';
    if (msg91Key) {
      const mobile = phone.replace(/\D/g, '').replace(/^91/, '');
      const url = `https://api.msg91.com/api/sendhttp.php?authkey=${encodeURIComponent(msg91Key)}&mobiles=${mobile}&message=${encodeURIComponent(message)}&sender=${encodeURIComponent(msg91Sender)}&route=4&country=91`;
      const res = await fetch(url);
      if (res.ok) return true;
      this.logger.warn(`MSG91 failed (${res.status}): ${await res.text()}`);
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    if (twilioSid && twilioToken && twilioFrom) {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: phone, From: twilioFrom, Body: message }),
      });
      if (res.ok) return true;
      this.logger.warn(`Twilio failed (${res.status}): ${await res.text()}`);
    }

    return false;
  }
}
