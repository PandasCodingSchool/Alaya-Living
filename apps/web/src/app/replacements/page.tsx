'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import type { ReplacementPost } from '@/lib/types';

export default function ReplacementsPage() {
  const [rows, setRows] = useState<ReplacementPost[] | null>(null);

  useEffect(() => {
    api<ReplacementPost[]>('/replacements').then(setRows).catch(() => setRows([]));
  }, []);

  if (!rows) return <p className="px-5 py-16 text-center text-muted">Loading…</p>;

  const open = rows.filter((row) => row.status === 'OPEN');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted"><Link href="/living" className="text-clay">Living</Link> · Replacement</p>
          <h1 className="mt-1 text-3xl font-semibold">Replacement roommate</h1>
          <p className="mt-2 text-sm text-muted">Someone is leaving — keep the room and find a compatible person for the same split.</p>
        </div>
        <Link href="/replacements/new" className="btn-primary">Post a vacancy</Link>
      </div>
      <div className="mt-8 space-y-3">
        {open.map((row) => (
          <Link key={row.id} href={`/replacements/${row.id}`} className="panel block px-4 py-4">
            <p className="font-semibold">{row.departingName} leaving · {row.room.locality}</p>
            <p className="text-sm text-muted">
              {inr(row.room.roommateContribution)} / person · leave {new Date(row.leaveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
            {row.mine && <span className="chip mt-2">Your post</span>}
          </Link>
        ))}
        {!open.length && (
          <p className="text-sm text-muted">No open replacement posts. Start one from your room listing.</p>
        )}
      </div>
    </div>
  );
}
