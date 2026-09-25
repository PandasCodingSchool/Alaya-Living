import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { MatchingService } from '../matching/matching.service';
import { PrismaService } from '../prisma/prisma.service';
import { publicMediaUrl } from '../lib/media-url';
import { toPublicProfile, userInclude } from '../users/user.mapper';

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matching: MatchingService,
  ) {}

  async list(userId: string) {
    const rows = await this.prisma.flatGroup.findMany({
      where: { members: { some: { userId, status: { in: ['JOINED', 'INVITED'] } } } },
      include: { members: { include: { user: { include: userInclude } } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toPublic(row, userId));
  }

  async get(userId: string, id: string) {
    const row = await this.requireGroup(id);
    const member = row.members.find((item) => item.userId === userId && item.status !== 'LEFT');
    if (!member) throw new ForbiddenException('You are not in this group');

    const people = await this.matching.people(userId, { radiusKm: 15, origin: 'home' });
    const memberIds = new Set(row.members.filter((item) => item.status !== 'LEFT').map((item) => item.userId));
    const suggestedPeople = people.filter((person) => !memberIds.has(person.id)).slice(0, 8);

    const pgs = await this.prisma.pgListing.findMany({
      where: {
        status: 'ACTIVE',
        bedsAvailable: { gt: 0 },
        locality: row.localities.length ? { in: row.localities } : undefined,
        monthlyRent: { lte: Math.round(row.targetRentEach * 1.15) },
      },
      include: { owner: { include: userInclude } },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...this.toPublic(row, userId),
      suggestedPeople,
      suggestedPgs: pgs.map((pg) => this.toPg(pg)),
    };
  }

  async create(
    user: User,
    dto: { title: string; targetSize: number; targetRentEach: number; localities: string[]; moveInDate?: string; notes?: string },
  ) {
    if (dto.targetSize < 2 || dto.targetSize > 6) throw new BadRequestException('A group needs 2–6 people');
    const row = await this.prisma.flatGroup.create({
      data: {
        createdById: user.id,
        title: dto.title,
        targetSize: dto.targetSize,
        targetRentEach: dto.targetRentEach,
        localities: dto.localities,
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : undefined,
        notes: dto.notes,
        members: {
          create: { userId: user.id, role: 'OWNER', status: 'JOINED' },
        },
      },
    });
    return this.get(user.id, row.id);
  }

  async invite(user: User, id: string, targetId: string) {
    const row = await this.requireGroup(id);
    this.assertMember(row, user.id);
    if (targetId === user.id) throw new BadRequestException('You are already in the group');
    const exists = row.members.find((item) => item.userId === targetId && item.status !== 'LEFT');
    if (exists) throw new BadRequestException('That person is already invited');
    const joined = row.members.filter((item) => item.status === 'JOINED').length;
    if (joined >= row.targetSize) throw new BadRequestException('This group is already full');

    await this.prisma.flatGroupMember.create({
      data: { groupId: id, userId: targetId, role: 'MEMBER', status: 'INVITED' },
    });
    return this.get(user.id, id);
  }

  async accept(user: User, id: string) {
    const row = await this.requireGroup(id);
    const invite = row.members.find((item) => item.userId === user.id && item.status === 'INVITED');
    if (!invite) throw new BadRequestException('No pending invite');
    const joined = row.members.filter((item) => item.status === 'JOINED').length;
    if (joined >= row.targetSize) throw new BadRequestException('This group is already full');

    await this.prisma.flatGroupMember.update({ where: { id: invite.id }, data: { status: 'JOINED' } });
    await this.refreshStatus(id);
    return this.get(user.id, id);
  }

  async decline(user: User, id: string) {
    const row = await this.requireGroup(id);
    const invite = row.members.find((item) => item.userId === user.id && item.status === 'INVITED');
    if (!invite) throw new BadRequestException('No pending invite');
    await this.prisma.flatGroupMember.update({ where: { id: invite.id }, data: { status: 'LEFT' } });
    return this.list(user.id);
  }

  async leave(user: User, id: string) {
    const row = await this.requireGroup(id);
    const member = row.members.find((item) => item.userId === user.id && item.status === 'JOINED');
    if (!member) throw new BadRequestException('You are not in this group');
    if (member.role === 'OWNER') throw new BadRequestException('The owner cannot leave. Close the group instead.');
    await this.prisma.flatGroupMember.update({ where: { id: member.id }, data: { status: 'LEFT' } });
    await this.refreshStatus(id);
    return this.list(user.id);
  }

  async close(user: User, id: string) {
    const row = await this.requireGroup(id);
    if (row.createdById !== user.id) throw new ForbiddenException();
    await this.prisma.flatGroup.update({ where: { id }, data: { status: 'CLOSED' } });
    return this.get(user.id, id);
  }

  async searchPgs(user: User, id: string) {
    const detail = await this.get(user.id, id);
    await this.prisma.flatGroup.update({ where: { id }, data: { status: 'SEARCHING' } });
    return detail;
  }

  private async requireGroup(id: string) {
    const row = await this.prisma.flatGroup.findUnique({
      where: { id },
      include: { members: { include: { user: { include: userInclude } } } },
    });
    if (!row) throw new NotFoundException('Group not found');
    return row;
  }

  private assertMember(row: { members: { userId: string; status: string }[] }, userId: string) {
    const member = row.members.find((item) => item.userId === userId && item.status === 'JOINED');
    if (!member) throw new ForbiddenException('Only joined members can do that');
  }

  private async refreshStatus(id: string) {
    const row = await this.prisma.flatGroup.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!row || row.status === 'CLOSED') return;
    const joined = row.members.filter((item) => item.status === 'JOINED').length;
    const status = joined >= row.targetSize ? 'COMPLETE' : row.status === 'SEARCHING' ? 'SEARCHING' : 'FORMING';
    await this.prisma.flatGroup.update({ where: { id }, data: { status } });
  }

  private toPublic(
    row: {
      id: string;
      createdById: string;
      title: string;
      targetSize: number;
      targetRentEach: number;
      localities: string[];
      moveInDate: Date | null;
      notes: string | null;
      status: string;
      createdAt: Date;
      members: { userId: string; role: string; status: string; user: Parameters<typeof toPublicProfile>[0] }[];
    },
    viewerId: string,
  ) {
    const active = row.members.filter((item) => item.status !== 'LEFT');
    const joined = active.filter((item) => item.status === 'JOINED');
    const mine = active.find((item) => item.userId === viewerId);
    return {
      id: row.id,
      title: row.title,
      targetSize: row.targetSize,
      targetRentEach: row.targetRentEach,
      combinedBudget: joined.length * row.targetRentEach,
      localities: row.localities,
      moveInDate: row.moveInDate?.toISOString() ?? null,
      notes: row.notes,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      isOwner: row.createdById === viewerId,
      myStatus: mine?.status ?? null,
      members: active.map((item) => ({
        role: item.role,
        status: item.status,
        user: toPublicProfile(item.user),
      })),
    };
  }

  private toPg(pg: {
    id: string;
    title: string;
    locality: string;
    city: string;
    monthlyRent: number;
    deposit: number | null;
    genderPolicy: string;
    mealsIncluded: boolean;
    bedsAvailable: number;
    totalBeds: number;
    photos: string[];
    amenities: string[];
    availableFrom: Date;
    owner: Parameters<typeof toPublicProfile>[0];
  }) {
    return {
      id: pg.id,
      title: pg.title,
      locality: pg.locality,
      city: pg.city,
      monthlyRent: pg.monthlyRent,
      deposit: pg.deposit,
      genderPolicy: pg.genderPolicy,
      mealsIncluded: pg.mealsIncluded,
      bedsAvailable: pg.bedsAvailable,
      totalBeds: pg.totalBeds,
      photos: pg.photos.map((photo) => publicMediaUrl(photo) || photo),
      amenities: pg.amenities,
      availableFrom: pg.availableFrom.toISOString(),
      owner: toPublicProfile(pg.owner),
    };
  }
}
