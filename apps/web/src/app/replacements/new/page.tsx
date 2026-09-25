'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import type { Room } from '@/lib/types';

function NewReplacementInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetRoom = searchParams.get('roomId') || '';
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState(presetRoom);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Room[]>('/rooms/mine').then((rows) => {
      setRooms(rows);
      if (!roomId && rows[0]) setRoomId(rows[0].id);
    });
  }, [roomId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const row = await api<{ id: string }>('/replacements', {
        method: 'POST',
        body: JSON.stringify({
          roomId: data.get('roomId'),
          departingName: data.get('departingName'),
          leaveDate: data.get('leaveDate'),
          notes: data.get('notes') || undefined,
        }),
      });
      router.push(`/replacements/${row.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create post');
    }
  }

  if (!rooms.length) {
    return (
      <p className="px-5 py-16 text-center text-sm text-muted">
        <Link href="/rooms/new" className="text-clay">List a room</Link> first, then post a replacement vacancy.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-5 sm:py-10">
      <Link href="/replacements" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Replacements
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Find a replacement</h1>
      <p className="mt-2 text-sm text-muted">We will suggest compatible people near your corridor and budget.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <select name="roomId" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="field" required>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.locality} · {inr(room.roommateContribution)} / person
            </option>
          ))}
        </select>
        <input name="departingName" required placeholder="Who is leaving? (first name)" className="field" />
        <input name="leaveDate" type="date" required className="field" />
        <textarea name="notes" placeholder="Why they are leaving, any landlord notes…" className="field min-h-24 rounded-3xl py-3" />
        <button className="btn-primary w-full">Post vacancy</button>
      </form>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
    </div>
  );
}

export default function NewReplacementPage() {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-muted">Loading…</p>}>
      <NewReplacementInner />
    </Suspense>
  );
}
