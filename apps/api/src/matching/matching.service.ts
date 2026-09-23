import { Injectable } from '@nestjs/common';
import {
  DEFAULT_RADIUS_KM,
  coordsForLocality,
  coordsForOffice,
  distanceKm,
  distanceLabel,
  originCoords,
  type GeoOrigin,
  withinRadius,
} from '../lib/geo';
import { officeProximity } from '../lib/offices';
import {
  MatchablePerson,
  passesHardFilters,
  passesRoomHardFilters,
  scorePeople,
  scoreRoom,
} from '../lib/matching';
import { Preference, Profile, User, UserLanguage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicRoom } from '../rooms/rooms.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

type FullUser = User & {
  profile: Profile | null;
  preferences: Preference | null;
  languages: UserLanguage[];
};

function toMatchable(user: FullUser): MatchablePerson {
  return {
    localities: user.preferences?.localities ?? [],
    minBudget: user.preferences?.minBudget ?? null,
    maxBudget: user.preferences?.maxBudget ?? null,
    moveInDate: user.preferences?.moveInDate ?? null,
    sleepStart: user.preferences?.sleepStart ?? null,
    sleepEnd: user.preferences?.sleepEnd ?? null,
    cleanliness: user.preferences?.cleanliness ?? null,
    noiseTolerance: user.preferences?.noiseTolerance ?? null,
    cookingFrequency: user.preferences?.cookingFrequency ?? null,
    guestFrequency: user.preferences?.guestFrequency ?? null,
    foodPreference: user.preferences?.foodPreference ?? null,
    smokingPreference: user.preferences?.smokingPreference ?? null,
    smokingRequired: user.preferences?.smokingRequired ?? false,
    languages: user.languages.map((l) => l.language),
    languageMatters: user.preferences?.languageMatters ?? false,
    workMode: user.profile?.workMode ?? null,
    workLocation: user.profile?.workLocation ?? null,
    gender: user.profile?.gender ?? null,
    preferredGenders: user.preferences?.preferredGenders ?? [],
  };
}

export interface GeoQuery {
  radiusKm?: number;
  origin?: GeoOrigin;
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async people(viewerId: string, query: GeoQuery = {}) {
    const viewer = await this.requireUser(viewerId);
    const blocked = await this.blockedIds(viewerId);
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { notIn: [viewerId, ...blocked] },
        status: 'ACTIVE',
        profile: { onboardingDone: true },
      },
      include: userInclude,
    });

    const viewerM = toMatchable(viewer);
    const { radiusKm, origin, from } = this.geoContext(viewer, query);
    return candidates
      .filter((c) => passesHardFilters(viewerM, toMatchable(c)))
      .map((c) => {
        const km = distanceKm(
          from,
          coordsForOffice(c.profile?.workLocation) || coordsForLocality(c.preferences?.localities[0]),
        );
        return {
          ...toPublicProfile(c),
          compatibility: scorePeople(viewerM, toMatchable(c)),
          distanceKm: km,
          distanceLabel: distanceLabel(km, origin),
        };
      })
      .filter((row) => withinRadius(row.distanceKm, radiusKm))
      .sort((a, b) => {
        const near = (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
        if (near !== 0) return near;
        const office = officeProximity(viewerM.workLocation, b.workLocation) - officeProximity(viewerM.workLocation, a.workLocation);
        if (office !== 0) return office;
        return b.compatibility.score - a.compatibility.score;
      });
  }

  async rooms(viewerId: string, query: GeoQuery = {}) {
    const viewer = await this.requireUser(viewerId);
    const blocked = await this.blockedIds(viewerId);
    const rooms = await this.prisma.room.findMany({
      where: {
        accommodation: {
          status: 'ACTIVE',
          ownerUserId: { notIn: [viewerId, ...blocked] },
        },
      },
      include: {
        amenities: true,
        accommodation: { include: { owner: { include: userInclude } } },
      },
    });

    const viewerM = toMatchable(viewer);
    const { radiusKm, origin, from } = this.geoContext(viewer, query);
    return rooms
      .map((room) => {
        const owner = toMatchable(room.accommodation.owner);
        const matchableRoom = {
          locality: room.accommodation.locality,
          roommateContribution: room.accommodation.roommateContribution,
          availableFrom: room.accommodation.availableFrom,
          availableSlots: room.availableSlots,
          sharingPermission: room.accommodation.sharingPermission,
          owner,
        };
        return { room, matchableRoom };
      })
      .filter(({ matchableRoom }) => passesRoomHardFilters(viewerM, matchableRoom))
      .map(({ room, matchableRoom }) => {
        const pin =
          room.accommodation.latitude != null && room.accommodation.longitude != null
            ? { lat: room.accommodation.latitude, lng: room.accommodation.longitude }
            : coordsForLocality(room.accommodation.locality);
        const km = distanceKm(from, pin);
        return {
          ...toPublicRoom(room),
          compatibility: scoreRoom(viewerM, matchableRoom),
          distanceKm: km,
          distanceLabel: distanceLabel(km, origin),
        };
      })
      .filter((row) => withinRadius(row.distanceKm, radiusKm))
      .sort((a, b) => {
        const near = (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
        if (near !== 0) return near;
        const office =
          officeProximity(viewerM.workLocation, b.owner.workLocation) -
          officeProximity(viewerM.workLocation, a.owner.workLocation);
        if (office !== 0) return office;
        return b.compatibility.score - a.compatibility.score;
      });
  }

  async personWithScore(viewerId: string, otherId: string) {
    const [viewer, other] = await Promise.all([this.requireUser(viewerId), this.requireUser(otherId)]);
    return {
      ...toPublicProfile(other),
      compatibility: scorePeople(toMatchable(viewer), toMatchable(other)),
    };
  }

  private geoContext(viewer: FullUser, query: GeoQuery) {
    const origin: GeoOrigin = query.origin === 'home' ? 'home' : 'office';
    const radiusKm = query.radiusKm ?? viewer.preferences?.preferredRadiusKm ?? DEFAULT_RADIUS_KM;
    const from = originCoords({
      workLocation: viewer.profile?.workLocation,
      localities: viewer.preferences?.localities ?? [],
      origin,
    });
    return { radiusKm, origin, from };
  }

  private async requireUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: userInclude });
    if (!user) throw new Error('User not found');
    return user;
  }

  private async blockedIds(userId: string) {
    const rows = await this.prisma.block.findMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    });
    return rows.map((b) => (b.fromUserId === userId ? b.toUserId : b.fromUserId));
  }
}
