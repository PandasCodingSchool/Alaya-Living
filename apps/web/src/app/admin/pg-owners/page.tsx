'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import type { Profile } from '@/lib/types';

interface PgOwnerRow {
  id: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  profile: Profile;
  listingsCount: number;
  activeListingsCount: number;
  listings: { id: string; title: string; status: string; locality: string; monthlyRent: number }[];
}

function PgOwnersInner() {
  const searchParams = useSearchParams();
  const activeOnly = searchParams.get('activeOnly') === 'true';
  const [rows, setRows] = useState<PgOwnerRow[]>([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  function load() {
    const params = new URLSearchParams();
    if (activeOnly) params.set('activeOnly', 'true');
    if (q.trim()) params.set('q', q.trim());
    api<PgOwnerRow[]>(`/admin/pg-owners?${params}`)
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load PG owners'));
  }

  useEffect(() => {
    load();
  }, [activeOnly]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">PG owners</h2>
          <p className="mt-1 text-sm text-muted">
            {rows.length} operators{activeOnly ? ' with active listings' : ''}
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <input
            className="field py-2 text-sm"
            placeholder="Search name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn-ghost">
            Search
          </button>
        </form>
      </div>

      {error && <p className="mt-4 text-sm text-orange-700">{error}</p>}

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={row.profile.name} photoUrl={row.profile.photoUrl} size={40} />
                <div>
                  <p className="font-medium">{row.profile.name}</p>
                  <p className="text-xs text-muted">
                    {row.email || row.phone || 'No contact'} · {row.status} · joined{' '}
                    {new Date(row.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted">
                    {row.activeListingsCount} active / {row.listingsCount} total listings
                  </p>
                </div>
              </div>
            </div>
            {row.listings.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-sand pt-4">
                {row.listings.map((listing) => (
                  <div key={listing.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="font-medium">{listing.title}</p>
                      <p className="text-xs text-muted">
                        {listing.locality} · {inr(listing.monthlyRent)}/mo · {listing.status}
                      </p>
                    </div>
                    <Link href={`/pgs/${listing.id}`} className="text-xs text-clay hover:underline">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {!rows.length && <p className="py-10 text-center text-muted">No PG owners found.</p>}
      </div>
    </>
  );
}

export default function AdminPgOwnersPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <PgOwnersInner />
    </Suspense>
  );
}
