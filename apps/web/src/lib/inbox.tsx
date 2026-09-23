'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { api, apiUrl, getToken } from './api';
import { useAuth } from './auth';

export interface InboxMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface InboxThread {
  id: string;
  status: string;
  other: { id: string; name: string; photoUrl?: string | null };
  lastMessage: InboxMessage | null;
}

interface InboxContextValue {
  threads: InboxThread[];
  unreadCount: number;
  isUnread: (thread: InboxThread) => boolean;
  markRead: (conversationId: string, messageId?: string) => void;
  refresh: () => Promise<void>;
}

const READ_KEY = 'fmr_chat_read';
const InboxContext = createContext<InboxContextValue>({
  threads: [],
  unreadCount: 0,
  isUnread: () => false,
  markRead: () => undefined,
  refresh: async () => undefined,
});

function readMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, string>) {
  localStorage.setItem(READ_KEY, JSON.stringify(map));
}

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [readAt, setReadAt] = useState<Record<string, string>>({});
  const socketRef = useRef<Socket | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setThreads([]);
      return;
    }
    const rows = await api<InboxThread[]>('/conversations');
    setThreads(rows);
  }, [user]);

  useEffect(() => {
    setReadAt(readMap());
  }, []);

  useEffect(() => {
    if (loading) return;
    refresh().catch(() => setThreads([]));
  }, [loading, refresh]);

  useEffect(() => {
    if (loading || !user) return;
    const token = getToken();
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || apiUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      withCredentials: true,
      reconnection: true,
    });
    socketRef.current = socket;
    socket.on('inbox', (payload: { conversationId: string; message: InboxMessage }) => {
      setThreads((current) => {
        const existing = current.find((thread) => thread.id === payload.conversationId);
        if (!existing) {
          void refresh();
          return current;
        }
        return [
          { ...existing, lastMessage: payload.message, status: 'CHAT_STARTED' },
          ...current.filter((thread) => thread.id !== payload.conversationId),
        ];
      });
    });

    return () => {
      socket.off('inbox');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loading, user, refresh]);

  const isUnread = useCallback(
    (thread: InboxThread) => {
      if (!user || !thread.lastMessage) return false;
      if (thread.lastMessage.senderId === user.id) return false;
      return readAt[thread.id] !== thread.lastMessage.id;
    },
    [readAt, user],
  );

  const markRead = useCallback((conversationId: string, messageId?: string) => {
    const thread = threads.find((item) => item.id === conversationId);
    const id = messageId || thread?.lastMessage?.id;
    if (!id) return;
    const next = { ...readMap(), [conversationId]: id };
    writeMap(next);
    setReadAt(next);
  }, [threads]);

  const unreadCount = useMemo(() => threads.filter(isUnread).length, [threads, isUnread]);

  return (
    <InboxContext.Provider value={{ threads, unreadCount, isUnread, markRead, refresh }}>
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  return useContext(InboxContext);
}
