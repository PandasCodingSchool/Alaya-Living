'use client';

import { AMENITIES, LOCALITIES } from '@fmr/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api, apiUpload } from '@/lib/api';

export default function NewRoomPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [amenities, setAmenities] = useState<string[]>(['WiFi', 'AC']);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    api<{ id: string }[]>('/rooms/mine')
      .then((rows) => {
        if (rows[0]) router.replace(`/rooms/${rows[0].id}/edit`);
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  function leave() {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/listings');
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const room = await api<{ id: string }>('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          propertyType: data.get('propertyType'),
          locality: data.get('locality'),
          exactAddress: data.get('exactAddress'),
          roomType: data.get('roomType'),
          monthlyRent: Number(data.get('monthlyRent')),
          roommateContribution: Number(data.get('roommateContribution')),
          deposit: Number(data.get('deposit') || 0) || undefined,
          availableFrom: data.get('availableFrom'),
          sharingPermission: data.get('sharingPermission'),
          amenities,
          notes: data.get('notes'),
        }),
      });
      for (const photo of photos) {
        await apiUpload(`/rooms/${room.id}/photos`, photo);
      }
      router.push(`/rooms/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create listing');
    }
  }

  if (checking) return <p className="px-5 py-16 text-center text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <button type="button" onClick={leave} className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">List your room</h1>
      <p className="mt-3 text-sm text-ink/60">One listing per person. Exact address stays private. Ask whether sharing is actually allowed.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <select name="propertyType" className="field">
          <option value="PG">PG</option>
          <option value="APARTMENT">Apartment</option>
          <option value="INDEPENDENT">Independent</option>
          <option value="STUDIO">Studio</option>
        </select>
        <select name="locality" className="field">
          {LOCALITIES.map((locality) => <option key={locality}>{locality}</option>)}
        </select>
        <input name="exactAddress" placeholder="Exact address (private)" className="field" />
        <select name="roomType" className="field">
          <option value="SINGLE">Single</option>
          <option value="DOUBLE">Double</option>
          <option value="SHARED">Shared</option>
        </select>
        <input name="monthlyRent" type="number" required placeholder="Current monthly rent" className="field" />
        <input name="roommateContribution" type="number" required placeholder="Expected roommate contribution" className="field" />
        <input name="deposit" type="number" placeholder="Deposit" className="field" />
        <input name="availableFrom" type="date" required className="field" />
        <select name="sharingPermission" required className="field">
          <option value="YES">Sharing is permitted</option>
          <option value="REQUIRES_APPROVAL">Needs landlord/PG approval</option>
          <option value="UNKNOWN">Not sure yet</option>
          <option value="NO">Sharing is not permitted</option>
        </select>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => (
            <button
              type="button"
              key={amenity}
              onClick={() => setAmenities((current) => current.includes(amenity) ? current.filter((a) => a !== amenity) : [...current, amenity])}
              className={`rounded-full px-3 py-1 text-sm ${amenities.includes(amenity) ? 'bg-ink text-paper' : 'bg-sand'}`}
            >
              {amenity}
            </button>
          ))}
        </div>
        <textarea name="notes" placeholder="Anything a roommate should know" className="field" />
        <div>
          <label className="text-sm font-medium">Room photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-2 block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-[#FFE8F0] file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
            onChange={(event) => {
              const files = Array.from(event.target.files || []).slice(0, 6);
              setPhotos(files);
              setPreviews(files.map((file) => URL.createObjectURL(file)));
            }}
          />
          <p className="mt-1 text-xs text-muted">Up to 6 photos. Exact address still stays private.</p>
          {!!previews.length && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="h-24 w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={leave} className="btn-ghost w-full">
            Cancel
          </button>
          <button className="btn-primary w-full">Publish listing</button>
        </div>
        <Link href="/listings" className="block text-center text-sm text-muted hover:text-ink">
          Exit to rooms
        </Link>
      </form>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
    </div>
  );
}
