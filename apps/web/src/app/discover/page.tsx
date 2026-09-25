'use client';

import { LOCALITIES, RADIUS_OPTIONS_KM } from '@fmr/shared';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { MatchCard } from '@/components/match-card';
import { PgCard } from '@/components/pg-card';
import { RoomCard } from '@/components/room-card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { usePgOperatorGuard } from '@/lib/use-pg-operator-guard';
import { inr } from '@/lib/format';
import type { PgListing, Profile, Room } from '@/lib/types';

const emptyFilters = {
  localities: [] as string[],
  minBudget: '',
  maxBudget: '',
  food: '',
  roomType: '',
  gender: '',
};

export default function DiscoverPage() {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-muted">Loading…</p>}>
      <DiscoverInner />
    </Suspense>
  );
}

function DiscoverInner() {
  const { blocked } = usePgOperatorGuard();
  const { user, loading, refresh } = useAuth();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState((searchParams.get('q') || '').trim());
  const query = search.trim().toLowerCase();
  const [tab, setTab] = useState<'people' | 'rooms' | 'pgs'>('people');
  const [people, setPeople] = useState<Profile[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pgs, setPgs] = useState<PgListing[]>([]);
  const [error, setError] = useState('');
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [radiusKm, setRadiusKm] = useState(5);
  const [draftRadius, setDraftRadius] = useState(5);
  const [origin, setOrigin] = useState<'office' | 'home'>('office');

  useEffect(() => {
    if (user?.preferredRadiusKm != null) {
      setRadiusKm(user.preferredRadiusKm);
      setDraftRadius(user.preferredRadiusKm);
    }
  }, [user?.preferredRadiusKm]);

  useEffect(() => {
    if (draftRadius === radiusKm) return;
    const timer = window.setTimeout(() => {
      setRadiusKm(draftRadius);
      api('/preferences', { method: 'PUT', body: JSON.stringify({ preferredRadiusKm: draftRadius }) })
        .then(() => refresh())
        .catch(() => undefined);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draftRadius, radiusKm, refresh]);

  useEffect(() => {
    if (!user) return;
    const params = `?radiusKm=${radiusKm}&origin=${origin}`;
    const load = async () => {
      try {
        const pgParams = new URLSearchParams();
        if (filters.localities.length === 1) pgParams.set('locality', filters.localities[0]);
        if (filters.minBudget) pgParams.set('minBudget', filters.minBudget);
        if (filters.maxBudget) pgParams.set('maxBudget', filters.maxBudget);
        if (filters.gender) pgParams.set('gender', filters.gender);
        const [p, r, pgRows] = await Promise.all([
          api<Profile[]>(`/discover/people${params}`),
          api<Room[]>(`/discover/rooms${params}`),
          api<PgListing[]>(`/pgs?${pgParams}`),
        ]);
        setPeople(p);
        setRooms(r);
        setPgs(pgRows);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load matches');
      }
    };
    load();
  }, [user, radiusKm, origin, filters.localities, filters.minBudget, filters.maxBudget, filters.gender]);

  const activeCount = [
    filters.localities.length,
    filters.minBudget,
    filters.maxBudget,
    filters.food,
    tab === 'rooms' ? filters.roomType : '',
    tab === 'pgs' ? filters.gender : '',
    radiusKm !== (user?.preferredRadiusKm ?? 5) ? 1 : 0,
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

  const visiblePgs = useMemo(() => {
    return pgs.filter((pg) => {
      if (filters.localities.length && !filters.localities.includes(pg.locality)) return false;
      if (filters.minBudget && pg.monthlyRent < Number(filters.minBudget)) return false;
      if (filters.maxBudget && pg.monthlyRent > Number(filters.maxBudget)) return false;
      if (filters.gender && pg.genderPolicy !== filters.gender && pg.genderPolicy !== 'ANY') return false;
      if (query && ![pg.title, pg.locality, pg.owner.name].join(' ').toLowerCase().includes(query)) return false;
      return true;
    });
  }, [pgs, filters, query]);

  if (loading) return <p className="px-5 py-16 text-center text-muted">Loading…</p>;
  if (blocked) return null;
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

  function changeRadius(next: number) {
    setDraftRadius(next);
  }

  const filterForm = (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Distance</p>
        <div className="mt-2 grid grid-cols-2 rounded-full bg-[#FFE8F0] p-1 text-xs">
          <button type="button" className={`rounded-full py-1.5 ${origin === 'office' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`} onClick={() => setOrigin('office')}>
            From office
          </button>
          <button type="button" className={`rounded-full py-1.5 ${origin === 'home' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`} onClick={() => setOrigin('home')}>
            From home
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {RADIUS_OPTIONS_KM.map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => changeRadius(km)}
              className={`rounded-full px-3 py-1.5 text-xs ${draftRadius === km ? 'bg-night text-white' : 'bg-[#FFE8F0] text-ink'}`}
            >
              {km === 0 ? 'City-wide' : `${km} km`}
            </button>
          ))}
        </div>
        <label className="mt-3 block">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Custom radius</span>
            <span className="font-semibold">{draftRadius === 0 ? 'City-wide' : `${draftRadius} km`}</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={draftRadius === 0 ? 30 : draftRadius}
            onChange={(e) => changeRadius(Number(e.target.value))}
            className="radius-slider mt-2"
            aria-label="Custom search radius in kilometers"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            <span>1 km</span>
            <span>30 km</span>
          </div>
        </label>
      </div>
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
      ) : tab === 'rooms' ? (
        <label className="block text-xs text-muted">
          Room type
          <select className="field mt-1 py-2 text-sm" value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}>
            <option value="">Any</option>
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="SHARED">Shared</option>
          </select>
        </label>
      ) : (
        <label className="block text-xs text-muted">
          Gender policy
          <select className="field mt-1 py-2 text-sm" value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}>
            <option value="">Any</option>
            <option value="MALE">Men only</option>
            <option value="FEMALE">Women only</option>
            <option value="ANY">Co-ed</option>
          </select>
        </label>
      )}
      <button type="button" className="text-xs font-medium text-clay" onClick={() => setFilters(emptyFilters)}>
        Clear filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-5 sm:py-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="panel sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden p-5">
          <div className="shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Filter matches</p>
            <p className="mt-2 text-sm text-ink/70">
              Defaults: {user.localities.join(', ') || 'all corridors'} ·{' '}
              {user.minBudget && user.maxBudget ? `${inr(user.minBudget)}–${inr(user.maxBudget)}` : 'budget open'}
            </p>
          </div>
          <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">{filterForm}</div>
        </div>
      </aside>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">Discover</h1>
            <p className="mt-1 text-sm text-muted">
              Same-gender only. {draftRadius === 0 ? 'City-wide' : `Within ${draftRadius} km of your ${origin}`}.
              {user.workLocation ? ` Office: ${user.workLocation}.` : ''}
            </p>
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
            <div className="grid grid-cols-3 rounded-full bg-[#FFE8F0] p-1 text-xs sm:text-sm">
              <button className={`rounded-full px-2 py-1.5 sm:px-3 ${tab === 'people' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`} onClick={() => setTab('people')}>
                People {visiblePeople.length ? `(${visiblePeople.length})` : ''}
              </button>
              <button className={`rounded-full px-2 py-1.5 sm:px-3 ${tab === 'rooms' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`} onClick={() => setTab('rooms')}>
                Rooms {visibleRooms.length ? `(${visibleRooms.length})` : ''}
              </button>
              <button className={`rounded-full px-2 py-1.5 sm:px-3 ${tab === 'pgs' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`} onClick={() => setTab('pgs')}>
                PGs {visiblePgs.length ? `(${visiblePgs.length})` : ''}
              </button>
            </div>
          </div>
        </div>

        <label className="relative mt-5 block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === 'people'
                ? 'Search people by name, work, or locality'
                : tab === 'rooms'
                  ? 'Search rooms by locality or host'
                  : 'Search PGs by name, locality, or operator'
            }
            className="w-full rounded-full border border-sand bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-clay"
          />
        </label>

        {openFilters && (
          <div className="panel mt-5 max-h-[min(70vh,36rem)] overflow-y-auto p-5 lg:hidden">
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
          {tab === 'people' && visiblePeople.map((person) => <MatchCard key={person.id} person={person} />)}
          {tab === 'rooms' && visibleRooms.map((room) => <RoomCard key={room.id} room={room} />)}
          {tab === 'pgs' && visiblePgs.map((pg) => <PgCard key={pg.id} pg={pg} />)}
        </div>
        {tab === 'people' && !visiblePeople.length && (
          <p className="mt-10 text-muted">
            {people.length ? 'No people match these filters. Clear or widen them.' : 'No compatible people yet. Widen localities or complete more of your profile.'}
          </p>
        )}
        {tab === 'rooms' && !visibleRooms.length && (
          <p className="mt-10 text-muted">
            {rooms.length ? 'No rooms match these filters. Clear or widen them.' : 'No rooms in this radius. Try 10 km or city-wide.'}
          </p>
        )}
        {tab === 'pgs' && !visiblePgs.length && (
          <p className="mt-10 text-muted">
            {pgs.length ? 'No PGs match these filters. Clear or widen them.' : 'No PG beds available right now.'}
          </p>
        )}
      </div>
    </div>
  );
}
