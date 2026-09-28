'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '@/lib/notifications';

export function NotificationBell() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-[#FFF1F5] hover:text-ink"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-sand bg-white p-2 shadow-panel">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" className="text-xs text-clay" onClick={() => void markAllRead()}>
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.slice(0, 20).map((item) => (
              <Link
                key={item.id}
                href={item.link || '/notifications'}
                onClick={() => {
                  if (!item.readAt) void markRead(item.id);
                  setOpen(false);
                }}
                className={`block rounded-xl px-3 py-3 hover:bg-[#FFF1F5] ${item.readAt ? 'opacity-70' : ''}`}
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted">{item.body}</p>
              </Link>
            ))}
            {!items.length && <p className="px-3 py-6 text-center text-sm text-muted">No notifications yet.</p>}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block px-3 py-2 text-center text-xs text-clay">
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
