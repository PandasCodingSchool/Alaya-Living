'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import type { FlatGroup } from '@/lib/types';

export default function GroupsPage() {
  const [rows, setRows] = useState<FlatGroup[] | null>(null);

  useEffect(() => {
    api<FlatGroup[]>('/groups').then(setRows).catch(() => setRows([]));
  }, []);

  if (!rows) return <p className="px-5 py-16 text-center text-muted">Loading…</p>;

  const invites = rows.filter((row) => row.myStatus === 'INVITED');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted"><Link href="/living" className="text-clay">Living</Link> · Flat formation</p>
          <h1 className="mt-1 text-3xl font-semibold">Your groups</h1>
          <p className="mt-2 text-sm text-muted">Form 2–6 people, then search PGs that fit your combined budget.</p>
        </div>
        <Link href="/groups/new" className="btn-primary">Start a group</Link>
      </div>

      {invites.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Invites</h2>
          {invites.map((row) => (
            <Link key={row.id} href={`/groups/${row.id}`} className="panel block px-4 py-4">
              <p className="font-semibold">{row.title}</p>
              <p className="text-sm text-muted">{inr(row.targetRentEach)} each · {row.localities.join(', ')}</p>
              <span className="chip mt-2">Tap to accept or decline</span>
            </Link>
          ))}
        </section>
      )}

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Active groups</h2>
        {rows.filter((row) => row.myStatus !== 'INVITED').map((row) => {
          const joined = row.members.filter((m) => m.status === 'JOINED').length;
          return (
            <Link key={row.id} href={`/groups/${row.id}`} className="panel block px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{row.title}</p>
                  <p className="text-sm text-muted">
                    {joined}/{row.targetSize} joined · {inr(row.combinedBudget)} combined · {row.status}
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {row.members.filter((m) => m.status === 'JOINED').slice(0, 3).map((m) => (
                    <Avatar key={m.user.id} name={m.user.name} photoUrl={m.user.photoUrl} size={32} />
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
        {!rows.length && (
          <p className="text-sm text-muted">No groups yet. Start one if you need flatmates for a 2BHK or 3BHK.</p>
        )}
      </section>
    </div>
  );
}
