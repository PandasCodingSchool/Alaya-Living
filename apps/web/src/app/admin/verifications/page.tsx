'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { prettyEnum } from '@/lib/format';

type VerificationRow = {
  id: string;
  kind: string;
  status: string;
  notes: string | null;
  documentRef: string | null;
  createdAt: string;
  user: { profile: { firstName: string } | null };
  pgListing: { title: string; locality: string } | null;
  flatListing: { title: string; locality: string } | null;
};

export default function AdminVerificationsPage() {
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setRows(await api<VerificationRow[]>('/admin/verifications'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load queue');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function review(id: string, approve: boolean) {
    await api(`/admin/verifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ approve }),
    });
    await load();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">Verification queue</h2>
      <p className="mt-1 text-sm text-muted">Approve or reject KYC stub submissions.</p>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
      <div className="mt-6 space-y-4">
        {!rows.length && <p className="text-sm text-muted">No pending verifications.</p>}
        {rows.map((row) => (
          <article key={row.id} className="panel p-5">
            <p className="font-semibold">{row.user.profile?.firstName || 'User'} · {prettyEnum(row.kind)}</p>
            <p className="mt-1 text-sm text-muted">
              {row.pgListing ? `PG: ${row.pgListing.title} (${row.pgListing.locality})` : null}
              {row.flatListing ? `Flat: ${row.flatListing.title} (${row.flatListing.locality})` : null}
              {!row.pgListing && !row.flatListing ? 'Profile verification' : null}
            </p>
            {row.documentRef && <p className="mt-2 text-sm">Ref: {row.documentRef}</p>}
            {row.notes && <p className="mt-2 text-sm text-ink/70">{row.notes}</p>}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => review(row.id, true)} className="btn-primary">Approve</button>
              <button type="button" onClick={() => review(row.id, false)} className="btn-ghost">Reject</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
