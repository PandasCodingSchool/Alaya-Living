'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import type { Agreement } from '@/lib/types';

export default function AgreementPage() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<Agreement | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    api<Agreement>(`/agreements/${params.id}`).then(setRow).catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function confirm() {
    setRow(await api<Agreement>(`/agreements/${params.id}/confirm`, { method: 'POST' }));
  }

  async function cancel() {
    setRow(await api<Agreement>(`/agreements/${params.id}/cancel`, { method: 'POST' }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      setRow(await api<Agreement>(`/agreements/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          rentEach: Number(data.get('rentEach')),
          electricity: data.get('electricity'),
          internet: data.get('internet'),
          cleaning: data.get('cleaning'),
          groceries: data.get('groceries'),
          guests: data.get('guests'),
          quietHours: data.get('quietHours'),
          notes: data.get('notes') || undefined,
        }),
      }));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!row) return <p className="px-5 py-16 text-center text-muted">{error || 'Loading…'}</p>;

  const lines = [
    ['Rent', `${inr(row.rentEach)} each`],
    ['Electricity', row.electricity],
    ['Internet', row.internet],
    ['Cleaning', row.cleaning],
    ['Groceries', row.groceries],
    ['Guests', row.guests],
    ['Quiet hours', row.quietHours],
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-5 sm:py-10">
      <p className="text-sm text-muted"><Link href="/agreements" className="text-clay">Agreements</Link></p>
      <h1 className="mt-2 text-3xl font-semibold">Agreement with {row.other.name}</h1>
      <p className="mt-2 text-sm text-muted">Both of you confirm. This is not a lease — it is how you plan to live.</p>

      {row.status === 'PENDING' && editing ? (
        <form onSubmit={save} className="panel mt-6 space-y-4 p-5">
          <label className="block text-sm">
            <span className="text-muted">Rent each (₹)</span>
            <input name="rentEach" type="number" required min={1000} defaultValue={row.rentEach} className="field mt-1" />
          </label>
          {(['electricity', 'internet', 'cleaning', 'groceries', 'guests', 'quietHours'] as const).map((field) => (
            <label key={field} className="block text-sm capitalize">
              <span className="text-muted">{field === 'quietHours' ? 'Quiet hours' : field}</span>
              <input name={field} required defaultValue={row[field]} className="field mt-1" />
            </label>
          ))}
          <label className="block text-sm">
            <span className="text-muted">Notes</span>
            <textarea name="notes" defaultValue={row.notes ?? ''} rows={3} className="field mt-1" />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost">Cancel edit</button>
          </div>
        </form>
      ) : (
        <>
          <div className="panel mt-6 divide-y divide-sand">
            {lines.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-5 py-3 text-sm">
                <span className="text-muted">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
          {row.notes && <p className="mt-4 text-sm text-muted">{row.notes}</p>}
        </>
      )}

      <p className="mt-6 text-sm">
        Status: <span className="font-semibold">{row.status}</span>
        {row.waitingOnMe ? ' · waiting on you' : ''}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {row.status === 'PENDING' && !editing && (
          <>
            <button type="button" onClick={confirm} className="btn-primary">
              {row.waitingOnMe ? 'I agree' : 'Confirm again'}
            </button>
            <button type="button" onClick={() => setEditing(true)} className="btn-ghost">Edit terms</button>
          </>
        )}
        {row.status !== 'CANCELLED' && (
          <button type="button" onClick={cancel} className="btn-ghost">Cancel agreement</button>
        )}
      </div>
    </div>
  );
}
