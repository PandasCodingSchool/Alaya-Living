import { BadRequestException, Injectable } from '@nestjs/common';
import { ReviewTargetKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(targetKind: ReviewTargetKind, targetId: string) {
    const rows = await this.prisma.review.findMany({
      where: { targetKind, targetId },
      include: { reviewer: { include: userInclude } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const count = rows.length;
    const average = count ? rows.reduce((sum, row) => sum + row.rating, 0) / count : 0;
    return {
      average: Math.round(average * 10) / 10,
      count,
      reviews: rows.map((row) => ({
        id: row.id,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.createdAt.toISOString(),
        reviewer: toPublicProfile(row.reviewer),
      })),
    };
  }

  async create(reviewerId: string, targetKind: ReviewTargetKind, targetId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be 1–5');
    await this.assertTarget(targetKind, targetId);
    if (targetKind === 'USER' && targetId === reviewerId) {
      throw new BadRequestException('You cannot review yourself');
    }
    return this.prisma.review.upsert({
      where: { reviewerId_targetKind_targetId: { reviewerId, targetKind, targetId } },
      create: { reviewerId, targetKind, targetId, rating, comment },
      update: { rating, comment },
    });
  }

  private async assertTarget(kind: ReviewTargetKind, targetId: string) {
    if (kind === 'USER') {
      const user = await this.prisma.user.findUnique({ where: { id: targetId } });
      if (!user) throw new BadRequestException('User not found');
      return;
    }
    if (kind === 'PG') {
      const pg = await this.prisma.pgListing.findUnique({ where: { id: targetId } });
      if (!pg) throw new BadRequestException('PG not found');
      return;
    }
    if (kind === 'FLAT') {
      const flat = await this.prisma.flatListing.findUnique({ where: { id: targetId } });
      if (!flat) throw new BadRequestException('Flat not found');
      return;
    }
    if (kind === 'ROOM') {
      const room = await this.prisma.room.findUnique({ where: { id: targetId } });
      if (!room) throw new BadRequestException('Room not found');
    }
  }
}
