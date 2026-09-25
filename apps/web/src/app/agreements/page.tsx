'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import type { Agreement } from '@/lib/types';

export default function AgreementsPage() {
  const [rows, setRows] = useState<Agreement[] | null>(null);

  useEffect(() => {
    api<Agreement[]>('/agreements').then(setRows).catch(() => setRows([]));
  }, []);

  if (!rows) return <p className="px-5 py-16 text-center text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <p className="text-sm text-muted"><Link href="/living" className="text-clay">Living</Link> · Agreements</p>
      <h1 className="mt-2 text-3xl font-semibold">Roommate agreements</h1>
      <p className="mt-2 text-sm text-muted">Start one from a mutual match. Both people must confirm.</p>
      <div className="mt-8 space-y-3">
        {rows.map((row) => (
          <Link key={row.id} href={`/agreements/${row.id}`} className="panel block px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{row.other.name}</p>
                <p className="text-sm text-muted">{inr(row.rentEach)} each · {row.quietHours}</p>
              </div>
              <span className="chip">{row.waitingOnMe ? 'Your turn' : row.status}</span>
            </div>
          </Link>
        ))}
        {!rows.length && (
          <p className="text-sm text-muted">
            No agreements yet. Open a mutual match and tap Create agreement.
          </p>
        )}
      </div>
    </div>
  );
}
