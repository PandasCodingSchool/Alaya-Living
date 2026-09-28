'use client';

import { AMENITIES, LOCALITIES } from '@fmr/shared';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { api, apiUpload } from '@/lib/api';

export default function NewFlatPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['WiFi', 'Parking']);
  const [photos, setPhotos] = useState<File[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const flat = await api<{ id: string }>('/flats', {
        method: 'POST',
        body: JSON.stringify({
          title: data.get('title'),
          locality: data.get('locality'),
          bhk: data.get('bhk'),
          monthlyRent: Number(data.get('monthlyRent')),
          deposit: Number(data.get('deposit') || 0) || undefined,
          furnished: data.get('furnished') === 'on',
          availableFrom: data.get('availableFrom'),
          amenities,
          notes: data.get('notes'),
        }),
      });
      for (const photo of photos) {
        await apiUpload(`/flats/${flat.id}/photos`, photo);
      }
      router.push(`/flats/${flat.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create flat listing');
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <h1 className="mt-4 text-3xl font-semibold">List a flat</h1>
      <p className="mt-3 text-sm text-muted">For groups or owners offering a whole 2BHK/3BHK.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="title" required placeholder="Listing title" className="field" />
        <select name="locality" className="field">
          {LOCALITIES.map((locality) => <option key={locality}>{locality}</option>)}
        </select>
        <select name="bhk" className="field">
          <option value="TWO_BHK">2 BHK</option>
          <option value="THREE_BHK">3 BHK</option>
        </select>
        <input name="monthlyRent" type="number" required placeholder="Monthly rent (₹)" className="field" />
        <input name="deposit" type="number" placeholder="Deposit (₹)" className="field" />
        <input name="availableFrom" type="date" required className="field" />
        <label className="flex items-center gap-2 text-sm">
          <input name="furnished" type="checkbox" />
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
        <textarea name="notes" placeholder="Notes for seekers" className="field min-h-24" />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          className="field"
        />
        <button type="submit" className="btn-primary w-full">
          Publish flat
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-clay">{error}</p>}
    </div>
  );
}
