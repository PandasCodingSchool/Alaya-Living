import { Injectable, Logger } from '@nestjs/common';
import { SavedSearchKind } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { listingMatchesSavedSearch } from './listing-filter-match';

@Injectable()
export class SavedSearchAlertsService {
  private readonly logger = new Logger(SavedSearchAlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async notifyRoomCreated(room: {
    id: string;
    locality: string;
    roommateContribution: number;
    roomType: string;
    notes?: string | null;
    ownerUserId: string;
  }) {
    await this.notifyListing('ROOMS', {
      id: room.id,
      locality: room.locality,
      roommateContribution: room.roommateContribution,
      roomType: room.roomType,
      notes: room.notes,
      ownerUserId: room.ownerUserId,
      link: `/rooms/${room.id}`,
      label: `New room in ${room.locality}`,
    });
  }

  async notifyPgCreated(pg: {
    id: string;
    title: string;
    locality: string;
    monthlyRent: number;
    genderPolicy: string;
    notes?: string | null;
    ownerUserId: string;
  }) {
    await this.notifyListing('PGS', {
      id: pg.id,
      title: pg.title,
      locality: pg.locality,
      monthlyRent: pg.monthlyRent,
      genderPolicy: pg.genderPolicy,
      notes: pg.notes,
      ownerUserId: pg.ownerUserId,
      link: `/pgs/${pg.id}`,
      label: pg.title,
    });
  }

  async notifyFlatCreated(flat: {
    id: string;
    title: string;
    locality: string;
    monthlyRent: number;
    bhk: string;
    notes?: string | null;
    listedById: string | null;
  }) {
    if (!flat.listedById) return;
    await this.notifyListing('FLATS', {
      id: flat.id,
      title: flat.title,
      locality: flat.locality,
      monthlyRent: flat.monthlyRent,
      bhk: flat.bhk,
      notes: flat.notes,
      ownerUserId: flat.listedById,
      link: `/flats/${flat.id}`,
      label: flat.title,
    });
  }

  private async notifyListing(
    kind: SavedSearchKind,
    listing: Record<string, unknown> & {
      id: string;
      ownerUserId: string;
      link: string;
      label: string;
    },
  ) {
    try {
      const searches = await this.prisma.savedSearch.findMany({ where: { kind } });
      for (const search of searches) {
        if (search.userId === listing.ownerUserId) continue;
        const filters = search.filters as Record<string, unknown>;
        if (!listingMatchesSavedSearch(kind, filters, listing)) continue;
        await this.notifications.create(search.userId, {
          type: 'SAVED_SEARCH_MATCH',
          title: 'Saved search match',
          body: `${listing.label} matches “${search.name}”.`,
          link: listing.link,
        });
      }
    } catch (err) {
      this.logger.warn(`Saved search alert failed: ${err instanceof Error ? err.message : err}`);
    }
  }
}
