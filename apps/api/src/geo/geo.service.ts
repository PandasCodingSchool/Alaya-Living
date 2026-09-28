import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { type GeoPoint } from '../lib/geo';
import { PrismaService } from '../prisma/prisma.service';

type LocationTable = 'Accommodation' | 'PgListing' | 'FlatListing';

@Injectable()
export class GeoService implements OnModuleInit {
  private readonly logger = new Logger(GeoService.name);
  private postgis = false;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.postgis = await this.detectPostgis();
    if (!this.postgis) {
      this.logger.warn('PostGIS unavailable — radius queries fall back to haversine on lat/lng');
    }
  }

  hasPostgis() {
    return this.postgis;
  }

  async syncLocation(table: LocationTable, id: string, lat: number | null, lng: number | null) {
    if (!this.postgis || !(await this.hasLocationColumn(table))) return;
    if (lat == null || lng == null) {
      await this.prisma.$executeRawUnsafe(`UPDATE "${table}" SET location = NULL WHERE id = $1`, id);
      return;
    }
    await this.prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
      lng,
      lat,
      id,
    );
  }

  async accommodationIdsWithinRadius(from: GeoPoint, radiusKm: number): Promise<string[] | null> {
    if (!this.postgis || !(await this.hasLocationColumn('Accommodation'))) return null;
    const rows = await this.prisma.$queryRawUnsafe<{ id: string }[]>(
      `
      SELECT a.id
      FROM "Accommodation" a
      WHERE a.status = 'ACTIVE'
        AND a.location IS NOT NULL
        AND ST_DWithin(
          a.location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      `,
      from.lng,
      from.lat,
      radiusKm * 1000,
    );
    return rows.map((row) => row.id);
  }

  private async detectPostgis() {
    try {
      const rows = await this.prisma.$queryRaw<{ ext: string }[]>`
        SELECT extname AS ext FROM pg_extension WHERE extname = 'postgis' LIMIT 1
      `;
      return rows.length > 0;
    } catch {
      return false;
    }
  }

  private async hasLocationColumn(table: LocationTable) {
    try {
      const rows = await this.prisma.$queryRaw<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = ${table} AND column_name = 'location'
        ) AS exists
      `;
      return Boolean(rows[0]?.exists);
    } catch {
      return false;
    }
  }
}
