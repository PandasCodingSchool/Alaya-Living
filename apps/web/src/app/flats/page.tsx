'use client';

import { LOCALITIES } from '@fmr/shared';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FlatCard } from '@/components/flat-card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { FlatListing } from '@/lib/types';

export default function FlatsPage() {
  const { user } = useAuth();
  const [flats, setFlats] = useState<FlatListing[]>([]);
  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams();
    if (locality) params.set('locality', locality);
    if (bhk) params.set('bhk', bhk);
    if (maxRent) params.set('maxRent', maxRent);
    api<FlatListing[]>(`/flats?${params}`)
      .then(setFlats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load flats'));
  }, [user, locality, bhk, maxRent]);

  const visible = useMemo(() => flats, [flats]);

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to browse flats for your group.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
      <p className="text-sm text-muted"><Link href="/living" className="text-clay">Living</Link></p>
      <h1 className="mt-2 text-3xl font-semibold">Flat discovery</h1>
      <p className="mt-2 text-sm text-muted">Browse 2BHK and 3BHK listings that fit your group&apos;s combined budget.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <select className="field w-auto min-w-[140px]" value={locality} onChange={(e) => setLocality(e.target.value)}>
          <option value="">All corridors</option>
          {LOCALITIES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="field w-auto min-w-[120px]" value={bhk} onChange={(e) => setBhk(e.target.value)}>
          <option value="">Any BHK</option>
          <option value="TWO_BHK">2 BHK</option>
          <option value="THREE_BHK">3 BHK</option>
        </select>
        <input
          type="number"
          placeholder="Max rent (₹)"
          className="field w-auto min-w-[140px]"
          value={maxRent}
          onChange={(e) => setMaxRent(e.target.value)}
        />
      </div>

      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((flat) => <FlatCard key={flat.id} flat={flat} />)}
      </div>
      {!visible.length && !error && (
        <p className="mt-10 text-muted">No flats match these filters. Try widening locality or budget.</p>
      )}
    </div>
  );
}
