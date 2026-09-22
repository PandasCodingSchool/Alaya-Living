'use client';

import { LOCALITIES } from '@fmr/shared';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { MatchCard } from '@/components/match-card';
import { RoomCard } from '@/components/room-card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { inr } from '@/lib/format';
import type { Profile, Room } from '@/lib/types';

const emptyFilters = {
  localities: [] as string[],
  minBudget: '',
  maxBudget: '',
  food: '',
  roomType: '',
};

export default function DiscoverPage() {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-muted">Loading…</p>}>
      <DiscoverInner />
    </Suspense>
  );
}

function DiscoverInner() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const [tab, setTab] = useState<'people' | 'rooms'>('people');
  const [people, setPeople] = useState<Profile[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [p, r] = await Promise.all([
          api<Profile[]>('/discover/people'),
          api<Room[]>('/discover/rooms'),
        ]);
        setPeople(p);
        setRooms(r);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load matches');
      }
    };
    load();
  }, [user]);

  const activeCount = [
    filters.localities.length,
    filters.minBudget,
    filters.maxBudget,
    filters.food,
    tab === 'rooms' ? filters.roomType : '',
  ].filter(Boolean).length;

  const visiblePeople = useMemo(() => {
    return people.filter((person) => {
      if (filters.localities.length && !person.localities.some((locality) => filters.localities.includes(locality))) {
        return false;
      }
      if (filters.minBudget && person.maxBudget && person.maxBudget < Number(filters.minBudget)) return false;
      if (filters.maxBudget && person.minBudget && person.minBudget > Number(filters.maxBudget)) return false;
      if (filters.food && person.foodPreference && person.foodPreference !== filters.food) return false;
      if (query && ![person.name, person.occupation, ...person.localities].join(' ').toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [people, filters, query]);

  const visibleRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filters.localities.length && !filters.localities.includes(room.locality)) return false;
      if (filters.minBudget && room.roommateContribution < Number(filters.minBudget)) return false;
      if (filters.maxBudget && room.roommateContribution > Number(filters.maxBudget)) return false;
      if (filters.roomType && room.roomType !== filters.roomType) return false;
      if (query && ![room.locality, room.owner.name, room.roomType].join(' ').toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [rooms, filters, query]);

  if (loading) return <p className="px-5 py-16 text-center text-muted">Loading…</p>;
  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to see compatible matches.
      </p>
    );
  }

  function toggleLocality(locality: string) {
    setFilters((current) => ({
      ...current,
      localities: current.localities.includes(locality)
        ? current.localities.filter((item) => item !== locality)
        : [...current.localities, locality],
    }));
  }

  const filterForm = (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Corridor</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LOCALITIES.map((locality) => (
            <button
              key={locality}
              type="button"
              onClick={() => toggleLocality(locality)}
              className={`rounded-full px-3 py-1.5 text-xs ${
                filters.localities.includes(locality) ? 'bg-night text-white' : 'bg-[#FFE8F0] text-ink'
              }`}
            >
              {locality}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-muted">
          Min ₹
          <input
            type="number"
            className="field mt-1 py-2 text-sm"
            value={filters.minBudget}
            placeholder={user.minBudget ? String(user.minBudget) : '8000'}
            onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
          />
        </label>
        <label className="text-xs text-muted">
          Max ₹
          <input
            type="number"
            className="field mt-1 py-2 text-sm"
            value={filters.maxBudget}
            placeholder={user.maxBudget ? String(user.maxBudget) : '15000'}
            onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
          />
        </label>
      </div>
      {tab === 'people' ? (
        <label className="block text-xs text-muted">
          Food
          <select className="field mt-1 py-2 text-sm" value={filters.food} onChange={(e) => setFilters({ ...filters, food: e.target.value })}>
            <option value="">Any</option>
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="NON_VEGETARIAN">Non-vegetarian</option>
            <option value="BOTH">Both</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
      ) : (
        <label className="block text-xs text-muted">
          Room type
          <select className="field mt-1 py-2 text-sm" value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}>
            <option value="">Any</option>
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="SHARED">Shared</option>
          </select>
        </label>
      )}
      <button type="button" className="text-xs font-medium text-clay" onClick={() => setFilters(emptyFilters)}>
        Clear filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="panel sticky top-24 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Filter matches</p>
          <p className="mt-2 text-sm text-ink/70">
            Defaults: {user.localities.join(', ') || 'all corridors'} ·{' '}
            {user.minBudget && user.maxBudget ? `${inr(user.minBudget)}–${inr(user.maxBudget)}` : 'budget open'}
          </p>
          <div className="mt-5">{filterForm}</div>
        </div>
      </aside>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Discover</h1>
            <p className="mt-1 text-sm text-muted">People to share with, or rooms already listed in your corridors.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenFilters((open) => !open)}
              className="btn-ghost lg:hidden"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter{activeCount ? ` (${activeCount})` : ''}
            </button>
            <div className="grid grid-cols-2 rounded-full bg-[#FFE8F0] p-1 text-sm">
              <button className={`rounded-full px-4 py-1.5 ${tab === 'people' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`} onClick={() => setTab('people')}>
                People {visiblePeople.length ? `(${visiblePeople.length})` : ''}
              </button>
              <button className={`rounded-full px-4 py-1.5 ${tab === 'rooms' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`} onClick={() => setTab('rooms')}>
                Rooms {visibleRooms.length ? `(${visibleRooms.length})` : ''}
              </button>
            </div>
          </div>
        </div>

        {openFilters && (
          <div className="panel mt-5 p-5 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Filters</p>
              <button type="button" onClick={() => setOpenFilters(false)} aria-label="Close filters">
                <X className="h-4 w-4 text-muted" />
              </button>
            </div>
            {filterForm}
          </div>
        )}

        {error && <p className="mt-6 text-orange-700">{error}</p>}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {tab === 'people'
            ? visiblePeople.map((person) => <MatchCard key={person.id} person={person} />)
            : visibleRooms.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
        {tab === 'people' && !visiblePeople.length && (
          <p className="mt-10 text-muted">
            {people.length ? 'No people match these filters. Clear or widen them.' : 'No compatible people yet. Widen localities or complete more of your profile.'}
          </p>
        )}
        {tab === 'rooms' && !visibleRooms.length && (
          <p className="mt-10 text-muted">
            {rooms.length ? 'No rooms match these filters. Clear or widen them.' : 'No rooms match your budget and corridors yet.'}
          </p>
        )}
      </div>
    </div>
  );
}
