import { Injectable, NotFoundException } from '@nestjs/common';
import { FlatBhk } from '@prisma/client';
import { coordsForLocality } from '../lib/geo';
import { publicMediaUrl } from '../lib/media-url';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

const flatInclude = {
  listedBy: { include: userInclude },
} as const;

@Injectable()
export class FlatsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async get(id: string) {
    const row = await this.prisma.flatListing.findUnique({
      where: { id },
      include: flatInclude,
    });
    if (!row) throw new NotFoundException('Flat not found');
    return this.toPublic(row);
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
      listedBy: row.listedBy ? toPublicProfile(row.listedBy) : null,
    };
  }
}
