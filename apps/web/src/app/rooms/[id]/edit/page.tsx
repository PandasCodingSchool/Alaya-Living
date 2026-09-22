'use client';

import { AMENITIES, LOCALITIES } from '@fmr/shared';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api, apiUpload } from '@/lib/api';
import type { Room } from '@/lib/types';

export default function EditRoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => {
    api<Room>(`/rooms/${params.id}`).then((data) => {
      setRoom(data);
      setAmenities(data.amenities);
    });
  }, [params.id]);

  if (!room) return <p className="px-5 py-16 text-center">Loading…</p>;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api(`/rooms/${params.id}`, {
        method: 'PATCH',
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
      for (const photo of newPhotos) {
        await apiUpload(`/rooms/${params.id}/photos`, photo);
      }
      router.push(`/rooms/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  function leave() {
    router.push(`/rooms/${params.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <button type="button" onClick={leave} className="text-sm text-muted hover:text-ink">
        ← Back to room
      </button>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em]">Edit listing</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <select name="propertyType" defaultValue={room.propertyType} className="field">
          <option value="PG">PG</option>
          <option value="APARTMENT">Apartment</option>
          <option value="INDEPENDENT">Independent</option>
          <option value="STUDIO">Studio</option>
        </select>
        <select name="locality" defaultValue={room.locality} className="field">
          {LOCALITIES.map((locality) => <option key={locality}>{locality}</option>)}
        </select>
        <input name="exactAddress" placeholder="Exact address (private)" className="field" />
        <select name="roomType" defaultValue={room.roomType} className="field">
          <option value="SINGLE">Single</option>
          <option value="DOUBLE">Double</option>
          <option value="SHARED">Shared</option>
        </select>
        <input name="monthlyRent" type="number" defaultValue={room.monthlyRent} className="field" />
        <input name="roommateContribution" type="number" defaultValue={room.roommateContribution} className="field" />
        <input name="deposit" type="number" defaultValue={room.deposit ?? ''} className="field" />
        <input name="availableFrom" type="date" defaultValue={room.availableFrom.slice(0, 10)} className="field" />
        <select name="sharingPermission" defaultValue={room.sharingPermission} className="field">
          <option value="YES">Sharing is permitted</option>
          <option value="REQUIRES_APPROVAL">Needs approval</option>
          <option value="UNKNOWN">Not sure</option>
          <option value="NO">Not permitted</option>
        </select>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => (
            <button type="button" key={amenity} onClick={() => setAmenities((c) => c.includes(amenity) ? c.filter((a) => a !== amenity) : [...c, amenity])} className={`rounded-full px-3 py-1 text-sm ${amenities.includes(amenity) ? 'bg-ink text-paper' : 'bg-sand'}`}>
              {amenity}
            </button>
          ))}
        </div>
        <textarea name="notes" defaultValue={room.notes || ''} className="field" />
        {!!room.photos.length && (
          <div className="grid grid-cols-3 gap-2">
            {room.photos.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="h-24 w-full rounded-xl object-cover" />
            ))}
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Add photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-2 block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-[#FFE8F0] file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
            onChange={(event) => {
              const files = Array.from(event.target.files || []).slice(0, 6);
              setNewPhotos(files);
              setNewPreviews(files.map((file) => URL.createObjectURL(file)));
            }}
          />
          {!!newPreviews.length && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {newPreviews.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="h-24 w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={leave} className="btn-ghost w-full">Cancel</button>
          <button className="btn-dark w-full">Save</button>
        </div>
      </form>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
    </div>
  );
}
