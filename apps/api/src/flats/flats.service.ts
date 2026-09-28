import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FlatBhk, User } from '@prisma/client';
import { GeoService } from '../geo/geo.service';
import { resolveCoordinates } from '../lib/geocode';
import { coordsForLocality } from '../lib/geo';
import { publicMediaUrl } from '../lib/media-url';
import { PrismaService } from '../prisma/prisma.service';
import { SavedSearchAlertsService } from '../saved-searches/saved-search-alerts.service';
import { StorageService } from '../storage/storage.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';
import { CreateFlatDto, UpdateFlatDto } from './dto';

const flatInclude = {
  listedBy: { include: userInclude },
  verifications: { where: { status: 'APPROVED', kind: 'PROPERTY' }, take: 1, select: { id: true } },
} as const;

@Injectable()
export class FlatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly geo: GeoService,
    private readonly savedSearchAlerts: SavedSearchAlertsService,
  ) {}

  async list(query: { locality?: string; bhk?: FlatBhk; maxRent?: number; minRent?: number }) {
    const rows = await this.prisma.flatListing.findMany({
      where: {
        status: 'ACTIVE',
        locality: query.locality || undefined,
        bhk: query.bhk,
        monthlyRent: {
          gte: query.minRent,
          lte: query.maxRent,
        },
      },
      include: flatInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toPublic(row));
  }

  async mine(user: User) {
    const rows = await this.prisma.flatListing.findMany({
      where: { listedById: user.id },
      include: flatInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toPublic(row));
  }

  async get(id: string) {
    const row = await this.prisma.flatListing.findUnique({
      where: { id },
      include: flatInclude,
    });
    if (!row) throw new NotFoundException('Flat not found');
    return this.toPublic(row);
  }

  async create(user: User, dto: CreateFlatDto) {
    const city = dto.city || 'Bengaluru';
    const pin = await resolveCoordinates({
      exactAddress: dto.exactAddress,
      locality: dto.locality,
      city,
    });
    const row = await this.prisma.flatListing.create({
      data: {
        title: dto.title,
        locality: dto.locality,
        city,
        bhk: dto.bhk,
        monthlyRent: dto.monthlyRent,
        deposit: dto.deposit,
        furnished: dto.furnished ?? false,
        amenities: dto.amenities,
        notes: dto.notes,
        availableFrom: new Date(dto.availableFrom),
        exactAddress: dto.exactAddress,
        listedById: user.id,
        latitude: pin?.lat,
        longitude: pin?.lng,
      },
      include: flatInclude,
    });
    await this.geo.syncLocation('FlatListing', row.id, pin?.lat ?? null, pin?.lng ?? null);
    void this.savedSearchAlerts.notifyFlatCreated({
      id: row.id,
      title: row.title,
      locality: row.locality,
      monthlyRent: row.monthlyRent,
      bhk: row.bhk,
      notes: row.notes,
      listedById: row.listedById,
    });
    return this.toPublic(row);
  }

  async update(user: User, id: string, dto: UpdateFlatDto) {
    const row = await this.requireOwner(user, id);
    const pin = await resolveCoordinates({
      exactAddress: dto.exactAddress ?? row.exactAddress,
      locality: dto.locality ?? row.locality,
      city: row.city,
    });
    const updated = await this.prisma.flatListing.update({
      where: { id: row.id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.locality ? { locality: dto.locality } : {}),
        ...(dto.exactAddress !== undefined ? { exactAddress: dto.exactAddress } : {}),
        ...(pin ? { latitude: pin.lat, longitude: pin.lng } : {}),
        ...(dto.bhk ? { bhk: dto.bhk } : {}),
        ...(dto.monthlyRent != null ? { monthlyRent: dto.monthlyRent } : {}),
        ...(dto.deposit != null ? { deposit: dto.deposit } : {}),
        ...(dto.furnished != null ? { furnished: dto.furnished } : {}),
        ...(dto.amenities ? { amenities: dto.amenities } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.availableFrom ? { availableFrom: new Date(dto.availableFrom) } : {}),
      },
      include: flatInclude,
    });
    await this.geo.syncLocation('FlatListing', updated.id, updated.latitude, updated.longitude);
    return this.toPublic(updated);
  }

  async close(user: User, id: string) {
    const row = await this.requireOwner(user, id);
    await this.prisma.flatListing.update({ where: { id: row.id }, data: { status: 'CLOSED' } });
    return { ok: true };
  }

  async addPhoto(user: User, id: string, file: Express.Multer.File) {
    const row = await this.requireOwner(user, id);
    const url = await this.storage.upload(file, 'flats');
    const updated = await this.prisma.flatListing.update({
      where: { id: row.id },
      data: { photos: { push: url } },
      include: flatInclude,
    });
    return this.toPublic(updated);
  }

  async forGroup(localities: string[], combinedBudget: number, targetSize: number) {
    const bhk = targetSize <= 2 ? 'TWO_BHK' : 'THREE_BHK';
    const rows = await this.prisma.flatListing.findMany({
      where: {
        status: 'ACTIVE',
        bhk,
        monthlyRent: { lte: Math.round(combinedBudget * 1.05) },
        locality: localities.length ? { in: localities } : undefined,
      },
      include: flatInclude,
      take: 8,
      orderBy: { monthlyRent: 'asc' },
    });
    return rows.map((row) => this.toPublic(row));
  }

  private async requireOwner(user: User, id: string) {
    const row = await this.prisma.flatListing.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Flat not found');
    if (row.listedById !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Not your listing');
    }
    return row;
  }

  private toPublic(row: {
    id: string;
    title: string;
    locality: string;
    city: string;
    bhk: FlatBhk;
    monthlyRent: number;
    deposit: number | null;
    furnished: boolean;
    photos: string[];
    amenities: string[];
    notes: string | null;
    availableFrom: Date;
    latitude: number | null;
    longitude: number | null;
    status: string;
    listedBy: Parameters<typeof toPublicProfile>[0] | null;
    verifications?: { id: string }[];
  }) {
    const pin = row.latitude == null ? coordsForLocality(row.locality) : null;
    return {
      id: row.id,
      title: row.title,
      locality: row.locality,
      city: row.city,
      bhk: row.bhk,
      monthlyRent: row.monthlyRent,
      deposit: row.deposit,
      furnished: row.furnished,
      photos: row.photos.map((photo) => publicMediaUrl(photo) || photo),
      amenities: row.amenities,
      notes: row.notes,
      availableFrom: row.availableFrom.toISOString(),
      latitude: row.latitude ?? pin?.lat ?? null,
      longitude: row.longitude ?? pin?.lng ?? null,
      status: row.status,
      propertyVerified: (row.verifications?.length ?? 0) > 0,
      listedBy: row.listedBy ? toPublicProfile(row.listedBy) : null,
    };
  }
}
