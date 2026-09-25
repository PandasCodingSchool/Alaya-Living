import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ReportStatus,
  ReportTargetKind,
  SubscriptionSource,
  SubscriptionStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { MembershipService } from '../membership/membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function groupByDay<T>(items: T[], getDate: (item: T) => Date, getValue: (item: T) => number = () => 1) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = getDate(item).toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + getValue(item));
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

function fillTrend(days: number, points: { date: string; value: number }[]) {
  const map = new Map(points.map((p) => [p.date, p.value]));
  const result: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, value: map.get(key) ?? 0 });
  }
  return result;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membership: MembershipService,
  ) {}

  async dashboard() {
    const now = new Date();
    const weekStart = daysAgo(7);
    const monthStart = startOfMonth();
    const todayStart = startOfToday();
    const trendStart = daysAgo(30);

    const [
      pendingReports,
      users,
      activeUsers,
      suspendedUsers,
      pgOwners,
      activePgs,
      activeFlats,
      openRooms,
      premiumSubscribers,
      revenueToday,
      revenueMonth,
      revenueTotal,
      newUsersWeek,
      recentUsers,
      recentSubs,
    ] = await Promise.all([
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.count({ where: { role: 'PG_OWNER' } }),
      this.prisma.pgListing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.flatListing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.accommodation.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE', expiresAt: { gt: now } },
      }),
      this.prisma.subscription.aggregate({
        _sum: { amountPaise: true },
        where: { createdAt: { gte: todayStart }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.subscription.aggregate({
        _sum: { amountPaise: true },
        where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.subscription.aggregate({
        _sum: { amountPaise: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      this.prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: trendStart } },
        select: { createdAt: true },
      }),
      this.prisma.subscription.findMany({
        where: { createdAt: { gte: trendStart }, status: { not: 'CANCELLED' } },
        select: { createdAt: true, amountPaise: true },
      }),
    ]);

    const userSignups = fillTrend(30, groupByDay(recentUsers, (u) => u.createdAt));
    const subscriptionTrend = fillTrend(30, groupByDay(recentSubs, (s) => s.createdAt));
    const revenueTrend = fillTrend(
      30,
      groupByDay(recentSubs, (s) => s.createdAt, (s) => s.amountPaise),
    );

    return {
      pendingReports,
      users,
      activeUsers,
      suspendedUsers,
      pgOwners,
      activePgs,
      activeFlats,
      openRooms,
      premiumSubscribers,
      revenueTodayPaise: revenueToday._sum.amountPaise ?? 0,
      revenueMonthPaise: revenueMonth._sum.amountPaise ?? 0,
      revenueTotalPaise: revenueTotal._sum.amountPaise ?? 0,
      newUsersWeek,
      trends: {
        userSignups,
        subscriptions: subscriptionTrend,
        revenuePaise: revenueTrend,
      },
    };
  }

  async listUsers(filters: {
    role?: UserRole;
    status?: UserStatus;
    premium?: string;
    period?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 50));
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;
    if (filters.period === 'week') where.createdAt = { gte: daysAgo(7) };
    if (filters.q?.trim()) {
      where.OR = [
        { email: { contains: filters.q.trim(), mode: 'insensitive' } },
        { phone: { contains: filters.q.trim() } },
        { profile: { firstName: { contains: filters.q.trim(), mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const userIds = rows.map((u) => u.id);
    const activeSubs = await this.prisma.subscription.findMany({
      where: { userId: { in: userIds }, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      include: { plan: true },
      orderBy: { expiresAt: 'desc' },
    });
    const subByUser = new Map(activeSubs.map((s) => [s.userId, s]));

    let items = rows.map((row) => ({
      id: row.id,
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      profile: toPublicProfile(row),
      isPremium: subByUser.has(row.id),
      subscription: subByUser.get(row.id)
        ? {
            id: subByUser.get(row.id)!.id,
            planName: subByUser.get(row.id)!.plan?.name ?? 'Premium',
            expiresAt: subByUser.get(row.id)!.expiresAt.toISOString(),
            source: subByUser.get(row.id)!.source,
          }
        : null,
    }));

    if (filters.premium === 'true') items = items.filter((i) => i.isPremium);
    if (filters.premium === 'false') items = items.filter((i) => !i.isPremium);

    return { total, page, limit, items };
  }

  async listPgOwners(filters: { activeOnly?: boolean; q?: string }) {
    const where: Record<string, unknown> = { role: 'PG_OWNER' };
    if (filters.q?.trim()) {
      where.OR = [
        { email: { contains: filters.q.trim(), mode: 'insensitive' } },
        { profile: { firstName: { contains: filters.q.trim(), mode: 'insensitive' } } },
      ];
    }
    const owners = await this.prisma.user.findMany({
      where,
      include: {
        ...userInclude,
        pgListings: { select: { id: true, title: true, status: true, locality: true, monthlyRent: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return owners
      .map((owner) => {
        const activeListings = owner.pgListings.filter((p) => p.status === 'ACTIVE');
        return {
          id: owner.id,
          email: owner.email,
          phone: owner.phone,
          status: owner.status,
          createdAt: owner.createdAt.toISOString(),
          profile: toPublicProfile(owner),
          listingsCount: owner.pgListings.length,
          activeListingsCount: activeListings.length,
          listings: owner.pgListings,
        };
      })
      .filter((row) => !filters.activeOnly || row.activeListingsCount > 0);
  }

  async listSubscriptions(filters: { status?: SubscriptionStatus; page?: number; limit?: number }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 50));
    const skip = (page - 1) * limit;
    const where = filters.status ? { status: filters.status } : {};

    const [total, rows] = await Promise.all([
      this.prisma.subscription.count({ where }),
      this.prisma.subscription.findMany({
        where,
        include: { user: { include: userInclude }, plan: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      items: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        user: toPublicProfile(row.user),
        email: row.user.email,
        planName: row.plan?.name ?? 'Premium',
        planId: row.planId,
        status: row.status,
        source: row.source,
        amountPaise: row.amountPaise,
        currency: row.currency,
        razorpayOrderId: row.razorpayOrderId,
        razorpayPaymentId: row.razorpayPaymentId,
        startsAt: row.startsAt.toISOString(),
        expiresAt: row.expiresAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async listPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({ orderBy: { amountPaise: 'asc' } });
    const counts = await this.prisma.subscription.groupBy({
      by: ['planId'],
      _count: { _all: true },
      where: { status: { not: 'CANCELLED' } },
    });
    const countMap = new Map(counts.map((c) => [c.planId, c._count._all]));
    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      amountPaise: plan.amountPaise,
      amountInr: plan.amountPaise / 100,
      durationDays: plan.durationDays,
      active: plan.active,
      subscriberCount: countMap.get(plan.id) ?? 0,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    }));
  }

  async createPlan(data: { name: string; description?: string; amountPaise: number; durationDays: number }) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        amountPaise: data.amountPaise,
        durationDays: data.durationDays,
        active: true,
      },
    });
  }

  async updatePlan(
    id: string,
    data: Partial<{ name: string; description: string; amountPaise: number; durationDays: number; active: boolean }>,
  ) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return this.prisma.subscriptionPlan.update({ where: { id }, data });
  }

  async grantPremium(userId: string, planId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.membership.grantPremium(userId, { source: 'ADMIN', planId });
    return { ok: true };
  }

  async revokePremium(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.membership.revokePremium(userId);
    return { ok: true };
  }

  async listReports(status?: ReportStatus) {
    const rows = await this.prisma.report.findMany({
      where: status ? { status } : undefined,
      include: { reporter: { include: userInclude } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((row) => ({
      id: row.id,
      targetKind: row.targetKind,
      targetId: row.targetId,
      reason: row.reason,
      details: row.details,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      reporter: toPublicProfile(row.reporter),
    }));
  }

  async updateReport(id: string, status: ReportStatus) {
    const row = await this.prisma.report.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Report not found');
    const updated = await this.prisma.report.update({ where: { id }, data: { status } });
    return { id: updated.id, status: updated.status };
  }

  async suspendUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new BadRequestException('Cannot suspend an admin');
    await this.prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
    return { ok: true };
  }

  async restoreUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } });
    return { ok: true };
  }

  async closeListing(kind: ReportTargetKind, targetId: string) {
    if (kind === 'PG') {
      const pg = await this.prisma.pgListing.findUnique({ where: { id: targetId } });
      if (!pg) throw new NotFoundException('PG not found');
      await this.prisma.pgListing.update({ where: { id: targetId }, data: { status: 'CLOSED' } });
      return { ok: true };
    }
    if (kind === 'FLAT') {
      const flat = await this.prisma.flatListing.findUnique({ where: { id: targetId } });
      if (!flat) throw new NotFoundException('Flat not found');
      await this.prisma.flatListing.update({ where: { id: targetId }, data: { status: 'CLOSED' } });
      return { ok: true };
    }
    if (kind === 'ROOM') {
      const room = await this.prisma.room.findUnique({
        where: { id: targetId },
        include: { accommodation: true },
      });
      if (!room) throw new NotFoundException('Room not found');
      await this.prisma.accommodation.update({
        where: { id: room.accommodationId },
        data: { status: 'CLOSED' },
      });
      return { ok: true };
    }
    throw new BadRequestException('Cannot close a user target — suspend the account instead');
  }
}
