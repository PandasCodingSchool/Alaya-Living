'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { useAuth } from './auth';

export type BookmarkKind = 'PERSON' | 'ROOM';

interface BookmarkContextValue {
  people: string[];
  rooms: string[];
  isSaved: (kind: BookmarkKind, targetId: string) => boolean;
  toggle: (kind: BookmarkKind, targetId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextValue>({
  people: [],
  rooms: [],
  isSaved: () => false,
  toggle: async () => undefined,
  refresh: async () => undefined,
});

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [people, setPeople] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setPeople([]);
      setRooms([]);
      return;
    }
    const data = await api<{ people: string[]; rooms: string[] }>('/bookmarks/ids');
    setPeople(data.people);
    setRooms(data.rooms);
  }, [user]);

  useEffect(() => {
    if (loading) return;
    refresh().catch(() => {
      setPeople([]);
      setRooms([]);
    });
  }, [loading, refresh]);

  const isSaved = useCallback(
    (kind: BookmarkKind, targetId: string) =>
      (kind === 'PERSON' ? people : rooms).includes(targetId),
    [people, rooms],
  );

  const toggle = useCallback(
    async (kind: BookmarkKind, targetId: string) => {
      const setter = kind === 'PERSON' ? setPeople : setRooms;
      const current = kind === 'PERSON' ? people : rooms;
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
    [people, rooms],
  );

  const value = useMemo(
    () => ({ people, rooms, isSaved, toggle, refresh }),
    [people, rooms, isSaved, toggle, refresh],
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}
