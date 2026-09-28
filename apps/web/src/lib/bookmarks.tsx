'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { useAuth } from './auth';

export type BookmarkKind = 'PERSON' | 'ROOM' | 'PG' | 'FLAT';

interface BookmarkContextValue {
  people: string[];
  rooms: string[];
  pgs: string[];
  flats: string[];
  isSaved: (kind: BookmarkKind, targetId: string) => boolean;
  toggle: (kind: BookmarkKind, targetId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextValue>({
  people: [],
  rooms: [],
  pgs: [],
  flats: [],
  isSaved: () => false,
  toggle: async () => undefined,
  refresh: async () => undefined,
});

const kindKey = {
  PERSON: 'people',
  ROOM: 'rooms',
  PG: 'pgs',
  FLAT: 'flats',
} as const;

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [people, setPeople] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [pgs, setPgs] = useState<string[]>([]);
  const [flats, setFlats] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setPeople([]);
      setRooms([]);
      setPgs([]);
      setFlats([]);
      return;
    }
    const data = await api<{ people: string[]; rooms: string[]; pgs: string[]; flats: string[] }>('/bookmarks/ids');
    setPeople(data.people);
    setRooms(data.rooms);
    setPgs(data.pgs);
    setFlats(data.flats);
  }, [user]);

  useEffect(() => {
    if (loading) return;
    refresh().catch(() => {
      setPeople([]);
      setRooms([]);
      setPgs([]);
      setFlats([]);
    });
  }, [loading, refresh]);

  const lists = useMemo(() => ({ people, rooms, pgs, flats }), [people, rooms, pgs, flats]);

  const isSaved = useCallback(
    (kind: BookmarkKind, targetId: string) => lists[kindKey[kind]].includes(targetId),
    [lists],
  );

  const toggle = useCallback(
    async (kind: BookmarkKind, targetId: string) => {
      const key = kindKey[kind];
      const setter = { people: setPeople, rooms: setRooms, pgs: setPgs, flats: setFlats }[key];
      const current = lists[key];
      const saved = current.includes(targetId);
      setter(saved ? current.filter((id) => id !== targetId) : [targetId, ...current]);
      try {
        await api('/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ kind, targetId }),
        });
      } catch {
        setter(current);
      }
    },
    [lists],
  );

  const value = useMemo(
    () => ({ people, rooms, pgs, flats, isSaved, toggle, refresh }),
    [people, rooms, pgs, flats, isSaved, toggle, refresh],
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}
