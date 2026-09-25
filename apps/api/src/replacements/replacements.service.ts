import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { MatchingService } from '../matching/matching.service';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicRoom } from '../rooms/rooms.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

const roomInclude = {
  amenities: true,
  accommodation: { include: { owner: { include: userInclude } } },
} as const;

@Injectable()
export class ReplacementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matching: MatchingService,
  ) {}

  async list(userId: string) {
    const rows = await this.prisma.replacement.findMany({
      where: { OR: [{ createdById: userId }, { status: 'OPEN' }] },
      include: { room: { include: roomInclude }, createdBy: { include: userInclude } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toPublic(row, userId));
  }

  async get(userId: string, id: string) {
    const row = await this.prisma.replacement.findUnique({
      where: { id },
      include: { room: { include: roomInclude }, createdBy: { include: userInclude } },
    });
    if (!row) throw new NotFoundException('Replacement not found');
    const people = await this.matching.people(userId, { radiusKm: 10, origin: 'home' });
    const locality = row.room.accommodation.locality;
    const rent = row.room.accommodation.roommateContribution;
    const candidates = people.filter((person) => {
      if (person.id === row.createdById) return false;
      const inArea = person.localities.includes(locality);
      const budgetOk =
        (!person.minBudget || person.minBudget <= rent) && (!person.maxBudget || person.maxBudget >= rent);
      return inArea || budgetOk;
    });
    return { ...this.toPublic(row, userId), candidates: candidates.slice(0, 12) };
  }

  async create(user: User, dto: { roomId: string; departingName: string; leaveDate: string; notes?: string }) {
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
      include: { accommodation: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    if (room.accommodation.ownerUserId !== user.id) throw new ForbiddenException('Only the occupant can ask for a replacement');

    const row = await this.prisma.replacement.create({
      data: {
        roomId: dto.roomId,
        createdById: user.id,
        departingName: dto.departingName,
        leaveDate: new Date(dto.leaveDate),
        notes: dto.notes,
      },
    });
    return this.get(user.id, row.id);
  }

  async close(user: User, id: string, status: 'FILLED' | 'CLOSED') {
    const row = await this.prisma.replacement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Replacement not found');
    if (row.createdById !== user.id) throw new ForbiddenException();
    await this.prisma.replacement.update({ where: { id }, data: { status } });
    return this.get(user.id, id);
  }

  private toPublic(
    row: {
      id: string;
      roomId: string;
      createdById: string;
      departingName: string;
      leaveDate: Date;
      notes: string | null;
      status: string;
      createdAt: Date;
      room: Parameters<typeof toPublicRoom>[0];
      createdBy: Parameters<typeof toPublicProfile>[0];
    },
    viewerId: string,
  ) {
    return {
      id: row.id,
      roomId: row.roomId,
      departingName: row.departingName,
      leaveDate: row.leaveDate.toISOString(),
      notes: row.notes,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      mine: row.createdById === viewerId,
      room: toPublicRoom(row.room),
      createdBy: toPublicProfile(row.createdBy),
    };
  }
}
