import { BadRequestException, Injectable } from '@nestjs/common';
import { ReportStatus, ReportTargetKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

@Injectable()
export class SafetyService {
  constructor(private readonly prisma: PrismaService) {}

  async block(fromUserId: string, toUserId: string) {
    await this.prisma.block.upsert({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
      update: {},
      create: { fromUserId, toUserId },
    });
    return { ok: true };
  }

  async list(userId: string) {
    const blocks = await this.prisma.block.findMany({
      where: { fromUserId: userId },
      include: { toUser: { include: userInclude } },
    });
    return blocks.map((b) => ({ id: b.id, user: toPublicProfile(b.toUser), createdAt: b.createdAt }));
  }

  async report(
    reporterId: string,
    dto: { targetKind: ReportTargetKind; targetId: string; reason: string; details?: string },
  ) {
    if (!dto.reason.trim()) throw new BadRequestException('Reason is required');
    await this.assertTarget(dto.targetKind, dto.targetId);
    const row = await this.prisma.report.create({
      data: {
        reporterId,
        targetKind: dto.targetKind,
        targetId: dto.targetId,
        reason: dto.reason.trim(),
        details: dto.details?.trim() || null,
      },
    });
    return { id: row.id, ok: true };
  }

  async listReports(status?: ReportStatus) {
    const rows = await this.prisma.report.findMany({
      where: status ? { status } : undefined,
      include: { reporter: { include: userInclude } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((row) => ({
      id: row.id,
      targetKind: row.targetKind,
      targetId: row.targetId,
      reason: row.reason,
      details: row.details,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      reporter: toPublicProfile(row.reporter),
    }));
  }

  private async assertTarget(kind: ReportTargetKind, targetId: string) {
    if (kind === 'USER') {
      const user = await this.prisma.user.findUnique({ where: { id: targetId } });
      if (!user) throw new BadRequestException('User not found');
      return;
    }
    if (kind === 'ROOM') {
      const room = await this.prisma.room.findUnique({ where: { id: targetId } });
      if (!room) throw new BadRequestException('Room not found');
      return;
    }
    if (kind === 'PG') {
      const pg = await this.prisma.pgListing.findUnique({ where: { id: targetId } });
      if (!pg) throw new BadRequestException('PG listing not found');
      return;
    }
    const flat = await this.prisma.flatListing.findUnique({ where: { id: targetId } });
    if (!flat) throw new BadRequestException('Flat listing not found');
  }
}
