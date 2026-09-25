import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MatchReasonKind } from '@prisma/client';
import { MatchingService } from '../matching/matching.service';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

@Injectable()
export class InterestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matching: MatchingService,
  ) {}

  async express(fromUserId: string, toUserId: string, roomId?: string, pgListingId?: string) {
    if (fromUserId === toUserId) throw new ConflictException('Cannot interest yourself');
    const target = await this.prisma.user.findUnique({ where: { id: toUserId } });
    if (!target) throw new NotFoundException('User not found');
    if (pgListingId) {
      const pg = await this.prisma.pgListing.findUnique({ where: { id: pgListingId } });
      if (!pg) throw new NotFoundException('PG listing not found');
      if (pg.ownerUserId !== toUserId) throw new ConflictException('PG listing does not belong to this operator');
    }

    const existing = await this.prisma.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
    });
    if (existing) {
      if (roomId || pgListingId) {
        await this.prisma.interest.update({
          where: { id: existing.id },
          data: {
            ...(roomId ? { roomId } : {}),
            ...(pgListingId ? { pgListingId } : {}),
          },
        });
      }
    } else {
      await this.prisma.interest.create({ data: { fromUserId, toUserId, roomId, pgListingId } });
    }

    const reverse = await this.prisma.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } },
    });
    if (reverse) {
      const [a, b] = fromUserId < toUserId ? [fromUserId, toUserId] : [toUserId, fromUserId];
      const match = await this.prisma.match.findUnique({
        where: { userAId_userBId: { userAId: a, userBId: b } },
      });
      if (!match) await this.createMatch(fromUserId, toUserId);
    }

    return this.currentState(fromUserId, toUserId);
  }

  async mine(userId: string) {
    const [outgoing, incoming, matches] = await Promise.all([
      this.prisma.interest.findMany({
        where: { fromUserId: userId },
        include: { toUser: { include: userInclude } },
      }),
      this.prisma.interest.findMany({
        where: { toUserId: userId },
        include: { fromUser: { include: userInclude } },
      }),
      this.prisma.match.findMany({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
        include: {
          reasons: true,
          conversation: { include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } } },
          userA: { include: userInclude },
          userB: { include: userInclude },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      outgoing: outgoing.map((i) => ({ ...i, user: toPublicProfile(i.toUser) })),
      incoming: incoming.map((i) => ({ ...i, user: toPublicProfile(i.fromUser) })),
      matches: matches.map((m) => {
        const other = m.userAId === userId ? m.userB : m.userA;
        return {
          id: m.id,
          score: m.score,
          status: m.status,
          conversationId: m.conversation?.id ?? null,
          lastMessage: m.conversation?.messages[0] ?? null,
          reasons: m.reasons,
          user: toPublicProfile(other),
        };
      }),
    };
  }

  async currentState(fromUserId: string, toUserId: string) {
    const outgoing = await this.prisma.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
    });
    const incoming = await this.prisma.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } },
    });
    const [a, b] = fromUserId < toUserId ? [fromUserId, toUserId] : [toUserId, fromUserId];
    const match = await this.prisma.match.findUnique({
      where: { userAId_userBId: { userAId: a, userBId: b } },
      include: { conversation: true, reasons: true },
    });
    return {
      interested: !!outgoing,
      theyInterested: !!incoming,
      matched: !!match,
      matchId: match?.id ?? null,
      conversationId: match?.conversation?.id ?? null,
      status: match?.status ?? (outgoing ? 'INTEREST_SENT' : incoming ? 'INTEREST_RECEIVED' : 'DISCOVERED'),
    };
  }

  private async createMatch(userId1: string, userId2: string) {
    const [a, b] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
    const existing = await this.prisma.match.findUnique({
      where: { userAId_userBId: { userAId: a, userBId: b } },
    });
    if (existing) return existing;

    const scored = await this.matching.personWithScore(a, b);
    const match = await this.prisma.match.create({
      data: {
        userAId: a,
        userBId: b,
        score: scored.compatibility.score,
        status: 'MATCHED',
        reasons: {
          create: scored.compatibility.reasons.map((r) => ({
            factor: r.factor,
            kind: r.kind as MatchReasonKind,
            score: r.score,
            description: r.description,
          })),
        },
        conversation: {
          create: { userAId: a, userBId: b },
        },
      },
      include: { conversation: true },
    });
    return match;
  }
}
