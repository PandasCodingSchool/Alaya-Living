import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrivacyService {
  constructor(private readonly prisma: PrismaService) {}

  async canRevealAddress(viewerId: string, ownerId: string) {
    if (viewerId === ownerId) return true;
    const [userAId, userBId] = viewerId < ownerId ? [viewerId, ownerId] : [ownerId, viewerId];
    const match = await this.prisma.match.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });
    return !!match;
  }

  async revealRoomAddress(viewerId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { accommodation: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    const allowed = await this.canRevealAddress(viewerId, room.accommodation.ownerUserId);
    if (!allowed) {
      return { allowed: false, reason: 'NOT_MATCHED' as const, exactAddress: null, latitude: null, longitude: null };
    }
    return {
      allowed: true,
      reason: null,
      exactAddress: room.accommodation.exactAddress,
      latitude: room.accommodation.latitude,
      longitude: room.accommodation.longitude,
    };
  }

  async revealPgAddress(viewerId: string, pgId: string) {
    const pg = await this.prisma.pgListing.findUnique({ where: { id: pgId } });
    if (!pg) throw new NotFoundException('PG not found');
    const allowed = await this.canRevealAddress(viewerId, pg.ownerUserId);
    if (!allowed) {
      return { allowed: false, reason: 'NOT_MATCHED' as const, exactAddress: null, latitude: null, longitude: null };
    }
    return {
      allowed: true,
      reason: null,
      exactAddress: pg.exactAddress,
      latitude: pg.latitude,
      longitude: pg.longitude,
    };
  }

  async revealFlatAddress(viewerId: string, flatId: string) {
    const flat = await this.prisma.flatListing.findUnique({ where: { id: flatId } });
    if (!flat) throw new NotFoundException('Flat not found');
    if (!flat.listedById) {
      throw new ForbiddenException('Listing has no owner');
    }
    const allowed = await this.canRevealAddress(viewerId, flat.listedById);
    if (!allowed) {
      return { allowed: false, reason: 'NOT_MATCHED' as const, exactAddress: null, latitude: null, longitude: null };
    }
    return {
      allowed: true,
      reason: null,
      exactAddress: flat.exactAddress,
      latitude: flat.latitude,
      longitude: flat.longitude,
    };
  }
}
