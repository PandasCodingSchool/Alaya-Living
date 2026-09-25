import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(to: string | null | undefined, subject: string, text: string) {
    if (!to) return;
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Alaya <onboarding@resend.dev>',
          to: [to],
          subject,
          text,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        this.logger.warn(`Resend failed (${res.status}): ${body}`);
      }
      return;
    }
    this.logger.log(`[email] To: ${to}\nSubject: ${subject}\n${text}`);
  }
}
