'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Crown,
  Home,
  IndianRupee,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import { TrendBars } from '@/components/admin/trend-bars';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';

interface AdminDashboard {
  pendingReports: number;
  users: number;
  activeUsers: number;
  suspendedUsers: number;
  pgOwners: number;
  activePgs: number;
  activeFlats: number;
  openRooms: number;
  premiumSubscribers: number;
  revenueTodayPaise: number;
  revenueMonthPaise: number;
  revenueTotalPaise: number;
  newUsersWeek: number;
  trends: {
    userSignups: { date: string; value: number }[];
    subscriptions: { date: string; value: number }[];
    revenuePaise: { date: string; value: number }[];
  };
}

export default function AdminOverviewPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<AdminDashboard>('/admin/dashboard')
      .then(setDashboard)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load dashboard'));
  }, []);

  if (error) return <p className="text-sm text-orange-700">{error}</p>;
  if (!dashboard) return <p className="text-muted">Loading dashboard…</p>;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={dashboard.users} href="/admin/users" icon={Users} />
        <StatCard
          label="Active users"
          value={dashboard.activeUsers}
          sub={`${dashboard.suspendedUsers} suspended`}
          href="/admin/users?status=ACTIVE"
          icon={Users}
        />
        <StatCard
          label="Premium subscribers"
          value={dashboard.premiumSubscribers}
          href="/admin/subscriptions?status=ACTIVE"
          icon={Crown}
        />
        <StatCard
          label="New users (7d)"
          value={dashboard.newUsersWeek}
          href="/admin/users?period=week"
          icon={UserPlus}
        />
        <StatCard label="PG owners" value={dashboard.pgOwners} href="/admin/pg-owners" icon={Building2} />
        <StatCard
          label="Active PG listings"
          value={dashboard.activePgs}
          href="/admin/pg-owners?activeOnly=true"
          icon={Building2}
        />
        <StatCard label="Active flats" value={dashboard.activeFlats} href="/admin/users" icon={Home} />
        <StatCard label="Open rooms" value={dashboard.openRooms} href="/admin/users" icon={Home} />
        <StatCard
          label="Revenue today"
          value={inr(dashboard.revenueTodayPaise / 100)}
          href="/admin/revenue"
          icon={IndianRupee}
        />
        <StatCard
          label="Revenue this month"
          value={inr(dashboard.revenueMonthPaise / 100)}
          href="/admin/revenue"
          icon={TrendingUp}
        />
        <StatCard
          label="Total revenue"
          value={inr(dashboard.revenueTotalPaise / 100)}
          href="/admin/revenue"
          icon={IndianRupee}
        />
        <StatCard
          label="Pending reports"
          value={dashboard.pendingReports}
          href="/admin/reports?status=PENDING"
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <TrendBars title="User signups (30 days)" points={dashboard.trends.userSignups} />
        <TrendBars title="New subscriptions (30 days)" points={dashboard.trends.subscriptions} />
        <TrendBars
          title="Revenue (30 days)"
          points={dashboard.trends.revenuePaise}
          formatValue={(v) => inr(v / 100)}
        />
      </div>
    </>
  );
}
