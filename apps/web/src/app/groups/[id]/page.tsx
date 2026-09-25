'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { FlatCard } from '@/components/flat-card';
import { PgCard } from '@/components/pg-card';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import type { FlatGroup } from '@/lib/types';

export default function GroupPage() {
  const params = useParams<{ id: string }>();
  const [group, setGroup] = useState<FlatGroup | null>(null);
  const [error, setError] = useState('');

  function load() {
    api<FlatGroup>(`/groups/${params.id}`)
      .then(setGroup)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function accept() {
    setGroup(await api<FlatGroup>(`/groups/${params.id}/accept`, { method: 'POST' }));
  }

  async function decline() {
    window.location.href = '/groups';
  }

  async function invite(userId: string) {
    setGroup(await api<FlatGroup>(`/groups/${params.id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }));
  }

  async function searchPgs() {
    setGroup(await api<FlatGroup>(`/groups/${params.id}/search`, { method: 'POST' }));
  }

  async function closeGroup() {
    await api(`/groups/${params.id}/close`, { method: 'POST' });
    load();
  }

  if (!group) return <p className="px-5 py-16 text-center text-muted">{error || 'Loading…'}</p>;

  const joined = group.members.filter((m) => m.status === 'JOINED').length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
      <p className="text-sm text-muted"><Link href="/groups" className="text-clay">Groups</Link></p>
      <h1 className="mt-2 text-3xl font-semibold">{group.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {joined}/{group.targetSize} joined · {inr(group.targetRentEach)} each · {inr(group.combinedBudget)} combined · {group.status}
      </p>
      <p className="mt-1 text-sm text-muted">{group.localities.join(', ')}</p>

      {group.myStatus === 'INVITED' && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={accept} className="btn-primary">Accept invite</button>
          <button type="button" onClick={decline} className="btn-ghost">Decline</button>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Members</h2>
        <div className="mt-4 space-y-2">
          {group.members.map((member) => (
            <div key={member.user.id} className="panel flex items-center gap-3 px-4 py-3">
              <Avatar name={member.user.name} photoUrl={member.user.photoUrl} size={40} />
              <div className="flex-1">
                <p className="font-medium">{member.user.name}</p>
                <p className="text-xs text-muted">{member.role} · {member.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {group.myStatus === 'JOINED' && joined < group.targetSize && group.suggestedPeople && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Invite compatible people</h2>
          <div className="mt-4 space-y-2">
            {group.suggestedPeople.map((person) => (
              <div key={person.id} className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={person.name} photoUrl={person.photoUrl} size={40} />
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-xs text-muted">{person.occupation} · {person.localities.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
                <button type="button" onClick={() => invite(person.id)} className="btn-primary px-4 py-2 text-sm">
                  Invite
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {group.myStatus === 'JOINED' && (
        <>
          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Flats for your group</h2>
              <Link href="/flats" className="btn-ghost">Browse all flats</Link>
            </div>
            <p className="mt-2 text-sm text-muted">
              {group.targetSize === 2 ? '2 BHK' : '3 BHK'} listings under {inr(group.targetSize * group.targetRentEach)} combined budget.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {group.suggestedFlats?.map((flat) => (
                <FlatCard key={flat.id} flat={flat} groupSize={group.targetSize} />
              ))}
            </div>
            {!group.suggestedFlats?.length && (
              <p className="mt-4 text-sm text-muted">No flats under your combined budget yet. Widen localities or raise the per-person target.</p>
            )}
          </section>
          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">PGs for your budget</h2>
              <button type="button" onClick={searchPgs} className="btn-ghost">Refresh search</button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {group.suggestedPgs?.map((pg) => <PgCard key={pg.id} pg={pg} />)}
            </div>
            {!group.suggestedPgs?.length && (
              <p className="mt-4 text-sm text-muted">No PG beds under your combined budget yet. Widen localities or raise the per-person target.</p>
            )}
          </section>
        </>
      )}

      {group.isOwner && group.status !== 'CLOSED' && (
        <button type="button" onClick={closeGroup} className="btn-ghost mt-10 text-clay">
          Close group
        </button>
      )}
    </div>
  );
}
