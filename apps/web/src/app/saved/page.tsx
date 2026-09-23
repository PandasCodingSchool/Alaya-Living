'use client';

import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MatchCard } from '@/components/match-card';
import { RoomCard } from '@/components/room-card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useBookmarks } from '@/lib/bookmarks';
import type { Profile, Room } from '@/lib/types';

export default function SavedPage() {
  const { user } = useAuth();
  const { isSaved } = useBookmarks();
  const [tab, setTab] = useState<'people' | 'rooms'>('people');
  const [people, setPeople] = useState<Profile[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api<{ people: Profile[]; rooms: Room[] }>('/bookmarks')
      .then((data) => {
        setPeople(data.people);
        setRooms(data.rooms);
        setError('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load saved items'));
  }, [user]);

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to see saved people and rooms.
      </p>
    );
  }

  const visiblePeople = people.filter((person) => isSaved('PERSON', person.id));
  const visibleRooms = rooms.filter((room) => isSaved('ROOM', room.id));
  const items = tab === 'people' ? visiblePeople : visibleRooms;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Saved</h1>
          <p className="mt-1 text-sm text-muted">People and rooms you want to come back to later.</p>
        </div>
        <p className="text-xs text-muted">{visiblePeople.length + visibleRooms.length} saved</p>
      </div>

      <div className="mt-6 flex gap-2">
        {(['people', 'rooms'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === value ? 'bg-[#FFE8F0] font-semibold text-ink' : 'text-muted hover:bg-[#FFF1F5]'
            }`}
          >
            {value === 'people' ? `People (${visiblePeople.length})` : `Rooms (${visibleRooms.length})`}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-clay">{error}</p>}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {tab === 'people'
          ? visiblePeople.map((person) => <MatchCard key={person.id} person={person} />)
          : visibleRooms.map((room) => <RoomCard key={room.id} room={room} />)}
      </div>

      {!items.length && !error && (
        <div className="panel mt-6 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Bookmark className="h-8 w-8 text-clay/70" />
          <p className="text-sm text-muted">
            Nothing saved here yet. Tap the bookmark on a person or room to keep it.
          </p>
        </div>
      )}
    </div>
  );
}
