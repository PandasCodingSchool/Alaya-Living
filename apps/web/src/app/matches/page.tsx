'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { ContactReveal } from '@/components/contact-reveal';
import { Reasons } from '@/components/reasons';
import { api } from '@/lib/api';
import type { Agreement, CompatibilityReason, Profile } from '@/lib/types';

interface MatchRow {
  id: string;
  score: number;
  status: string;
  conversationId: string | null;
  lastMessage: { id: string; senderId: string; body: string } | null;
  reasons: CompatibilityReason[];
  user: Profile;
}

interface InterestBundle {
  outgoing: { id: string; user: Profile }[];
  incoming: { id: string; user: Profile }[];
  matches: MatchRow[];
}

export default function MatchesPage() {
  const router = useRouter();
  const [data, setData] = useState<InterestBundle | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api<InterestBundle>('/interests').then(setData);
  }, []);

  async function createAgreement(matchId: string) {
    setBusy(matchId);
    try {
      const row = await api<Agreement>('/agreements', {
        method: 'POST',
        body: JSON.stringify({ matchId }),
      });
      router.push(`/agreements/${row.id}`);
    } finally {
      setBusy(null);
    }
  }

  if (!data) return <p className="px-5 py-16 text-center">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-3xl font-semibold">Matches</h1>
      <p className="mt-2 text-sm text-muted">
        Mutual only. Once you both like each other, chat is open for both of you — they join from Matches or Messages.
      </p>
      <section className="mt-8 space-y-4">
        {data.matches.map((match) => (
          <article key={match.id} className="panel p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={match.user.name} photoUrl={match.user.photoUrl} size={48} />
                <div>
                <p className="text-lg font-semibold">{match.user.name}</p>
                <p className="max-w-[36ch] truncate text-xs text-muted">
                  {match.score}% · {match.lastMessage ? match.lastMessage.body : match.status === 'CHAT_STARTED' ? 'Chat started' : 'Chat is open — say hello'}
                </p>
                </div>
              </div>
              {match.conversationId && (
                <Link href={`/chat/${match.conversationId}`} className="btn-dark">
                  Open chat
                </Link>
              )}
            </div>
            <ContactReveal userId={match.user.id} matched />
            <Reasons reasons={match.reasons} />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy === match.id}
                onClick={() => createAgreement(match.id)}
                className="btn-ghost"
              >
                {busy === match.id ? 'Creating…' : 'Create agreement'}
              </button>
              <Link href="/agreements" className="text-sm text-clay self-center">
                View all agreements
              </Link>
            </div>
          </article>
        ))}
        {!data.matches.length && <p className="text-ink/50">No mutual matches yet. Interest is one-way until they like you back.</p>}
      </section>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Incoming interest</h2>
        <div className="mt-4 space-y-2">
          {data.incoming.map((row) => (
            <Link key={row.id} href={`/people/${row.user.id}`} className="panel flex items-center gap-3 px-4 py-3 text-sm">
              <Avatar name={row.user.name} photoUrl={row.user.photoUrl} size={36} />
              {row.user.name} is interested
            </Link>
          ))}
          {!data.incoming.length && <p className="text-sm text-ink/50">No incoming interest yet.</p>}
        </div>
      </section>
    </div>
  );
}
