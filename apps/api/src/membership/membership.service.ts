import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export const FREE_CONTACT_MATCHES = 3;

@Injectable()
export class MembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async status(userId: string) {
    const [isPremium, matchCount] = await Promise.all([
      this.isPremium(userId),
      this.prisma.match.count({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
      }),
    ]);
    return {
      isPremium,
      matchCount,
      freeLimit: FREE_CONTACT_MATCHES,
      freeRemaining: isPremium ? FREE_CONTACT_MATCHES : Math.max(0, FREE_CONTACT_MATCHES - matchCount),
    };
  }

  async isPremium(userId: string) {
    return Boolean(await this.redis.client.get(`premium:${userId}`));
  }

  async activate(userId: string) {
    await this.redis.client.set(`premium:${userId}`, '1');
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
