'use client';

import { AMENITIES, LOCALITIES } from '@fmr/shared';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { BedInventoryForm, bedsFromListing, bedsToPayload, type BedDraft } from '@/components/pg-bed-inventory';
import { api, apiUpload } from '@/lib/api';
import type { PgListing } from '@/lib/types';

export default function EditPgPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pg, setPg] = useState<PgListing | null>(null);
  const [error, setError] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [beds, setBeds] = useState<BedDraft[]>([]);

  useEffect(() => {
    api<PgListing>(`/pgs/${params.id}`)
      .then((row) => {
        setPg(row);
        setAmenities(row.amenities);
        setBeds(bedsFromListing(row.beds));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load PG'));
  }, [params.id]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pg) return;
    const data = new FormData(event.currentTarget);
    try {
      await api(`/pgs/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: data.get('title'),
          locality: data.get('locality'),
          deposit: Number(data.get('deposit') || 0) || undefined,
          genderPolicy: data.get('genderPolicy'),
          mealsIncluded: data.get('mealsIncluded') === 'on',
          sharingPermission: data.get('sharingPermission'),
          availableFrom: data.get('availableFrom'),
          amenities,
          notes: data.get('notes'),
          beds: bedsToPayload(beds),
        }),
      });
      router.push(`/pgs/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update listing');
    }
  }

  async function onPhoto(file?: File) {
    if (!file) return;
    const updated = await apiUpload<PgListing>(`/pgs/${params.id}/photos`, file);
    setPg(updated);
  }

  if (!pg) return <p className="px-5 py-16 text-center text-muted">{error || 'Loading…'}</p>;

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-5 sm:py-10">
      <Link href={`/pgs/${params.id}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to PG
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Edit PG</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="title" required defaultValue={pg.title} className="field" />
        <select name="locality" defaultValue={pg.locality} className="field" required>
          {LOCALITIES.map((locality) => <option key={locality}>{locality}</option>)}
        </select>
        <BedInventoryForm beds={beds} onChange={setBeds} />
        <input name="deposit" type="number" defaultValue={pg.deposit ?? ''} className="field" />
        <select name="genderPolicy" defaultValue={pg.genderPolicy} className="field">
          <option value="ANY">Co-ed</option>
          <option value="MALE">Men only</option>
          <option value="FEMALE">Women only</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input name="mealsIncluded" type="checkbox" defaultChecked={pg.mealsIncluded} className="rounded" />
          Meals included
        </label>
        <select name="sharingPermission" defaultValue={pg.sharingPermission} className="field">
          <option value="YES">Sharing permitted</option>
          <option value="REQUIRES_APPROVAL">Needs approval</option>
          <option value="NO">Single occupancy only</option>
        </select>
        <input name="availableFrom" type="date" required defaultValue={pg.availableFrom.slice(0, 10)} className="field" />
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() =>
                setAmenities((current) =>
                  current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity],
                )
              }
              className={`chip ${amenities.includes(amenity) ? 'bg-night text-white' : ''}`}
            >
              {amenity}
            </button>
          ))}
        </div>
        <textarea name="notes" defaultValue={pg.notes ?? ''} className="field min-h-24 rounded-3xl py-3" />
        <input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} className="text-sm" />
        <button className="btn-primary w-full">Save changes</button>
      </form>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
    </div>
  );
}
