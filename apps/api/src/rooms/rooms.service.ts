import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicMediaUrl } from '../lib/media-url';
import { StorageService } from '../storage/storage.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';
import { CreateRoomDto, SearchRoomsDto, UpdateRoomDto } from './dto';

const roomInclude = {
  amenities: true,
  accommodation: {
    include: {
      owner: { include: userInclude },
    },
  },
} as const;

export function toPublicRoom(room: {
  id: string;
  roomType: string;
  capacity: number;
  currentOccupants: number;
  availableSlots: number;
  furnished: boolean;
  photos: string[];
  notes: string | null;
  amenities: { name: string }[];
  accommodation: {
    locality: string;
    city: string;
    propertyType: string;
    monthlyRent: number;
    roommateContribution: number;
    deposit: number | null;
    availableFrom: Date;
    sharingPermission: string;
    owner: Parameters<typeof toPublicProfile>[0];
  };
}) {
  return {
    id: room.id,
    locality: room.accommodation.locality,
    city: room.accommodation.city,
    propertyType: room.accommodation.propertyType,
    roomType: room.roomType,
    monthlyRent: room.accommodation.monthlyRent,
    roommateContribution: room.accommodation.roommateContribution,
    deposit: room.accommodation.deposit,
    availableFrom: room.accommodation.availableFrom.toISOString(),
    amenities: room.amenities.map((a) => a.name),
    sharingPermission: room.accommodation.sharingPermission,
    photos: room.photos.map((photo) => publicMediaUrl(photo) || photo),
    currentOccupants: room.currentOccupants,
    availableSlots: room.availableSlots,
    capacity: room.capacity,
    furnished: room.furnished,
    notes: room.notes,
    owner: toPublicProfile(room.accommodation.owner),
  };
}

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(user: User, dto: CreateRoomDto) {
    const existing = await this.prisma.room.findFirst({
      where: { accommodation: { ownerUserId: user.id } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('You can list only one room. Edit your existing listing instead.');
    }

    const accommodation = await this.prisma.accommodation.create({
      data: {
        ownerUserId: user.id,
        propertyType: dto.propertyType,
        locality: dto.locality,
        exactAddress: dto.exactAddress,
        monthlyRent: dto.monthlyRent,
        roommateContribution: dto.roommateContribution,
        deposit: dto.deposit,
        availableFrom: new Date(dto.availableFrom),
        sharingPermission: dto.sharingPermission,
        rooms: {
          create: {
            roomType: dto.roomType,
            capacity: dto.capacity ?? 2,
            currentOccupants: dto.currentOccupants ?? 1,
            availableSlots: dto.availableSlots ?? 1,
            furnished: dto.furnished ?? true,
            notes: dto.notes,
            amenities: dto.amenities?.length
              ? { create: dto.amenities.map((name) => ({ name })) }
              : undefined,
          },
        },
      },
      include: { rooms: { include: roomInclude } },
    });
    return toPublicRoom(accommodation.rooms[0] as never);
  }

  async mine(user: User) {
    const rooms = await this.prisma.room.findMany({
      where: { accommodation: { ownerUserId: user.id } },
      include: roomInclude,
      orderBy: { accommodation: { createdAt: 'desc' } },
    });
    return rooms.map((r) => toPublicRoom(r));
  }

  async get(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id }, include: roomInclude });
    if (!room) throw new NotFoundException('Room not found');
    return toPublicRoom(room);
  }

  async update(user: User, id: string, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { accommodation: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    if (room.accommodation.ownerUserId !== user.id) throw new ForbiddenException();

    await this.prisma.accommodation.update({
      where: { id: room.accommodationId },
      data: {
        propertyType: dto.propertyType,
        locality: dto.locality,
        exactAddress: dto.exactAddress,
        monthlyRent: dto.monthlyRent,
        roommateContribution: dto.roommateContribution,
        deposit: dto.deposit,
        availableFrom: new Date(dto.availableFrom),
        sharingPermission: dto.sharingPermission,
      },
    });
    await this.prisma.room.update({
      where: { id },
      data: {
        roomType: dto.roomType,
        capacity: dto.capacity,
        currentOccupants: dto.currentOccupants,
        availableSlots: dto.availableSlots,
        furnished: dto.furnished,
        notes: dto.notes,
      },
    });
    if (dto.amenities) {
      await this.prisma.roomAmenity.deleteMany({ where: { roomId: id } });
      if (dto.amenities.length) {
        await this.prisma.roomAmenity.createMany({
          data: dto.amenities.map((name) => ({ roomId: id, name })),
        });
      }
    }
    return this.get(id);
  }

  async close(user: User, id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { accommodation: true },
    });
    if (!room) throw new NotFoundException();
    if (room.accommodation.ownerUserId !== user.id) throw new ForbiddenException();
    await this.prisma.accommodation.update({
      where: { id: room.accommodationId },
      data: { status: 'CLOSED' },
    });
    return { ok: true };
  }

  async addPhoto(user: User, id: string, file: Express.Multer.File) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { accommodation: true },
    });
    if (!room) throw new NotFoundException();
    if (room.accommodation.ownerUserId !== user.id) throw new ForbiddenException();
    const url = await this.storage.upload(file, 'rooms');
    await this.prisma.room.update({
      where: { id },
      data: { photos: { push: url } },
    });
    return this.get(id);
  }

  async search(query: SearchRoomsDto) {
    const rooms = await this.prisma.room.findMany({
      where: {
        accommodation: {
          status: 'ACTIVE',
          sharingPermission: { not: 'NO' },
          ...(query.locality ? { locality: query.locality } : {}),
          ...(query.minBudget != null || query.maxBudget != null
            ? {
                roommateContribution: {
                  ...(query.minBudget != null ? { gte: query.minBudget } : {}),
                  ...(query.maxBudget != null ? { lte: query.maxBudget } : {}),
                },
              }
            : {}),
        },
        ...(query.roomType ? { roomType: query.roomType } : {}),
        amenities: query.amenity ? { some: { name: query.amenity } } : undefined,
      },
      include: roomInclude,
    });
    return rooms.map((r) => toPublicRoom(r));
  }
}
