'use client';

import { Flag } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';

const REASONS = [
  'Fake profile or listing',
  'Harassment or abuse',
  'Spam or scam',
  'Misleading photos or pricing',
  'Other',
];

export function ReportButton({
  targetKind,
  targetId,
  label = 'Report',
}: {
  targetKind: 'USER' | 'ROOM' | 'PG' | 'FLAT';
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await api('/reports', {
        method: 'POST',
        body: JSON.stringify({ targetKind, targetId, reason, details: details || undefined }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit report');
    }
  }

  if (done) {
    return <p className="text-sm text-forest">Report submitted. Our team will review it.</p>;
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-clay">
        <Flag className="h-3.5 w-3.5" />
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={submit} className="panel w-full max-w-md space-y-4 p-5">
            <h2 className="text-lg font-semibold">Report {targetKind.toLowerCase()}</h2>
            <p className="text-sm text-muted">Tell us what&apos;s wrong. Reports are reviewed by our team.</p>
            <select className="field" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <textarea
              className="field min-h-24 rounded-3xl py-3"
              placeholder="Additional details (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            {error && <p className="text-sm text-clay">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Submit report
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
