'use client';

import { useEffect, useState } from 'react';
import { TrendBars } from '@/components/admin/trend-bars';
import { StatCard } from '@/components/admin/stat-card';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import { IndianRupee, TrendingUp } from 'lucide-react';

interface AdminDashboard {
  revenueTodayPaise: number;
  revenueMonthPaise: number;
  revenueTotalPaise: number;
  premiumSubscribers: number;
  trends: {
    revenuePaise: { date: string; value: number }[];
    subscriptions: { date: string; value: number }[];
  };
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<AdminDashboard>('/admin/dashboard')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load revenue'));
  }, []);

  if (error) return <p className="text-sm text-orange-700">{error}</p>;
  if (!data) return <p className="text-muted">Loading revenue…</p>;

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold">Revenue</h2>
        <p className="mt-1 text-sm text-muted">Subscription payments over time</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Today" value={inr(data.revenueTodayPaise / 100)} href="/admin/revenue" icon={IndianRupee} />
        <StatCard label="This month" value={inr(data.revenueMonthPaise / 100)} href="/admin/revenue" icon={TrendingUp} />
        <StatCard label="All time" value={inr(data.revenueTotalPaise / 100)} href="/admin/revenue" icon={IndianRupee} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <TrendBars
          title="Daily revenue (30 days)"
          points={data.trends.revenuePaise}
          formatValue={(v) => inr(v / 100)}
        />
        <TrendBars title="New subscriptions per day (30 days)" points={data.trends.subscriptions} />
      </div>

      <p className="mt-6 text-sm text-muted">
        {data.premiumSubscribers} users currently have an active premium subscription.
      </p>
    </>
  );
}
