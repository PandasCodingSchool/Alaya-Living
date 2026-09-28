import { BadRequestException, Injectable } from '@nestjs/common';
import { BookmarkKind, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FlatsService } from '../flats/flats.service';
import { toPublicPg } from '../pgs/pgs.service';
import { toPublicRoom } from '../rooms/rooms.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

const roomInclude = {
  amenities: true,
  accommodation: {
    include: {
      owner: { include: userInclude },
    },
  },
} as const;

const pgInclude = {
  owner: { include: userInclude },
  sharingOptions: true,
  beds: { orderBy: [{ sortOrder: 'asc' as const }, { roomLabel: 'asc' as const }, { bedLabel: 'asc' as const }] },
};

@Injectable()
export class BookmarksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly flats: FlatsService,
  ) {}

  ids(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      select: { kind: true, targetId: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(userId: string) {
    const rows = await this.ids(userId);
    const personIds = rows.filter((row) => row.kind === BookmarkKind.PERSON).map((row) => row.targetId);
    const roomIds = rows.filter((row) => row.kind === BookmarkKind.ROOM).map((row) => row.targetId);
    const pgIds = rows.filter((row) => row.kind === BookmarkKind.PG).map((row) => row.targetId);
    const flatIds = rows.filter((row) => row.kind === BookmarkKind.FLAT).map((row) => row.targetId);

    const [people, rooms, pgRows, flatRows] = await Promise.all([
      personIds.length
        ? this.prisma.user.findMany({ where: { id: { in: personIds } }, include: userInclude })
        : Promise.resolve([]),
      roomIds.length
        ? this.prisma.room.findMany({ where: { id: { in: roomIds } }, include: roomInclude })
        : Promise.resolve([]),
      pgIds.length
        ? this.prisma.pgListing.findMany({ where: { id: { in: pgIds } }, include: pgInclude })
        : Promise.resolve([]),
      flatIds.length ? Promise.all(flatIds.map((id) => this.flats.get(id).catch(() => null))) : Promise.resolve([]),
    ]);

    const peopleById = new Map(people.map((person) => [person.id, toPublicProfile(person)]));
    const roomsById = new Map(rooms.map((room) => [room.id, toPublicRoom(room)]));
    const pgsById = new Map(pgRows.map((pg) => [pg.id, toPublicPg(pg)]));

    return {
      people: personIds.map((id) => peopleById.get(id)).filter(Boolean),
      rooms: roomIds.map((id) => roomsById.get(id)).filter(Boolean),
      pgs: pgIds.map((id) => pgsById.get(id)).filter(Boolean),
      flats: flatRows.filter(Boolean),
    };
  }

  async toggle(user: User, kind: BookmarkKind, targetId: string) {
    if (kind === BookmarkKind.PERSON) {
      if (targetId === user.id) throw new BadRequestException('You cannot save yourself');
      const exists = await this.prisma.user.findUnique({ where: { id: targetId }, select: { id: true } });
      if (!exists) throw new BadRequestException('Person not found');
    } else if (kind === BookmarkKind.ROOM) {
      const room = await this.prisma.room.findUnique({
        where: { id: targetId },
        include: { accommodation: true },
      });
      if (!room) throw new BadRequestException('Room not found');
      if (room.accommodation.ownerUserId === user.id) throw new BadRequestException('You cannot save your own listing');
    } else if (kind === BookmarkKind.PG) {
      const pg = await this.prisma.pgListing.findUnique({ where: { id: targetId } });
      if (!pg) throw new BadRequestException('PG not found');
    } else if (kind === BookmarkKind.FLAT) {
      await this.flats.get(targetId);
    }

    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_kind_targetId: { userId: user.id, kind, targetId } },
    });
    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { saved: false };
    }
    await this.prisma.bookmark.create({ data: { userId: user.id, kind, targetId } });
    return { saved: true };
  }

  async check(userId: string, kind: BookmarkKind, targetId: string) {
    const row = await this.prisma.bookmark.findUnique({
      where: { userId_kind_targetId: { userId, kind, targetId } },
    });
    return { saved: !!row };
  }
}
