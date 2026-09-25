'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BedDouble, Building2, Inbox, Plus, Users } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import { PgCard } from '@/components/pg-card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { PgOperatorDashboard } from '@/lib/types';

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Building2 }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFE8F0] text-clay">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function OperatorDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [data, setData] = useState<PgOperatorDashboard | null>(null);
  const [error, setError] = useState('');

  const allowed = user?.role === 'PG_OWNER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!allowed) {
      router.replace('/discover');
      return;
    }
    api<PgOperatorDashboard>('/pgs/dashboard')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load dashboard'));
  }, [user, loading, allowed, router]);

  if (loading || !user) {
    return <p className="px-5 py-16 text-center text-muted">Loading…</p>;
  }

  if (!allowed) return null;

  if (!data) {
    return <p className="px-5 py-16 text-center text-muted">{error || 'Loading dashboard…'}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">PG operator</p>
          <h1 className="mt-1 text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm text-muted">
            Manage beds, pricing, and inquiries from one place.
          </p>
        </div>
        <Link href="/pgs/new" className="btn-primary">
          <Plus className="mr-1 h-4 w-4" />
          Add PG listing
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Listings" value={data.summary.listings} icon={Building2} />
        <Stat label="Active listings" value={data.summary.activeListings} icon={Building2} />
        <Stat label="Open beds" value={data.summary.openBeds} icon={BedDouble} />
        <Stat label="Recent inquiries" value={data.summary.inquiries} icon={Inbox} />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Your PG listings</h2>
          <Link href="/pgs" className="text-sm text-clay">Browse marketplace</Link>
        </div>
        {data.listings.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {data.listings.map((pg) => <PgCard key={pg.id} pg={pg} />)}
          </div>
        ) : (
          <div className="panel mt-4 p-8 text-center">
            <p className="text-sm text-muted">No PG listings yet.</p>
            <Link href="/pgs/new" className="btn-primary mt-4 inline-flex">Create your first listing</Link>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent inquiries</h2>
          <Link href="/matches" className="text-sm text-clay">Open matches</Link>
        </div>
        {data.inquiries.length ? (
          <div className="panel mt-4 divide-y divide-sand">
            {data.inquiries.map((inquiry) => (
              <div key={inquiry.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={inquiry.user.name} photoUrl={inquiry.user.photoUrl} size={44} />
                  <div>
                    <p className="font-medium">{inquiry.user.name}</p>
                    <p className="text-xs text-muted">
                      {inquiry.user.occupation || 'Seeker'} · {new Date(inquiry.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <Link href={`/people/${inquiry.user.id}`} className="btn-ghost px-4 py-2 text-sm">
                  View profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel mt-4 flex items-center gap-3 p-5 text-sm text-muted">
            <Users className="h-4 w-4 shrink-0" />
            Inquiries appear here when seekers message you from a PG listing.
          </div>
        )}
      </section>
    </div>
  );
}
