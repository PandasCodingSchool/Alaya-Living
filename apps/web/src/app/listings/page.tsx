'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { officeLocalities } from '@fmr/shared';
import { RoomCard } from '@/components/room-card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Room } from '@/lib/types';

export default function ListingsPage() {
  const { user } = useAuth();
  const [mine, setMine] = useState<Room[]>([]);
  const [nearby, setNearby] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const myRooms = await api<Room[]>('/rooms/mine');
        setMine(myRooms);
        const corridors = [...new Set([
          ...user.localities,
          ...officeLocalities(user.workLocation),
          ...myRooms.map((room) => room.locality),
        ])];
        let candidates: Room[] = [];
        try {
          candidates = await api<Room[]>('/discover/rooms');
        } catch {
          candidates = [];
        }
        if (!candidates.length) {
          candidates = await api<Room[]>('/rooms');
        }
        setNearby(
          candidates.filter((room) => {
            if (room.owner.id === user.id) return false;
            if (!corridors.length) return true;
            return corridors.includes(room.locality);
          }),
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to see rooms.
      </p>
    );
  }

  const area = [...new Set([...user.localities, ...mine.map((room) => room.locality)])].join(', ') || 'your corridors';

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Rooms</h1>
          <p className="mt-1 text-sm text-muted">Your listings, plus available rooms near {area}.</p>
        </div>
        {mine[0] ? (
          <Link href={`/rooms/${mine[0].id}/edit`} className="btn-primary">
            Edit listing
          </Link>
        ) : (
          <Link href="/rooms/new" className="btn-primary">
            List a room
          </Link>
        )}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your listing</h2>
          <span className="text-xs text-muted">{mine.length ? '1 of 1' : 'None yet'}</span>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {mine.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
        {!mine.length && !loading && (
          <p className="mt-4 text-sm text-ink/50">You have not listed a room yet.</p>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available near you</h2>
          <span className="text-xs text-muted">{nearby.length} open</span>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {nearby.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
        {!nearby.length && !loading && (
          <p className="mt-4 text-sm text-ink/50">No other rooms in {area} yet. Widen localities in your profile.</p>
        )}
      </section>
    </div>
  );
}
