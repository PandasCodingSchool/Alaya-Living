'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar } from '@/components/avatar';
import {
  BedInventoryTable,
  BedQuickToggle,
  bedInventorySummary,
  bedsFromListing,
  bedsToPayload,
  type BedDraft,
} from '@/components/pg-bed-inventory';
import { SharingTiersTable } from '@/components/pg-sharing-tiers';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { isPgOperator } from '@/lib/routes';
import { prettyEnum } from '@/lib/format';
import { roomPhotoFor } from '@/lib/media';
import type { InterestState, PgListing } from '@/lib/types';

export default function PgDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [pg, setPg] = useState<PgListing | null>(null);
  const [state, setState] = useState<InterestState | null>(null);
  const [beds, setBeds] = useState<BedDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [quickError, setQuickError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api<PgListing>(`/pgs/${params.id}`)
      .then((row) => {
        setPg(row);
        setBeds(bedsFromListing(row.beds));
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load PG'));
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
        body: JSON.stringify({ beds: bedsToPayload(beds) }),
      });
      setPg(updated);
      setBeds(bedsFromListing(updated.beds));
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

  if (!pg) return <p className="px-5 py-16 text-center text-muted">{loadError || 'Loading…'}</p>;

  const mine = user?.id === pg.owner.id;
  const hidden = pg.status === 'CLOSED' || pg.bedsAvailable <= 0;
  const backHref = mine && isPgOperator(user) ? '/operator' : '/pgs';
  const backLabel = mine && isPgOperator(user) ? 'Operator dashboard' : 'PG marketplace';
  const hasBedInventory = (pg.beds?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={roomPhotoFor(pg.locality, pg.photos)} alt={pg.title} className="h-56 w-full rounded-[1.5rem] object-cover sm:h-72" />
      <p className="mt-4 text-sm text-muted"><Link href={backHref} className="text-clay">{backLabel}</Link></p>
      <h1 className="mt-1 text-3xl font-semibold">{pg.title}</h1>
      <p className="mt-2 text-2xl font-semibold">
        {bedInventorySummary(pg.beds, pg.sharingOptions, pg.monthlyRent)}
      </p>
      <p className="mt-2 text-sm text-muted">
        {pg.locality} · {prettyEnum(pg.genderPolicy)} · {pg.bedsAvailable} beds open total · {pg.mealsIncluded ? 'Meals included' : 'No meals'}
      </p>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">{hasBedInventory ? 'Bed inventory' : 'Availability by sharing type'}</h2>
        <div className="mt-3">
          {hasBedInventory ? (
            <BedInventoryTable beds={pg.beds} ownerView={mine} />
          ) : (
            <SharingTiersTable
              options={pg.sharingOptions}
              monthlyRent={pg.monthlyRent}
              bedsAvailable={pg.bedsAvailable}
              totalBeds={pg.totalBeds}
            />
          )}
        </div>
      </div>

      {hidden && (
        <p className="mt-3 rounded-xl bg-[#FFF1F5] px-4 py-3 text-sm text-ink/80">
          {mine ? 'Hidden from seekers — all beds are full. Mark beds open to publish again.' : 'No beds available right now.'}
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
            <h2 className="font-semibold">Quick update beds</h2>
            <p className="mt-1 text-sm text-muted">Toggle beds open or occupied. For rent or room changes, use full edit.</p>
          </div>
          <BedQuickToggle beds={beds} onChange={setBeds} />
          {quickError && <p className="text-sm text-clay">{quickError}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <Link href={`/pgs/${pg.id}/edit`} className="btn-ghost">Full edit</Link>
          </div>
        </form>
      )}

      {!mine && (
        <div className="panel mt-8 flex items-center gap-4 p-5">
          <Avatar name={pg.owner.name} photoUrl={pg.owner.photoUrl} size={56} />
          <div>
            <p className="text-sm text-muted">Listed by</p>
            <p className="text-lg font-semibold">{pg.owner.name}</p>
            <Link href={`/people/${pg.owner.id}`} className="text-sm text-clay">View profile</Link>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {mine ? (
          <Link href={`/pgs/${pg.id}/edit`} className="btn-dark">Edit listing</Link>
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
