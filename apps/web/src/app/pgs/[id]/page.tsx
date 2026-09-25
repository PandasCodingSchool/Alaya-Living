'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar } from '@/components/avatar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { inr, prettyEnum } from '@/lib/format';
import { roomPhotoFor } from '@/lib/media';
import type { InterestState, PgListing } from '@/lib/types';

export default function PgDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [pg, setPg] = useState<PgListing | null>(null);
  const [state, setState] = useState<InterestState | null>(null);
  const [rent, setRent] = useState('');
  const [beds, setBeds] = useState('');
  const [saving, setSaving] = useState(false);
  const [quickError, setQuickError] = useState('');

  useEffect(() => {
    api<PgListing>(`/pgs/${params.id}`).then((row) => {
      setPg(row);
      setRent(String(row.monthlyRent));
      setBeds(String(row.bedsAvailable));
    });
  }, [params.id]);

  useEffect(() => {
    if (!pg || !user || user.id === pg.owner.id) return;
    api<InterestState>(`/interests/${pg.owner.id}`).then(setState).catch(() => undefined);
  }, [pg, user]);

  async function quickSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pg) return;
    setSaving(true);
    setQuickError('');
    try {
      const updated = await api<PgListing>(`/pgs/${pg.id}/quick`, {
        method: 'PATCH',
        body: JSON.stringify({
          monthlyRent: Number(rent),
          bedsAvailable: Number(beds),
        }),
      });
      setPg(updated);
      setRent(String(updated.monthlyRent));
      setBeds(String(updated.bedsAvailable));
    } catch (err) {
      setQuickError(err instanceof Error ? err.message : 'Could not update listing');
    } finally {
      setSaving(false);
    }
  }

  async function messageOperator() {
    if (!pg) return;
    const next = await api<InterestState>('/interests', {
      method: 'POST',
      body: JSON.stringify({ toUserId: pg.owner.id }),
    });
    setState(next);
    if (next.conversationId) router.push(`/chat/${next.conversationId}`);
  }

  if (!pg) return <p className="px-5 py-16 text-center text-muted">Loading…</p>;

  const mine = user?.id === pg.owner.id;
  const hidden = pg.status === 'CLOSED' || pg.bedsAvailable <= 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={roomPhotoFor(pg.locality, pg.photos)} alt={pg.title} className="h-56 w-full rounded-[1.5rem] object-cover sm:h-72" />
      <p className="mt-4 text-sm text-muted"><Link href="/pgs" className="text-clay">PG marketplace</Link></p>
      <h1 className="mt-1 text-3xl font-semibold">{pg.title}</h1>
      <p className="mt-2 text-2xl font-semibold">{inr(pg.monthlyRent)} <span className="text-base font-medium text-muted">/ bed</span></p>
      <p className="mt-2 text-sm text-muted">
        {pg.locality} · {prettyEnum(pg.genderPolicy)} · {pg.bedsAvailable} beds open · {pg.mealsIncluded ? 'Meals included' : 'No meals'}
      </p>
      {hidden && (
        <p className="mt-3 rounded-xl bg-[#FFF1F5] px-4 py-3 text-sm text-ink/80">
          {mine ? 'This listing is hidden from search — no beds available. Add beds to publish again.' : 'No beds available right now.'}
        </p>
      )}
      <p className="mt-4 text-sm text-ink/70">
        Sharing permission: {prettyEnum(pg.sharingPermission)}. Exact address is hidden until you match with the operator.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {pg.amenities.map((amenity) => (
          <span key={amenity} className="chip">{amenity}</span>
        ))}
      </div>
      {pg.notes && <p className="mt-6 text-sm leading-6 text-ink/70">{pg.notes}</p>}

      {mine && (
        <form onSubmit={quickSave} className="panel mt-8 space-y-4 p-5">
          <div>
            <h2 className="font-semibold">Quick update</h2>
            <p className="mt-1 text-sm text-muted">Change rent or open beds without opening the full edit form.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted">Rent per bed (₹)</span>
              <input
                type="number"
                required
                min={1000}
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                className="field mt-1"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted">Beds open</span>
              <input
                type="number"
                required
                min={0}
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="field mt-1"
              />
            </label>
          </div>
          {quickError && <p className="text-sm text-clay">{quickError}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save availability'}
            </button>
            <Link href={`/pgs/${pg.id}/edit`} className="btn-ghost">Full edit</Link>
          </div>
        </form>
      )}

      <div className="panel mt-8 flex items-center gap-4 p-5">
        <Avatar name={pg.owner.name} photoUrl={pg.owner.photoUrl} size={56} />
        <div>
          <p className="text-sm text-muted">Listed by</p>
          <p className="text-lg font-semibold">{pg.owner.name}</p>
          <Link href={`/people/${pg.owner.id}`} className="text-sm text-clay">View profile</Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {mine ? (
          !hidden && <Link href={`/pgs/${pg.id}/edit`} className="btn-dark">Edit listing</Link>
        ) : (
          <>
            <button type="button" onClick={messageOperator} className="btn-primary" disabled={hidden}>
              {state?.matched ? 'Open chat' : state?.interested ? 'Interest sent' : 'Message operator'}
            </button>
            <Link href={`/people/${pg.owner.id}`} className="btn-ghost">View operator</Link>
          </>
        )}
      </div>
    </div>
  );
}
