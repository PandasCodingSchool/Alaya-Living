import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PgBedStatus, PgGenderPolicy, PgSharingType, Prisma, PropertyType, SharingPermission, User, UserRole } from '@prisma/client';
import { coordsForLocality } from '../lib/geo';
import { publicMediaUrl } from '../lib/media-url';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

const SHARING_ORDER: PgSharingType[] = ['SINGLE', 'DOUBLE', 'TRIPLE'];
const BEDS_PER_ROOM: Record<PgSharingType, number> = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3 };

export type SharingOptionInput = {
  sharingType: PgSharingType;
  monthlyRent: number;
  bedsAvailable: number;
  totalBeds: number;
};

export type BedInput = {
  roomLabel: string;
  bedLabel: string;
  sharingType: PgSharingType;
  monthlyRent: number;
  status: PgBedStatus;
};

const pgInclude = {
  owner: { include: userInclude },
  sharingOptions: true,
  beds: { orderBy: [{ sortOrder: 'asc' }, { roomLabel: 'asc' }, { bedLabel: 'asc' }] },
} satisfies Prisma.PgListingInclude;

type PgWithOwner = Prisma.PgListingGetPayload<{ include: typeof pgInclude }>;

export function toPublicPg(pg: PgWithOwner) {
  const sharingOptions = [...pg.sharingOptions].sort(
    (a, b) => SHARING_ORDER.indexOf(a.sharingType) - SHARING_ORDER.indexOf(b.sharingType),
  );
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
    sharingOptions: sharingOptions ?? [],
    beds: (pg.beds ?? []).map((bed) => ({
      id: bed.id,
      roomLabel: bed.roomLabel,
      bedLabel: bed.bedLabel,
      sharingType: bed.sharingType,
      monthlyRent: bed.monthlyRent,
      status: bed.status,
    })),
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
      include: pgInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => toPublicPg(row));
  }

  async mine(userId: string) {
    const rows = await this.prisma.pgListing.findMany({
      where: { ownerUserId: userId },
      include: pgInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => toPublicPg(row));
  }

  async dashboard(userId: string) {
    const [listings, inquiries, inquiryCount] = await Promise.all([
      this.prisma.pgListing.findMany({
        where: { ownerUserId: userId },
        include: pgInclude,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.interest.findMany({
        where: { toUserId: userId },
        include: {
          fromUser: { include: userInclude },
          pgListing: { select: { id: true, title: true, locality: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      this.prisma.interest.count({ where: { toUserId: userId } }),
    ]);

    const publicListings = listings.map((row) => toPublicPg(row));
    const activeListings = listings.filter((row) => row.status === 'ACTIVE' && row.bedsAvailable > 0);

    const inquiryRows = await Promise.all(
      inquiries.map(async (row) => {
        const [userAId, userBId] = [row.fromUserId, userId].sort();
        const match = await this.prisma.match.findUnique({
          where: { userAId_userBId: { userAId, userBId } },
          include: { conversation: true },
        });
        return {
          id: row.id,
          createdAt: row.createdAt.toISOString(),
          user: toPublicProfile(row.fromUser),
          pgListing: row.pgListing
            ? { id: row.pgListing.id, title: row.pgListing.title, locality: row.pgListing.locality }
            : null,
          matched: !!match,
          conversationId: match?.conversation?.id ?? null,
        };
      }),
    );

    return {
      summary: {
        listings: listings.length,
        activeListings: activeListings.length,
        totalBeds: listings.reduce((sum, row) => sum + row.totalBeds, 0),
        openBeds: listings.reduce((sum, row) => sum + row.bedsAvailable, 0),
        inquiries: inquiryCount,
      },
      listings: publicListings,
      inquiries: inquiryRows,
    };
  }

  async get(viewer: User, id: string) {
    const row = await this.prisma.pgListing.findUnique({
      where: { id },
      include: pgInclude,
    });
    if (!row) throw new NotFoundException('PG not found');
    if (viewer.role === UserRole.PG_OWNER && row.ownerUserId !== viewer.id) {
      throw new ForbiddenException('PG operators can only view their own listings');
    }
    return toPublicPg(row);
  }

  async create(
    user: User,
    dto: {
      title: string;
      locality: string;
      propertyType?: PropertyType;
      monthlyRent?: number;
      deposit?: number;
      genderPolicy?: PgGenderPolicy;
      mealsIncluded?: boolean;
      sharingPermission?: SharingPermission;
      bedsAvailable?: number;
      totalBeds?: number;
      sharingOptions?: SharingOptionInput[];
      beds?: BedInput[];
      amenities?: string[];
      notes?: string;
      availableFrom: string;
      exactAddress?: string;
    },
  ) {
    const inventory = this.resolveInventory(dto);
    const pin = coordsForLocality(dto.locality);
    const row = await this.prisma.pgListing.create({
      data: {
        ownerUserId: user.id,
        title: dto.title,
        locality: dto.locality,
        propertyType: dto.propertyType || 'PG',
        monthlyRent: inventory.aggregates.monthlyRent,
        deposit: dto.deposit,
        genderPolicy: dto.genderPolicy || 'ANY',
        mealsIncluded: dto.mealsIncluded ?? false,
        sharingPermission: dto.sharingPermission || 'YES',
        bedsAvailable: inventory.aggregates.bedsAvailable,
        totalBeds: inventory.aggregates.totalBeds,
        amenities: dto.amenities || [],
        notes: dto.notes,
        availableFrom: new Date(dto.availableFrom),
        exactAddress: dto.exactAddress,
        latitude: pin?.lat,
        longitude: pin?.lng,
        status: this.statusForBeds(inventory.aggregates.bedsAvailable),
        beds: { create: inventory.beds },
        sharingOptions: { create: inventory.tiers },
      },
      include: pgInclude,
    });
    await this.users.ensurePgOwner(user.id);
    return toPublicPg(row);
  }

  async update(user: User, id: string, dto: Parameters<PgsService['create']>[1]) {
    const row = await this.prisma.pgListing.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('PG not found');
    if (row.ownerUserId !== user.id) throw new ForbiddenException();
    const inventory = this.resolveInventory(dto);
    const pin = coordsForLocality(dto.locality);
    await this.prisma.pgBed.deleteMany({ where: { pgListingId: id } });
    await this.prisma.pgSharingOption.deleteMany({ where: { pgListingId: id } });
    const updated = await this.prisma.pgListing.update({
      where: { id },
      data: {
        title: dto.title,
        locality: dto.locality,
        propertyType: dto.propertyType || row.propertyType,
        monthlyRent: inventory.aggregates.monthlyRent,
        deposit: dto.deposit,
        genderPolicy: dto.genderPolicy || row.genderPolicy,
        mealsIncluded: dto.mealsIncluded ?? row.mealsIncluded,
        sharingPermission: dto.sharingPermission || row.sharingPermission,
        bedsAvailable: inventory.aggregates.bedsAvailable,
        totalBeds: inventory.aggregates.totalBeds,
        amenities: dto.amenities || row.amenities,
        notes: dto.notes,
        availableFrom: new Date(dto.availableFrom),
        exactAddress: dto.exactAddress,
        latitude: pin?.lat,
        longitude: pin?.lng,
        status: this.statusForBeds(inventory.aggregates.bedsAvailable),
        beds: { create: inventory.beds },
        sharingOptions: { create: inventory.tiers },
      },
      include: pgInclude,
    });
    return toPublicPg(updated);
  }

  async quickUpdate(user: User, id: string, dto: { sharingOptions?: SharingOptionInput[]; beds?: BedInput[] }) {
    const row = await this.prisma.pgListing.findUnique({
      where: { id },
      include: { sharingOptions: true, beds: true },
    });
    if (!row) throw new NotFoundException('PG not found');
    if (row.ownerUserId !== user.id) throw new ForbiddenException();
    if (!dto.beds?.length && !dto.sharingOptions?.length) {
      throw new BadRequestException('beds or sharingOptions required');
    }

    const inventory = dto.beds?.length
      ? this.resolveInventory({ beds: dto.beds })
      : this.resolveInventory({ sharingOptions: dto.sharingOptions });

    await this.prisma.pgBed.deleteMany({ where: { pgListingId: id } });
    await this.prisma.pgSharingOption.deleteMany({ where: { pgListingId: id } });
    const updated = await this.prisma.pgListing.update({
      where: { id },
      data: {
        monthlyRent: inventory.aggregates.monthlyRent,
        bedsAvailable: inventory.aggregates.bedsAvailable,
        totalBeds: inventory.aggregates.totalBeds,
        status: this.statusForBeds(inventory.aggregates.bedsAvailable),
        beds: { create: inventory.beds },
        sharingOptions: { create: inventory.tiers },
      },
      include: pgInclude,
    });
    return toPublicPg(updated);
  }

  private resolveInventory(dto: {
    beds?: BedInput[];
    sharingOptions?: SharingOptionInput[];
    monthlyRent?: number;
    bedsAvailable?: number;
    totalBeds?: number;
  }) {
    if (dto.beds?.length) {
      const beds = this.normalizeBeds(dto.beds);
      return { beds, tiers: this.tiersFromBeds(beds), aggregates: this.aggregatesFromBeds(beds) };
    }
    const tiers = this.normalizeTiers(dto);
    const beds = this.bedsFromTiers(tiers);
    return { beds, tiers, aggregates: this.aggregatesFromBeds(beds) };
  }

  private normalizeBeds(beds: BedInput[]): Array<BedInput & { sortOrder: number }> {
    const normalized = beds
      .map((bed, index) => ({
        roomLabel: bed.roomLabel.trim(),
        bedLabel: bed.bedLabel.trim().toUpperCase(),
        sharingType: bed.sharingType,
        monthlyRent: bed.monthlyRent,
        status: bed.status,
        sortOrder: index,
      }))
      .filter((bed) => bed.roomLabel && bed.bedLabel);
    if (!normalized.length) throw new BadRequestException('At least one bed is required');
    const keys = new Set<string>();
    for (const bed of normalized) {
      const key = `${bed.roomLabel}::${bed.bedLabel}`;
      if (keys.has(key)) throw new BadRequestException(`Duplicate bed: ${bed.roomLabel} · Bed ${bed.bedLabel}`);
      keys.add(key);
    }
    return normalized;
  }

  private tiersFromBeds(beds: Pick<BedInput, 'sharingType' | 'monthlyRent' | 'status'>[]) {
    return SHARING_ORDER.map((sharingType) => {
      const rows = beds.filter((bed) => bed.sharingType === sharingType);
      if (!rows.length) return null;
      const available = rows.filter((bed) => bed.status === 'AVAILABLE');
      const monthlyRent = available.length
        ? Math.min(...available.map((bed) => bed.monthlyRent))
        : Math.min(...rows.map((bed) => bed.monthlyRent));
      return {
        sharingType,
        monthlyRent,
        bedsAvailable: available.length,
        totalBeds: rows.length,
      };
    }).filter((tier): tier is SharingOptionInput => tier !== null);
  }

  private aggregatesFromBeds(beds: { monthlyRent: number; status: PgBedStatus }[]) {
    const available = beds.filter((bed) => bed.status === 'AVAILABLE');
    const monthlyRent = available.length
      ? Math.min(...available.map((bed) => bed.monthlyRent))
      : Math.min(...beds.map((bed) => bed.monthlyRent));
    return {
      monthlyRent,
      bedsAvailable: available.length,
      totalBeds: beds.length,
    };
  }

  private bedsFromTiers(tiers: SharingOptionInput[]) {
    const prefix: Record<PgSharingType, string> = { SINGLE: 'Single', DOUBLE: 'Double', TRIPLE: 'Triple' };
    const beds: Array<BedInput & { sortOrder: number }> = [];
    for (const tier of tiers) {
      if (tier.totalBeds <= 0) continue;
      const cap = BEDS_PER_ROOM[tier.sharingType];
      for (let i = 0; i < tier.totalBeds; i++) {
        const roomIndex = Math.floor(i / cap) + 1;
        const bedInRoom = i % cap;
        beds.push({
          roomLabel: `${prefix[tier.sharingType]} · Room ${roomIndex}`,
          bedLabel: String.fromCharCode(65 + bedInRoom),
          sharingType: tier.sharingType,
          monthlyRent: tier.monthlyRent,
          status: i < tier.bedsAvailable ? 'AVAILABLE' : 'OCCUPIED',
          sortOrder: beds.length,
        });
      }
    }
    return beds;
  }

  private normalizeTiers(dto: {
    sharingOptions?: SharingOptionInput[];
    monthlyRent?: number;
    bedsAvailable?: number;
    totalBeds?: number;
  }) {
    if (dto.sharingOptions?.length) {
      const tiers = dto.sharingOptions.filter((tier) => tier.totalBeds > 0);
      if (!tiers.length) throw new BadRequestException('At least one sharing type is required');
      return tiers;
    }
    if (dto.monthlyRent == null) throw new BadRequestException('beds, sharingOptions, or monthlyRent is required');
    return [
      {
        sharingType: 'SINGLE' as PgSharingType,
        monthlyRent: dto.monthlyRent,
        bedsAvailable: dto.bedsAvailable ?? 1,
        totalBeds: dto.totalBeds ?? 4,
      },
    ];
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
      include: pgInclude,
    });
    return toPublicPg(updated);
  }
}
