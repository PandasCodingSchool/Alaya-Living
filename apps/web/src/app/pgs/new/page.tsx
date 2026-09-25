'use client';

import { AMENITIES, LOCALITIES } from '@fmr/shared';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api, apiUpload } from '@/lib/api';

export default function NewPgPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['WiFi', 'Food']);
  const [photos, setPhotos] = useState<File[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const pg = await api<{ id: string }>('/pgs', {
        method: 'POST',
        body: JSON.stringify({
          title: data.get('title'),
          locality: data.get('locality'),
          monthlyRent: Number(data.get('monthlyRent')),
          deposit: Number(data.get('deposit') || 0) || undefined,
          genderPolicy: data.get('genderPolicy'),
          mealsIncluded: data.get('mealsIncluded') === 'on',
          sharingPermission: data.get('sharingPermission'),
          bedsAvailable: Number(data.get('bedsAvailable')),
          totalBeds: Number(data.get('totalBeds')),
          availableFrom: data.get('availableFrom'),
          amenities,
          notes: data.get('notes'),
        }),
      });
      for (const photo of photos) {
        await apiUpload(`/pgs/${pg.id}/photos`, photo);
      }
      router.push(`/pgs/${pg.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create listing');
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-5 sm:py-10">
      <Link href="/pgs" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> PG marketplace
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">List a PG</h1>
      <p className="mt-2 text-sm text-muted">Beds with meals and gender policy. Exact address stays private.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="title" required placeholder="PG name, e.g. Green Nest PG" className="field" />
        <select name="locality" className="field" required>
          {LOCALITIES.map((locality) => <option key={locality}>{locality}</option>)}
        </select>
        <input name="monthlyRent" type="number" required placeholder="Rent per bed (₹)" className="field" />
        <input name="deposit" type="number" placeholder="Deposit (₹)" className="field" />
        <div className="grid grid-cols-2 gap-3">
          <input name="bedsAvailable" type="number" required defaultValue={1} min={0} placeholder="Beds open" className="field" />
          <input name="totalBeds" type="number" required defaultValue={4} min={1} placeholder="Total beds" className="field" />
        </div>
        <select name="genderPolicy" className="field" required>
          <option value="ANY">Co-ed</option>
          <option value="MALE">Men only</option>
          <option value="FEMALE">Women only</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input name="mealsIncluded" type="checkbox" defaultChecked className="rounded" />
          Meals included
        </label>
        <select name="sharingPermission" className="field" required>
          <option value="YES">Sharing a bed is permitted</option>
          <option value="REQUIRES_APPROVAL">Needs approval</option>
          <option value="NO">Single occupancy only</option>
        </select>
        <input name="availableFrom" type="date" required className="field" />
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
        <textarea name="notes" placeholder="House rules, curfew, laundry…" className="field min-h-24 rounded-3xl py-3" />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          className="text-sm"
        />
        <button className="btn-primary w-full">Publish PG</button>
      </form>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
    </div>
  );
}
