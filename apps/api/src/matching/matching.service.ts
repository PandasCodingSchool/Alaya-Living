import { Injectable } from '@nestjs/common';
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
    gender: user.profile?.gender ?? null,
    preferredGenders: user.preferences?.preferredGenders ?? [],
  };
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async people(viewerId: string) {
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
    return candidates
      .filter((c) => passesHardFilters(viewerM, toMatchable(c)))
      .map((c) => {
        const compatibility = scorePeople(viewerM, toMatchable(c));
        return { ...toPublicProfile(c), compatibility };
      })
      .sort((a, b) => b.compatibility.score - a.compatibility.score);
  }

  async rooms(viewerId: string) {
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
      .map(({ room, matchableRoom }) => ({
        ...toPublicRoom(room),
        compatibility: scoreRoom(viewerM, matchableRoom),
      }))
      .sort((a, b) => b.compatibility.score - a.compatibility.score);
  }

  async personWithScore(viewerId: string, otherId: string) {
    const [viewer, other] = await Promise.all([this.requireUser(viewerId), this.requireUser(otherId)]);
    return {
      ...toPublicProfile(other),
      compatibility: scorePeople(toMatchable(viewer), toMatchable(other)),
    };
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
