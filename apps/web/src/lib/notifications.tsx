'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { useAuth } from './auth';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

interface NotificationContextValue {
  items: AppNotification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  items: [],
  unreadCount: 0,
  refresh: async () => undefined,
  markRead: async () => undefined,
  markAllRead: async () => undefined,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    const [rows, countRow] = await Promise.all([
      api<AppNotification[]>('/notifications'),
      api<{ count: number }>('/notifications/unread-count'),
    ]);
    setItems(rows);
    setUnreadCount(countRow.count);
  }, [user]);

  useEffect(() => {
    if (loading) return;
    refresh().catch(() => undefined);
    const timer = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [loading, refresh]);

  const markRead = useCallback(
    async (id: string) => {
      setItems((current) => current.map((row) => (row.id === id ? { ...row, readAt: new Date().toISOString() } : row)));
      setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await api(`/notifications/${id}/read`, { method: 'PATCH' });
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    setItems((current) => current.map((row) => ({ ...row, readAt: row.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await api('/notifications/read-all', { method: 'POST' });
    } catch {
      await refresh();
    }
  }, [refresh]);

  const value = useMemo(
    () => ({ items, unreadCount, refresh, markRead, markAllRead }),
    [items, unreadCount, refresh, markRead, markAllRead],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
