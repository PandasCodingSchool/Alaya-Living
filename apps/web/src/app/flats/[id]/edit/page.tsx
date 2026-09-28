'use client';

import { AMENITIES, LOCALITIES } from '@fmr/shared';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { PropertyVerifyButton } from '@/components/property-verify-button';
import { api, apiUpload } from '@/lib/api';
import type { FlatListing } from '@/lib/types';

export default function EditFlatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [flat, setFlat] = useState<FlatListing | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [newPhotos, setNewPhotos] = useState<File[]>([]);

  useEffect(() => {
    api<FlatListing>(`/flats/${params.id}`).then((data) => {
      setFlat(data);
      setAmenities(data.amenities);
    });
  }, [params.id]);

  if (!flat) return <p className="px-5 py-16 text-center">Loading…</p>;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api(`/flats/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: data.get('title'),
          locality: data.get('locality'),
          exactAddress: data.get('exactAddress'),
          bhk: data.get('bhk'),
          monthlyRent: Number(data.get('monthlyRent')),
          deposit: Number(data.get('deposit') || 0) || undefined,
          furnished: data.get('furnished') === 'on',
          availableFrom: data.get('availableFrom'),
          amenities,
          notes: data.get('notes'),
        }),
      });
      for (const photo of newPhotos) {
        await apiUpload(`/flats/${params.id}/photos`, photo);
      }
      router.push(`/flats/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <button type="button" onClick={() => router.push(`/flats/${params.id}`)} className="text-sm text-muted hover:text-ink">
        ← Back to flat
      </button>
      <h1 className="mt-4 text-3xl font-semibold">Edit flat listing</h1>
      <div className="mt-6">
        <PropertyVerifyButton flatListingId={flat.id} propertyVerified={flat.propertyVerified} />
      </div>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="title" required defaultValue={flat.title} className="field" />
        <select name="locality" defaultValue={flat.locality} className="field">
          {LOCALITIES.map((locality) => <option key={locality}>{locality}</option>)}
        </select>
        <input name="exactAddress" placeholder="Exact address (private until match)" className="field" />
        <select name="bhk" defaultValue={flat.bhk} className="field">
          <option value="TWO_BHK">2 BHK</option>
          <option value="THREE_BHK">3 BHK</option>
        </select>
        <input name="monthlyRent" type="number" required defaultValue={flat.monthlyRent} className="field" />
        <input name="deposit" type="number" defaultValue={flat.deposit ?? ''} className="field" />
        <input name="availableFrom" type="date" required defaultValue={flat.availableFrom.slice(0, 10)} className="field" />
        <label className="flex items-center gap-2 text-sm">
          <input name="furnished" type="checkbox" defaultChecked={flat.furnished} />
          Furnished
        </label>
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
              className={`rounded-full px-3 py-1.5 text-xs ${amenities.includes(amenity) ? 'bg-night text-white' : 'bg-[#FFE8F0]'}`}
            >
              {amenity}
            </button>
          ))}
        </div>
        <textarea name="notes" defaultValue={flat.notes || ''} className="field min-h-24" />
        <input type="file" accept="image/*" multiple onChange={(e) => setNewPhotos(Array.from(e.target.files || []))} className="field" />
        <button type="submit" className="btn-primary w-full">Save changes</button>
      </form>
      {error && <p className="mt-3 text-sm text-clay">{error}</p>}
    </div>
  );
}
