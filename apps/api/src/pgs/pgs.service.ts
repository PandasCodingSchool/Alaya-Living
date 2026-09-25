import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PgGenderPolicy, PropertyType, SharingPermission, User } from '@prisma/client';
import { coordsForLocality } from '../lib/geo';
import { publicMediaUrl } from '../lib/media-url';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

export function toPublicPg(pg: {
  id: string;
  title: string;
  locality: string;
  city: string;
  propertyType: string;
  monthlyRent: number;
  deposit: number | null;
  genderPolicy: string;
  mealsIncluded: boolean;
  sharingPermission: string;
  bedsAvailable: number;
  totalBeds: number;
  photos: string[];
  amenities: string[];
  notes: string | null;
  availableFrom: Date;
  exactAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  owner: Parameters<typeof toPublicProfile>[0];
}) {
  return {
    id: pg.id,
    title: pg.title,
    locality: pg.locality,
    city: pg.city,
    propertyType: pg.propertyType,
    monthlyRent: pg.monthlyRent,
    deposit: pg.deposit,
    genderPolicy: pg.genderPolicy,
    mealsIncluded: pg.mealsIncluded,
    sharingPermission: pg.sharingPermission,
    bedsAvailable: pg.bedsAvailable,
    totalBeds: pg.totalBeds,
    photos: pg.photos.map((photo) => publicMediaUrl(photo) || photo),
    amenities: pg.amenities,
    notes: pg.notes,
    availableFrom: pg.availableFrom.toISOString(),
    exactAddress: null as string | null,
    latitude: pg.latitude,
    longitude: pg.longitude,
    status: pg.status,
    owner: toPublicProfile(pg.owner),
  };
}

@Injectable()
export class PgsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly users: UsersService,
  ) {}

  async list(query: { locality?: string; minBudget?: number; maxBudget?: number; gender?: PgGenderPolicy }) {
    const rows = await this.prisma.pgListing.findMany({
      where: {
        status: 'ACTIVE',
        bedsAvailable: { gt: 0 },
        locality: query.locality || undefined,
        genderPolicy: query.gender && query.gender !== 'ANY' ? query.gender : undefined,
        monthlyRent: {
          gte: query.minBudget,
          lte: query.maxBudget,
        },
      },
      include: { owner: { include: userInclude } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => toPublicPg(row));
  }

  async mine(userId: string) {
    const rows = await this.prisma.pgListing.findMany({
      where: { ownerUserId: userId },
      include: { owner: { include: userInclude } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => toPublicPg(row));
  }

  async dashboard(userId: string) {
    const [listings, inquiries, inquiryCount] = await Promise.all([
      this.prisma.pgListing.findMany({
        where: { ownerUserId: userId },
        include: { owner: { include: userInclude } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.interest.findMany({
        where: { toUserId: userId },
        include: { fromUser: { include: userInclude } },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      this.prisma.interest.count({ where: { toUserId: userId } }),
    ]);

    const publicListings = listings.map((row) => toPublicPg(row));
    const activeListings = listings.filter((row) => row.status === 'ACTIVE' && row.bedsAvailable > 0);

    return {
      summary: {
        listings: listings.length,
        activeListings: activeListings.length,
        totalBeds: listings.reduce((sum, row) => sum + row.totalBeds, 0),
        openBeds: listings.reduce((sum, row) => sum + row.bedsAvailable, 0),
        inquiries: inquiryCount,
      },
      listings: publicListings,
      inquiries: inquiries.map((row) => ({
        id: row.id,
        createdAt: row.createdAt.toISOString(),
        user: toPublicProfile(row.fromUser),
      })),
    };
  }

  async get(id: string) {
    const row = await this.prisma.pgListing.findUnique({
      where: { id },
      include: { owner: { include: userInclude } },
    });
    if (!row) throw new NotFoundException('PG not found');
    return toPublicPg(row);
  }

  async create(
    user: User,
    dto: {
      title: string;
      locality: string;
      propertyType?: PropertyType;
      monthlyRent: number;
      deposit?: number;
      genderPolicy?: PgGenderPolicy;
      mealsIncluded?: boolean;
      sharingPermission?: SharingPermission;
      bedsAvailable?: number;
      totalBeds?: number;
      amenities?: string[];
      notes?: string;
      availableFrom: string;
      exactAddress?: string;
    },
  ) {
    const pin = coordsForLocality(dto.locality);
    const bedsAvailable = dto.bedsAvailable ?? 1;
    const row = await this.prisma.pgListing.create({
      data: {
        ownerUserId: user.id,
        title: dto.title,
        locality: dto.locality,
        propertyType: dto.propertyType || 'PG',
        monthlyRent: dto.monthlyRent,
        deposit: dto.deposit,
        genderPolicy: dto.genderPolicy || 'ANY',
        mealsIncluded: dto.mealsIncluded ?? false,
        sharingPermission: dto.sharingPermission || 'YES',
        bedsAvailable,
        totalBeds: dto.totalBeds ?? 4,
        amenities: dto.amenities || [],
        notes: dto.notes,
        availableFrom: new Date(dto.availableFrom),
        exactAddress: dto.exactAddress,
        latitude: pin?.lat,
        longitude: pin?.lng,
        status: this.statusForBeds(bedsAvailable),
      },
      include: { owner: { include: userInclude } },
    });
    await this.users.ensurePgOwner(user.id);
    return toPublicPg(row);
  }

  async update(user: User, id: string, dto: Parameters<PgsService['create']>[1]) {
    const row = await this.prisma.pgListing.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('PG not found');
    if (row.ownerUserId !== user.id) throw new ForbiddenException();
    const pin = coordsForLocality(dto.locality);
    const bedsAvailable = dto.bedsAvailable ?? row.bedsAvailable;
    const updated = await this.prisma.pgListing.update({
      where: { id },
      data: {
        title: dto.title,
        locality: dto.locality,
        propertyType: dto.propertyType || row.propertyType,
        monthlyRent: dto.monthlyRent,
        deposit: dto.deposit,
        genderPolicy: dto.genderPolicy || row.genderPolicy,
        mealsIncluded: dto.mealsIncluded ?? row.mealsIncluded,
        sharingPermission: dto.sharingPermission || row.sharingPermission,
        bedsAvailable,
        totalBeds: dto.totalBeds ?? row.totalBeds,
        amenities: dto.amenities || row.amenities,
        notes: dto.notes,
        availableFrom: new Date(dto.availableFrom),
        exactAddress: dto.exactAddress,
        latitude: pin?.lat,
        longitude: pin?.lng,
        status: this.statusForBeds(bedsAvailable),
      },
      include: { owner: { include: userInclude } },
    });
    return toPublicPg(updated);
  }

  async quickUpdate(user: User, id: string, dto: { monthlyRent?: number; bedsAvailable?: number }) {
    const row = await this.prisma.pgListing.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('PG not found');
    if (row.ownerUserId !== user.id) throw new ForbiddenException();

    const bedsAvailable = dto.bedsAvailable ?? row.bedsAvailable;
    const updated = await this.prisma.pgListing.update({
      where: { id },
      data: {
        monthlyRent: dto.monthlyRent ?? row.monthlyRent,
        bedsAvailable,
        status: this.statusForBeds(bedsAvailable),
      },
      include: { owner: { include: userInclude } },
    });
    return toPublicPg(updated);
  }

  private statusForBeds(bedsAvailable: number) {
    return bedsAvailable <= 0 ? 'CLOSED' : 'ACTIVE';
  }

  async close(user: User, id: string) {
    const row = await this.prisma.pgListing.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('PG not found');
    if (row.ownerUserId !== user.id) throw new ForbiddenException();
    await this.prisma.pgListing.update({ where: { id }, data: { status: 'CLOSED' } });
    return { ok: true };
  }

  async addPhoto(user: User, id: string, file: Express.Multer.File) {
    const row = await this.prisma.pgListing.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('PG not found');
    if (row.ownerUserId !== user.id) throw new ForbiddenException();
    const url = await this.storage.upload(file, 'rooms');
    const updated = await this.prisma.pgListing.update({
      where: { id },
      data: { photos: [...row.photos, url] },
      include: { owner: { include: userInclude } },
    });
    return toPublicPg(updated);
  }
}
