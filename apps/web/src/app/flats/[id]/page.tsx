'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportButton } from '@/components/report-button';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import { roomPhotoFor } from '@/lib/media';
import type { FlatListing } from '@/lib/types';

export default function FlatDetailPage() {
  const params = useParams<{ id: string }>();
  const [flat, setFlat] = useState<FlatListing | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<FlatListing>(`/flats/${params.id}`)
      .then(setFlat)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load flat'));
  }, [params.id]);

  if (!flat) return <p className="px-5 py-16 text-center text-muted">{error || 'Loading…'}</p>;

  const bhkLabel = flat.bhk === 'TWO_BHK' ? '2 BHK' : '3 BHK';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={roomPhotoFor(flat.locality, flat.photos)} alt={flat.title} className="h-56 w-full rounded-[1.5rem] object-cover sm:h-72" />
      <p className="mt-4 text-sm text-muted"><Link href="/flats" className="text-clay">Flat discovery</Link></p>
      <h1 className="mt-1 text-3xl font-semibold">{flat.title}</h1>
      <p className="mt-2 text-2xl font-semibold">{inr(flat.monthlyRent)}<span className="text-base font-normal text-muted"> / month</span></p>
      <p className="mt-2 text-sm text-muted">
        {flat.locality} · {bhkLabel} · {flat.furnished ? 'Furnished' : 'Unfurnished'}
        {flat.deposit ? ` · Deposit ${inr(flat.deposit)}` : ''}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {flat.amenities.map((amenity) => (
          <span key={amenity} className="chip">{amenity}</span>
        ))}
      </div>
      {flat.notes && <p className="mt-6 text-sm leading-6 text-ink/70">{flat.notes}</p>}
      {flat.listedBy && (
        <p className="mt-6 text-sm text-muted">Listed by {flat.listedBy.name}</p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/groups" className="btn-primary">Find flatmates for this</Link>
        <ReportButton targetKind="FLAT" targetId={flat.id} />
      </div>
    </div>
  );
}
