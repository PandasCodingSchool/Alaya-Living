'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FlatCard } from '@/components/flat-card';
import { MatchCard } from '@/components/match-card';
import { PgCard } from '@/components/pg-card';
import { RoomCard } from '@/components/room-card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useBookmarks } from '@/lib/bookmarks';
import type { FlatListing, PgListing, Profile, Room } from '@/lib/types';

interface SavedSearchRow {
  id: string;
  name: string;
  kind: 'PEOPLE' | 'ROOMS' | 'PGS' | 'FLATS';
  filters: Record<string, unknown>;
  createdAt: string;
}

export default function SavedPage() {
  const { user } = useAuth();
  const { isSaved } = useBookmarks();
  const [tab, setTab] = useState<'people' | 'rooms' | 'pgs' | 'flats' | 'searches'>('people');
  const [people, setPeople] = useState<Profile[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pgs, setPgs] = useState<PgListing[]>([]);
  const [flats, setFlats] = useState<FlatListing[]>([]);
  const [searches, setSearches] = useState<SavedSearchRow[]>([]);
  const [error, setError] = useState('');

  function load() {
    Promise.all([
      api<{ people: Profile[]; rooms: Room[]; pgs: PgListing[]; flats: FlatListing[] }>('/bookmarks'),
      api<SavedSearchRow[]>('/saved-searches'),
    ])
      .then(([bookmarks, savedSearches]) => {
        setPeople(bookmarks.people);
        setRooms(bookmarks.rooms);
        setPgs(bookmarks.pgs);
        setFlats(bookmarks.flats);
        setSearches(savedSearches);
        setError('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load saved items'));
  }

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to see saved items.
      </p>
    );
  }

  const visiblePeople = people.filter((person) => isSaved('PERSON', person.id));
  const visibleRooms = rooms.filter((room) => isSaved('ROOM', room.id));
  const visiblePgs = pgs.filter((pg) => isSaved('PG', pg.id));
  const visibleFlats = flats.filter((flat) => isSaved('FLAT', flat.id));

  async function removeSearch(id: string) {
    await api(`/saved-searches/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Saved</h1>
          <p className="mt-1 text-sm text-muted">People, listings, and search alerts.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          ['people', `People (${visiblePeople.length})`],
          ['rooms', `Rooms (${visibleRooms.length})`],
          ['pgs', `PGs (${visiblePgs.length})`],
          ['flats', `Flats (${visibleFlats.length})`],
          ['searches', `Searches (${searches.length})`],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === value ? 'bg-[#FFE8F0] font-semibold text-ink' : 'text-muted hover:bg-[#FFF1F5]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-clay">{error}</p>}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {tab === 'people' && visiblePeople.map((person) => <MatchCard key={person.id} person={person} />)}
        {tab === 'rooms' && visibleRooms.map((room) => <RoomCard key={room.id} room={room} />)}
        {tab === 'pgs' && visiblePgs.map((pg) => <PgCard key={pg.id} pg={pg} />)}
        {tab === 'flats' && visibleFlats.map((flat) => <FlatCard key={flat.id} flat={flat} />)}
        {tab === 'searches' &&
          searches.map((search) => (
            <div key={search.id} className="panel p-5">
              <p className="font-medium">{search.name}</p>
              <p className="mt-1 text-xs text-muted">{search.kind} · saved {new Date(search.createdAt).toLocaleDateString()}</p>
              <div className="mt-4 flex gap-2">
                <Link href="/discover" className="btn-ghost text-xs">
                  Open discover
                </Link>
                <button type="button" className="btn-ghost text-xs text-clay" onClick={() => void removeSearch(search.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
      </div>

      {tab === 'searches' && !searches.length && !error && (
        <div className="panel mt-6 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Bookmark className="h-8 w-8 text-clay/70" />
          <p className="text-sm text-muted">Save a search from Discover to get alerts here.</p>
        </div>
      )}

      {tab !== 'searches' &&
        !(tab === 'people' ? visiblePeople : tab === 'rooms' ? visibleRooms : tab === 'pgs' ? visiblePgs : visibleFlats).length &&
        !error && (
          <div className="panel mt-6 flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Bookmark className="h-8 w-8 text-clay/70" />
            <p className="text-sm text-muted">Nothing saved in this tab yet.</p>
          </div>
        )}
    </div>
  );
}
