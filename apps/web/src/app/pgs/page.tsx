'use client';

import { LOCALITIES } from '@fmr/shared';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PgCard } from '@/components/pg-card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { PgListing } from '@/lib/types';

export default function PgsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PgListing[]>([]);
  const [mine, setMine] = useState<PgListing[]>([]);
  const [locality, setLocality] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams();
    if (locality) params.set('locality', locality);
    if (gender) params.set('gender', gender);
    api<PgListing[]>(`/pgs?${params}`).then(setRows).catch(() => setRows([]));
    api<PgListing[]>('/pgs/mine').then(setMine).catch(() => setMine([]));
  }, [user, locality, gender]);

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to browse PG beds.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted"><Link href="/living" className="text-clay">Living</Link> · PG marketplace</p>
          <h1 className="mt-1 text-3xl font-semibold">PG beds</h1>
          <p className="mt-2 text-sm text-muted">
            Whole beds with meals and gender policy — not a roommate share of someone&apos;s room.
          </p>
        </div>
        <Link href="/pgs/new" className="btn-primary">List a PG</Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <select
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          className="field w-auto py-2 text-sm"
        >
          <option value="">All corridors</option>
          {LOCALITIES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="field w-auto py-2 text-sm"
        >
          <option value="">Any gender policy</option>
          <option value="MALE">Men only</option>
          <option value="FEMALE">Women only</option>
          <option value="ANY">Co-ed</option>
        </select>
      </div>

      {mine.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Your listings</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {mine.map((pg) => <PgCard key={pg.id} pg={pg} />)}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Available beds</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {rows.map((pg) => <PgCard key={pg.id} pg={pg} />)}
        </div>
        {!rows.length && (
          <p className="mt-4 text-sm text-muted">No PG beds match these filters yet.</p>
        )}
      </section>
    </div>
  );
}
