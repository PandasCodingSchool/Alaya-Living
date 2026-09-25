'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { api } from '@/lib/api';
import type { Profile } from '@/lib/types';

interface AdminUserRow {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  profile: Profile;
  isPremium: boolean;
  subscription: { planName: string; expiresAt: string; source: string } | null;
}

function UsersInner() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState(searchParams.get('q') || '');

  const status = searchParams.get('status') || '';
  const role = searchParams.get('role') || '';
  const premium = searchParams.get('premium') || '';
  const period = searchParams.get('period') || '';

  function load() {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (role) params.set('role', role);
    if (premium) params.set('premium', premium);
    if (period) params.set('period', period);
    if (q.trim()) params.set('q', q.trim());
    api<{ items: AdminUserRow[]; total: number }>(`/admin/users?${params}`)
      .then((data) => {
        setRows(data.items);
        setTotal(data.total);
        setError('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load users'));
  }

  useEffect(() => {
    load();
  }, [status, role, premium, period]);

  async function runAction(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    try {
      await action();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="mt-1 text-sm text-muted">{total} total</p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <input
            className="field py-2 text-sm"
            placeholder="Search name, email, phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn-ghost">
            Search
          </button>
        </form>
      </div>

      {(status || role || premium || period) && (
        <p className="mt-3 text-xs text-muted">
          Filters:
          {status && ` status=${status}`}
          {role && ` role=${role}`}
          {premium && ` premium=${premium}`}
          {period && ` period=${period}`}
        </p>
      )}

      {error && <p className="mt-4 text-sm text-orange-700">{error}</p>}

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="panel flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={row.profile.name} photoUrl={row.profile.photoUrl} size={40} />
              <div>
                <p className="font-medium">{row.profile.name}</p>
                <p className="text-xs text-muted">
                  {row.email || row.phone || 'No contact'} · {row.role} · {row.status}
                </p>
                <p className="text-xs text-muted">
                  Joined {new Date(row.createdAt).toLocaleDateString()}
                  {row.isPremium && row.subscription
                    ? ` · Premium until ${new Date(row.subscription.expiresAt).toLocaleDateString()} (${row.subscription.source})`
                    : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {row.isPremium ? (
                <button
                  type="button"
                  disabled={busy === `${row.id}-revoke`}
                  className="btn-ghost text-xs"
                  onClick={() =>
                    runAction(`${row.id}-revoke`, () => api(`/admin/users/${row.id}/premium`, { method: 'DELETE' }))
                  }
                >
                  Revoke premium
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy === `${row.id}-grant`}
                  className="btn-ghost text-xs"
                  onClick={() =>
                    runAction(`${row.id}-grant`, () => api(`/admin/users/${row.id}/premium`, { method: 'POST', body: '{}' }))
                  }
                >
                  Grant premium
                </button>
              )}
              {row.status === 'ACTIVE' ? (
                <button
                  type="button"
                  disabled={busy === `${row.id}-suspend` || row.role === 'ADMIN'}
                  className="btn-dark text-xs"
                  onClick={() =>
                    runAction(`${row.id}-suspend`, () => api(`/admin/users/${row.id}/suspend`, { method: 'POST' }))
                  }
                >
                  Suspend
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy === `${row.id}-restore`}
                  className="btn-dark text-xs"
                  onClick={() =>
                    runAction(`${row.id}-restore`, () => api(`/admin/users/${row.id}/restore`, { method: 'POST' }))
                  }
                >
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
        {!rows.length && <p className="py-10 text-center text-muted">No users match these filters.</p>}
      </div>
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading users…</p>}>
      <UsersInner />
    </Suspense>
  );
}
