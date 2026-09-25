import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

@Injectable()
export class AgreementsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const rows = await this.prisma.agreement.findMany({
      where: { OR: [{ createdById: userId }, { counterpartyId: userId }] },
      include: {
        createdBy: { include: userInclude },
        counterparty: { include: userInclude },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toPublic(row, userId));
  }

  async get(userId: string, id: string) {
    const row = await this.prisma.agreement.findUnique({
      where: { id },
      include: {
        createdBy: { include: userInclude },
        counterparty: { include: userInclude },
      },
    });
    if (!row) throw new NotFoundException('Agreement not found');
    if (row.createdById !== userId && row.counterpartyId !== userId) throw new ForbiddenException();
    return this.toPublic(row, userId);
  }

  async create(
    user: User,
    dto: {
      matchId: string;
      roomId?: string;
      rentEach?: number;
      electricity?: string;
      internet?: string;
      cleaning?: string;
      groceries?: string;
      guests?: string;
      quietHours?: string;
      notes?: string;
    },
  ) {
    const match = await this.prisma.match.findUnique({ where: { id: dto.matchId } });
    if (!match) throw new NotFoundException('Match not found');
    if (match.userAId !== user.id && match.userBId !== user.id) throw new ForbiddenException();

    const existing = await this.prisma.agreement.findUnique({ where: { matchId: dto.matchId } });
    if (existing) return this.get(user.id, existing.id);

    const otherId = match.userAId === user.id ? match.userBId : match.userAId;
    let rentEach = dto.rentEach;
    if (rentEach == null && dto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: dto.roomId },
        include: { accommodation: true },
      });
      rentEach = room?.accommodation.roommateContribution;
    }
    if (rentEach == null) {
      const prefs = await this.prisma.preference.findMany({
        where: { userId: { in: [user.id, otherId] } },
      });
      const budgets = prefs.flatMap((p) => [p.minBudget, p.maxBudget]).filter((n): n is number => n != null);
      rentEach = budgets.length ? Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length) : 10000;
    }

    const creator = await this.prisma.user.findUnique({ where: { id: user.id }, include: { preferences: true } });
    const quietHours =
      dto.quietHours ||
      (creator?.preferences?.sleepStart != null
        ? `${this.hour(creator.preferences.sleepStart)}–${this.hour(creator.preferences.sleepEnd ?? 7)}`
        : '11 PM–7 AM');

    const row = await this.prisma.agreement.create({
      data: {
        matchId: dto.matchId,
        roomId: dto.roomId,
        createdById: user.id,
        counterpartyId: otherId,
        rentEach,
        electricity: dto.electricity || '50/50',
        internet: dto.internet || '50/50',
        cleaning: dto.cleaning || 'Alternate weekly',
        groceries: dto.groceries || 'Separate',
        guests: dto.guests || 'Notify beforehand',
        quietHours,
        notes: dto.notes,
      },
    });
    return this.get(user.id, row.id);
  }

  async update(
    user: User,
    id: string,
    dto: Partial<{
      rentEach: number;
      electricity: string;
      internet: string;
      cleaning: string;
      groceries: string;
      guests: string;
      quietHours: string;
      notes: string;
    }>,
  ) {
    const row = await this.prisma.agreement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Agreement not found');
    if (row.createdById !== user.id && row.counterpartyId !== user.id) throw new ForbiddenException();
    if (row.status === 'CONFIRMED') throw new BadRequestException('A confirmed agreement cannot be edited');
    if (row.status === 'CANCELLED') throw new BadRequestException('This agreement was cancelled');

    await this.prisma.agreement.update({
      where: { id },
      data: {
        ...dto,
        otherConfirmed: row.createdById === user.id ? false : row.otherConfirmed,
        creatorConfirmed: row.createdById === user.id ? true : false,
        status: 'PENDING',
      },
    });
    return this.get(user.id, id);
  }

  async confirm(user: User, id: string) {
    const row = await this.prisma.agreement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Agreement not found');
    if (row.createdById !== user.id && row.counterpartyId !== user.id) throw new ForbiddenException();
    if (row.status === 'CANCELLED') throw new BadRequestException('This agreement was cancelled');

    const creatorConfirmed = row.createdById === user.id ? true : row.creatorConfirmed;
    const otherConfirmed = row.counterpartyId === user.id ? true : row.otherConfirmed;
    const both = creatorConfirmed && otherConfirmed;

    await this.prisma.agreement.update({
      where: { id },
      data: {
        creatorConfirmed,
        otherConfirmed,
        status: both ? 'CONFIRMED' : 'PENDING',
        confirmedAt: both ? new Date() : null,
      },
    });
    return this.get(user.id, id);
  }

  async cancel(user: User, id: string) {
    const row = await this.prisma.agreement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Agreement not found');
    if (row.createdById !== user.id && row.counterpartyId !== user.id) throw new ForbiddenException();
    await this.prisma.agreement.update({ where: { id }, data: { status: 'CANCELLED' } });
    return this.get(user.id, id);
  }

  private hour(value: number) {
    const hour = ((value % 24) + 24) % 24;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const twelve = hour % 12 || 12;
    return `${twelve} ${suffix}`;
  }

  private toPublic(
    row: {
      id: string;
      matchId: string;
      roomId: string | null;
      createdById: string;
      counterpartyId: string;
      status: string;
      rentEach: number;
      electricity: string;
      internet: string;
      cleaning: string;
      groceries: string;
      guests: string;
      quietHours: string;
      notes: string | null;
      creatorConfirmed: boolean;
      otherConfirmed: boolean;
      confirmedAt: Date | null;
      createdAt: Date;
      createdBy: Parameters<typeof toPublicProfile>[0];
      counterparty: Parameters<typeof toPublicProfile>[0];
    },
    viewerId: string,
  ) {
    const other = row.createdById === viewerId ? row.counterparty : row.createdBy;
    return {
      id: row.id,
      matchId: row.matchId,
      roomId: row.roomId,
      status: row.status,
      rentEach: row.rentEach,
      electricity: row.electricity,
      internet: row.internet,
      cleaning: row.cleaning,
      groceries: row.groceries,
      guests: row.guests,
      quietHours: row.quietHours,
      notes: row.notes,
      creatorConfirmed: row.creatorConfirmed,
      otherConfirmed: row.otherConfirmed,
      confirmedAt: row.confirmedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      mine: row.createdById === viewerId,
      waitingOnMe:
        row.status === 'PENDING' &&
        ((row.createdById === viewerId && !row.creatorConfirmed) ||
          (row.counterpartyId === viewerId && !row.otherConfirmed)),
      other: toPublicProfile(other),
    };
  }
}
