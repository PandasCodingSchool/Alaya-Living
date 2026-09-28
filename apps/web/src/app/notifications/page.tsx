'use client';

import Link from 'next/link';
import { useNotifications } from '@/lib/notifications';
import { useAuth } from '@/lib/auth';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { items, markRead, markAllRead } = useNotifications();

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to see notifications.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <p className="mt-1 text-sm text-muted">Matches, messages, and PG inquiries.</p>
        </div>
        <button type="button" className="btn-ghost text-sm" onClick={() => void markAllRead()}>
          Mark all read
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.link || '#'}
            onClick={() => {
              if (!item.readAt) void markRead(item.id);
            }}
            className={`panel block p-4 ${item.readAt ? 'opacity-75' : ''}`}
          >
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.body}</p>
            <p className="mt-2 text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
          </Link>
        ))}
        {!items.length && <p className="py-10 text-center text-muted">You&apos;re all caught up.</p>}
      </div>
    </div>
  );
}
