'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { prettyEnum } from '@/lib/format';

type VerificationRow = {
  id: string;
  kind: 'IDENTITY' | 'EMPLOYMENT' | 'PROPERTY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes: string | null;
  createdAt: string;
};

export default function KycPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    api<VerificationRow[]>('/kyc/mine').then(setRows).catch(() => undefined);
  }, [user]);

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <Link href="/login" className="text-clay">Sign in</Link> to submit verification.
      </p>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const row = await api<VerificationRow>('/kyc/submit', {
        method: 'POST',
        body: JSON.stringify({
          kind: data.get('kind'),
          notes: data.get('notes'),
          documentRef: data.get('documentRef'),
        }),
      });
      setRows((current) => [row, ...current]);
      setMessage('Submitted for review. Admin approval is required — this is a stub flow.');
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <Link href="/profile" className="text-sm text-muted hover:text-ink">← Profile</Link>
      <h1 className="mt-4 text-3xl font-semibold">Verification</h1>
      <p className="mt-2 text-sm text-muted">
        Submit identity or employment checks. Property owners can verify listings separately from listing edit pages.
      </p>

      <form onSubmit={onSubmit} className="panel mt-8 space-y-4 p-5">
        <select name="kind" className="field" required>
          <option value="IDENTITY">Government ID (Aadhaar / PAN stub)</option>
          <option value="EMPLOYMENT">Employment / college proof</option>
        </select>
        <input name="documentRef" placeholder="Reference ID (optional stub)" className="field" />
        <textarea name="notes" placeholder="Notes for reviewer" className="field min-h-24" />
        <button type="submit" className="btn-primary w-full">Submit for review</button>
      </form>

      {message && <p className="mt-4 text-sm text-forest">{message}</p>}
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}

      <div className="mt-10 space-y-3">
        <h2 className="text-lg font-semibold">Your submissions</h2>
        {!rows.length && <p className="text-sm text-muted">No verification requests yet.</p>}
        {rows.map((row) => (
          <div key={row.id} className="panel p-4 text-sm">
            <p className="font-medium">{prettyEnum(row.kind)}</p>
            <p className="mt-1 text-muted">Status: {prettyEnum(row.status)}</p>
            {row.notes && <p className="mt-2 text-ink/70">{row.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
