'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Membership } from '@/lib/types';

export default function PremiumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api<Membership>('/membership').then(setMembership);
  }, [user]);

  async function activate() {
    try {
      const next = await api<Membership>('/membership/activate', { method: 'POST' });
      setMembership(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not activate');
    }
  }

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to manage Premium.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">Alaya Premium</p>
      <h1 className="mt-3 text-3xl font-semibold">See contact after you match</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Chat is always free after a mutual match. Phone and email stay hidden until then.
        The first {membership?.freeLimit ?? 3} matches include contact unlock. After that, Premium is required.
      </p>
      <div className="panel mt-8 space-y-3 p-5 text-sm">
        <p>Matches so far: {membership?.matchCount ?? '—'}</p>
        <p>Free contact unlocks left: {membership?.isPremium ? 'Unlimited' : membership?.freeRemaining ?? '—'}</p>
        <p>Status: {membership?.isPremium ? 'Premium active' : 'Free plan'}</p>
      </div>
      {membership?.isPremium ? (
        <button onClick={() => router.back()} className="btn-dark mt-6">
          Back to your match
        </button>
      ) : (
        <button onClick={activate} className="btn-primary mt-6">
          Activate Premium (demo)
        </button>
      )}
      <p className="mt-3 text-xs text-muted">Payments are mocked in this phase. No card is charged.</p>
      {error && <p className="mt-3 text-sm text-clay">{error}</p>}
    </div>
  );
}
