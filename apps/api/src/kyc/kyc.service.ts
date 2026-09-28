import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User, VerificationKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  mine(userId: string) {
    return this.prisma.verification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submit(
    user: User,
    data: {
      kind: VerificationKind;
      notes?: string;
      documentRef?: string;
      pgListingId?: string;
      flatListingId?: string;
    },
  ) {
    if (data.kind === 'PROPERTY') {
      if (!data.pgListingId && !data.flatListingId) {
        throw new BadRequestException('Property verification requires a listing id');
      }
      if (data.pgListingId) {
        const pg = await this.prisma.pgListing.findUnique({ where: { id: data.pgListingId } });
        if (!pg || pg.ownerUserId !== user.id) throw new ForbiddenException('Not your PG listing');
      }
      if (data.flatListingId) {
        const flat = await this.prisma.flatListing.findUnique({ where: { id: data.flatListingId } });
        if (!flat || flat.listedById !== user.id) throw new ForbiddenException('Not your flat listing');
      }
    }

    const pending = await this.prisma.verification.findFirst({
      where: {
        userId: user.id,
        kind: data.kind,
        status: 'PENDING',
        pgListingId: data.pgListingId ?? null,
        flatListingId: data.flatListingId ?? null,
      },
    });
    if (pending) return pending;

    return this.prisma.verification.create({
      data: {
        userId: user.id,
        kind: data.kind,
        notes: data.notes,
        documentRef: data.documentRef || `stub-${Date.now()}`,
        pgListingId: data.pgListingId,
        flatListingId: data.flatListingId,
      },
    });
  }

  listPending() {
    return this.prisma.verification.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { include: { profile: true } },
        pgListing: { select: { id: true, title: true, locality: true } },
        flatListing: { select: { id: true, title: true, locality: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async review(id: string, approve: boolean, adminNotes?: string) {
    const row = await this.prisma.verification.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Verification not found');
    if (row.status !== 'PENDING') throw new BadRequestException('Already reviewed');
    return this.prisma.verification.update({
      where: { id },
      data: {
        status: approve ? 'APPROVED' : 'REJECTED',
        adminNotes,
        reviewedAt: new Date(),
      },
    });
  }
}
