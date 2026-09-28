'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { inr } from '@/lib/format';
import { roomPhotoFor } from '@/lib/media';
import type { FlatListing } from '@/lib/types';

export default function MyFlatsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<FlatListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api<FlatListing[]>('/flats/mine')
      .then(setRows)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <Link href="/login" className="text-clay">Sign in</Link> to manage flats.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">My flats</h1>
          <p className="mt-1 text-sm text-muted">Whole-home listings you publish for groups or direct rent.</p>
        </div>
        <Link href="/flats/new" className="btn-primary">List a flat</Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {rows.map((flat) => {
          const bhkLabel = flat.bhk === 'TWO_BHK' ? '2 BHK' : '3 BHK';
          return (
            <article key={flat.id} className="panel overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={roomPhotoFor(flat.locality, flat.photos)} alt={flat.title} className="h-40 w-full object-cover" />
              <div className="p-5">
                <p className="text-lg font-semibold">{flat.title}</p>
                <p className="mt-1 text-xl font-semibold">{inr(flat.monthlyRent)}<span className="text-sm font-normal text-muted"> / mo</span></p>
                <p className="mt-1 text-sm text-muted">{flat.locality} · {bhkLabel} · {flat.status === 'CLOSED' ? 'Closed' : 'Active'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/flats/${flat.id}`} className="btn-ghost">View</Link>
                  <Link href={`/flats/${flat.id}/edit`} className="btn-dark">Edit</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!rows.length && !loading && (
        <p className="mt-8 text-sm text-muted">No flat listings yet. Publish one to appear in Discover.</p>
      )}
    </div>
  );
}
