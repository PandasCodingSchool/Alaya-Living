'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MatchCard } from '@/components/match-card';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import type { ReplacementPost } from '@/lib/types';

export default function ReplacementDetailPage() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<ReplacementPost | null>(null);
  const [error, setError] = useState('');

  function load() {
    api<ReplacementPost>(`/replacements/${params.id}`)
      .then(setRow)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function markFilled() {
    setRow(await api<ReplacementPost>(`/replacements/${params.id}/filled`, { method: 'POST' }));
  }

  async function closePost() {
    setRow(await api<ReplacementPost>(`/replacements/${params.id}/close`, { method: 'POST' }));
  }

  if (!row) return <p className="px-5 py-16 text-center text-muted">{error || 'Loading…'}</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
      <p className="text-sm text-muted"><Link href="/replacements" className="text-clay">Replacements</Link></p>
      <h1 className="mt-2 text-3xl font-semibold">{row.departingName} is leaving</h1>
      <p className="mt-2 text-sm text-muted">
        {row.room.locality} · {inr(row.room.roommateContribution)} / person · leave{' '}
        {new Date(row.leaveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
      {row.notes && <p className="mt-4 text-sm leading-6 text-ink/70">{row.notes}</p>}
      <Link href={`/rooms/${row.roomId}`} className="mt-4 inline-block text-sm text-clay">View room listing</Link>

      {row.mine && row.status === 'OPEN' && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={markFilled} className="btn-primary">Mark filled</button>
          <button type="button" onClick={closePost} className="btn-ghost">Close post</button>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Suggested replacements</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {row.candidates?.map((person) => <MatchCard key={person.id} person={person} />)}
        </div>
        {!row.candidates?.length && (
          <p className="mt-4 text-sm text-muted">No strong candidates yet. Widen your discover radius or adjust budget.</p>
        )}
      </section>
    </div>
  );
}
