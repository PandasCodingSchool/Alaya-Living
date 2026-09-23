'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { ContactReveal } from '@/components/contact-reveal';
import { Reasons } from '@/components/reasons';
import { SaveButton } from '@/components/save-button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { hourLabel, inr, prettyEnum } from '@/lib/format';
import type { InterestState, Profile } from '@/lib/types';

export default function PersonPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [person, setPerson] = useState<Profile | null>(null);
  const [state, setState] = useState<InterestState | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([
        api<Profile>(`/people/${params.id}/compatibility`),
        api<InterestState>(`/interests/${params.id}`),
      ]);
      setPerson(p);
      setState(s);
    };
    load().catch((err) => setError(err.message));
  }, [params.id]);

  async function interest() {
    const next = await api<InterestState>('/interests', {
      method: 'POST',
      body: JSON.stringify({ toUserId: params.id }),
    });
    setState(next);
    if (next.conversationId) router.push(`/chat/${next.conversationId}`);
  }

  async function block() {
    await api('/blocks', { method: 'POST', body: JSON.stringify({ userId: params.id }) });
    router.push('/discover');
  }

  if (!person) return <p className="px-5 py-16 text-center text-muted">{error || 'Loading…'}</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <Avatar name={person.name} photoUrl={person.photoUrl} size={72} />
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl">{person.name}</h1>
              <p className="mt-2 text-sm text-muted">{[person.age, person.occupation, person.workMode && prettyEnum(person.workMode)].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
          {person.compatibility && (
            <div className="text-right">
              <p className="font-mono text-2xl font-semibold text-clay">{person.compatibility.score}%</p>
              <p className="text-[11px] text-muted">compatible</p>
            </div>
          )}
        </div>
        <p className="mt-5 text-sm leading-6 text-ink/80">{person.bio}</p>
        <div className="mt-6 grid gap-2 text-sm md:grid-cols-2">
          <p>Office: {person.workLocation || '—'}</p>
          <p>Budget: {person.minBudget && person.maxBudget ? `${inr(person.minBudget)}–${inr(person.maxBudget)}` : '—'}</p>
          <p>Localities: {person.localities.join(', ') || '—'}</p>
          <p>Languages: {person.languages.join(', ') || '—'}</p>
          <p>Sleep: {hourLabel(person.sleepStart)} – {hourLabel(person.sleepEnd)}</p>
          <p>Food: {prettyEnum(person.foodPreference)}</p>
          <p>Smoking: {prettyEnum(person.smokingPreference)}</p>
        </div>
        {person.phoneVerified && <p className="mt-4 font-mono text-[11px] font-medium text-forest">PHONE VERIFIED</p>}
        <ContactReveal userId={person.id} matched={!!state?.matched} />
        {person.compatibility && <Reasons reasons={person.compatibility.reasons} />}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={interest} className="btn-primary">
            {state?.matched ? 'Open chat' : state?.interested ? 'Interest sent' : 'Interested'}
          </button>
          <SaveButton kind="PERSON" targetId={person.id} hide={user?.id === person.id} variant="label" />
          {state?.conversationId && (
            <Link href={`/chat/${state.conversationId}`} className="btn-ghost">
              Chat
            </Link>
          )}
          <button onClick={block} className="text-sm text-muted">
            Block
          </button>
        </div>
      </div>
    </div>
  );
}
