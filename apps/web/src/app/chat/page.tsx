'use client';

import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { useInbox } from '@/lib/inbox';

export default function InboxPage() {
  const { threads, isUnread } = useInbox();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-3xl font-semibold">Messages</h1>
      <p className="mt-2 text-sm text-muted">
        Chat opens only after a mutual match. When they write, the thread appears here — open it to reply.
      </p>
      <section className="mt-8 space-y-3">
        {threads.map((thread) => {
          const unread = isUnread(thread);
          return (
            <Link key={thread.id} href={`/chat/${thread.id}`} className="panel flex items-center gap-3 px-4 py-3">
              <Avatar name={thread.other.name} photoUrl={thread.other.photoUrl} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={`truncate ${unread ? 'font-semibold' : 'font-medium'}`}>{thread.other.name}</p>
                  {unread && <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-semibold text-white">New</span>}
                </div>
                <p className="truncate text-sm text-muted">
                  {thread.lastMessage?.body || 'Matched — say hello to start the chat.'}
                </p>
              </div>
            </Link>
          );
        })}
        {!threads.length && (
          <p className="text-sm text-muted">No conversations yet. Mutual matches show up here with an Open chat button.</p>
        )}
      </section>
    </div>
  );
}
