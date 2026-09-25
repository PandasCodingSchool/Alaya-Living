import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionSource } from '@prisma/client';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export const FREE_CONTACT_MATCHES = 3;
const DEFAULT_PLAN_ID = 'plan_premium_monthly';

@Injectable()
export class MembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async defaultPlan() {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { active: true },
      orderBy: { amountPaise: 'asc' },
    });
    if (plan) return plan;
    return this.prisma.subscriptionPlan.findUnique({ where: { id: DEFAULT_PLAN_ID } });
  }

  async status(userId: string) {
    const plan = await this.defaultPlan();
    const [isPremium, matchCount, activeSub] = await Promise.all([
      this.isPremium(userId),
      this.prisma.match.count({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
      }),
      this.activeSubscription(userId),
    ]);
    return {
      isPremium,
      matchCount,
      freeLimit: FREE_CONTACT_MATCHES,
      freeRemaining: isPremium ? FREE_CONTACT_MATCHES : Math.max(0, FREE_CONTACT_MATCHES - matchCount),
      paymentsEnabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      premiumAmountInr: (plan?.amountPaise ?? 29900) / 100,
      expiresAt: activeSub?.expiresAt.toISOString() ?? null,
      planName: activeSub?.plan?.name ?? plan?.name ?? 'Premium',
    };
  }

  async activeSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: 'desc' },
      include: { plan: true },
    });
  }

  async isPremium(userId: string) {
    const sub = await this.activeSubscription(userId);
    if (sub) return true;
    return Boolean(await this.redis.client.get(`premium:${userId}`));
  }

  async grantPremium(
    userId: string,
    opts: {
      source: SubscriptionSource;
      planId?: string;
      amountPaise?: number;
      durationDays?: number;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
    },
  ) {
    const plan = opts.planId
      ? await this.prisma.subscriptionPlan.findUnique({ where: { id: opts.planId } })
      : await this.defaultPlan();
    const amountPaise = opts.amountPaise ?? plan?.amountPaise ?? 29900;
    const durationDays = opts.durationDays ?? plan?.durationDays ?? 30;
    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await this.prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    const sub = await this.prisma.subscription.create({
      data: {
        userId,
        planId: plan?.id,
        status: 'ACTIVE',
        source: opts.source,
        amountPaise,
        razorpayOrderId: opts.razorpayOrderId,
        razorpayPaymentId: opts.razorpayPaymentId,
        startsAt,
        expiresAt,
      },
    });

    const ttlSeconds = Math.max(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    await this.redis.client.set(`premium:${userId}`, '1', 'EX', ttlSeconds);
    return sub;
  }

  async revokePremium(userId: string) {
    await this.prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });
    await this.redis.client.del(`premium:${userId}`);
  }

  async activate(userId: string) {
    await this.grantPremium(userId, { source: 'DEMO' });
    return this.status(userId);
  }

  async createCheckout(userId: string) {
    const plan = await this.defaultPlan();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    const amountPaise = plan?.amountPaise ?? 29900;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return { mode: 'demo' as const, planId: plan?.id ?? null, amountPaise };
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `premium_${userId.slice(-8)}_${Date.now()}`,
        notes: { userId, planId: plan?.id ?? '' },
      }),
    });
    if (!res.ok) {
      throw new BadRequestException('Could not create payment order');
    }
    const order = (await res.json()) as { id: string; amount: number; currency: string };
    await this.redis.client.set(`premium_order:${order.id}`, userId, 'EX', 3600);
    return {
      mode: 'razorpay' as const,
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planId: plan?.id ?? null,
      name: plan?.name ?? 'Alaya Premium',
      description: plan?.description ?? 'Unlimited contact unlocks for 1 month',
      prefill: {
        email: user?.email ?? undefined,
        name: user?.profile?.firstName ?? undefined,
      },
    };
  }

  async verifyPayment(userId: string, orderId: string, paymentId: string, signature: string) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return this.activate(userId);
    }
    const expected = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    if (expected !== signature) {
      throw new BadRequestException('Invalid payment signature');
    }
    const owner = await this.redis.client.get(`premium_order:${orderId}`);
    if (owner && owner !== userId) {
      throw new BadRequestException('Order does not belong to this user');
    }
    const plan = await this.defaultPlan();
    await this.grantPremium(userId, {
      source: 'RAZORPAY',
      planId: plan?.id,
      amountPaise: plan?.amountPaise,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });
    await this.redis.client.del(`premium_order:${orderId}`);
    return this.status(userId);
  }

  async canReveal(viewerId: string, otherId: string) {
    const membership = await this.status(viewerId);
    if (viewerId === otherId) {
      return { allowed: true, reason: null as string | null, membership };
    }
    const [a, b] = viewerId < otherId ? [viewerId, otherId] : [otherId, viewerId];
    const match = await this.prisma.match.findUnique({
      where: { userAId_userBId: { userAId: a, userBId: b } },
    });
    if (!match) {
      return { allowed: false, reason: 'NOT_MATCHED', membership };
    }
    if (membership.isPremium) {
      return { allowed: true, reason: null, membership };
    }
    const matches = await this.prisma.match.findMany({
      where: { OR: [{ userAId: viewerId }, { userBId: viewerId }] },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    const index = matches.findIndex((row) => row.id === match.id);
    if (index >= 0 && index < FREE_CONTACT_MATCHES) {
      return { allowed: true, reason: null, membership };
    }
    return { allowed: false, reason: 'PREMIUM_REQUIRED', membership };
  }

  async reveal(viewerId: string, otherId: string) {
    const gate = await this.canReveal(viewerId, otherId);
    if (!gate.allowed) {
      return { ...gate, phone: null, email: null };
    }
    const other = await this.prisma.user.findUnique({
      where: { id: otherId },
      select: { phone: true, email: true },
    });
    return {
      ...gate,
      phone: other?.phone ?? null,
      email: other?.email ?? null,
    };
  }
}
