'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import type { Profile } from '@/lib/types';

interface AdminSubscription {
  id: string;
  userId: string;
  user: Profile;
  email: string | null;
  planName: string;
  planId: string | null;
  status: string;
  source: string;
  amountPaise: number;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

interface AdminPlan {
  id: string;
  name: string;
  description: string | null;
  amountPaise: number;
  amountInr: number;
  durationDays: number;
  active: boolean;
  subscriberCount: number;
}

function SubscriptionsInner() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || '';
  const [tab, setTab] = useState<'subscriptions' | 'plans'>('subscriptions');
  const [rows, setRows] = useState<AdminSubscription[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [planForm, setPlanForm] = useState({ name: '', description: '', amountInr: '299', durationDays: '30' });
  const [busy, setBusy] = useState(false);

  function loadSubs() {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    api<{ items: AdminSubscription[]; total: number }>(`/admin/subscriptions?${params}`)
      .then((data) => {
        setRows(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load subscriptions'));
  }

  function loadPlans() {
    api<AdminPlan[]>('/admin/plans')
      .then(setPlans)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load plans'));
  }

  useEffect(() => {
    loadSubs();
    loadPlans();
  }, [status]);

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/admin/plans', {
        method: 'POST',
        body: JSON.stringify({
          name: planForm.name,
          description: planForm.description || undefined,
          amountPaise: Math.round(Number(planForm.amountInr) * 100),
          durationDays: Number(planForm.durationDays),
        }),
      });
      setPlanForm({ name: '', description: '', amountInr: '299', durationDays: '30' });
      loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create plan');
    } finally {
      setBusy(false);
    }
  }

  async function togglePlan(id: string, active: boolean) {
    await api(`/admin/plans/${id}`, { method: 'PATCH', body: JSON.stringify({ active: !active }) });
    loadPlans();
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Subscriptions & plans</h2>
          <p className="mt-1 text-sm text-muted">{total} subscription records</p>
        </div>
        <div className="grid grid-cols-2 rounded-full bg-[#FFE8F0] p-1 text-sm">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 ${tab === 'subscriptions' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`}
            onClick={() => setTab('subscriptions')}
          >
            Subscriptions
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 ${tab === 'plans' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`}
            onClick={() => setTab('plans')}
          >
            Plans
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-orange-700">{error}</p>}

      {tab === 'subscriptions' && (
        <div className="mt-6 space-y-3">
          {status && <p className="text-xs text-muted">Showing status: {status}</p>}
          {rows.map((row) => (
            <div key={row.id} className="panel flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={row.user.name} photoUrl={row.user.photoUrl} size={40} />
                <div>
                  <p className="font-medium">{row.user.name}</p>
                  <p className="text-xs text-muted">
                    {row.planName} · {inr(row.amountPaise / 100)} · {row.status} · {row.source}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(row.startsAt).toLocaleDateString()} → {new Date(row.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted">{row.email || 'No email'}</p>
            </div>
          ))}
          {!rows.length && <p className="py-10 text-center text-muted">No subscriptions yet.</p>}
        </div>
      )}

      {tab === 'plans' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {plan.name} {!plan.active && <span className="text-xs text-muted">(inactive)</span>}
                    </p>
                    {plan.description && <p className="mt-1 text-sm text-muted">{plan.description}</p>}
                    <p className="mt-2 text-sm">
                      {inr(plan.amountInr)} / {plan.durationDays} days · {plan.subscriberCount} subscribers
                    </p>
                  </div>
                  <button type="button" className="btn-ghost text-xs" onClick={() => togglePlan(plan.id, plan.active)}>
                    {plan.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={createPlan} className="panel h-fit space-y-3 p-5">
            <p className="text-sm font-semibold">New plan</p>
            <input
              className="field py-2 text-sm"
              placeholder="Plan name"
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              required
            />
            <textarea
              className="field py-2 text-sm"
              placeholder="Description"
              value={planForm.description}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
            />
            <input
              type="number"
              className="field py-2 text-sm"
              placeholder="Price ₹"
              value={planForm.amountInr}
              onChange={(e) => setPlanForm({ ...planForm, amountInr: e.target.value })}
              required
            />
            <input
              type="number"
              className="field py-2 text-sm"
              placeholder="Duration (days)"
              value={planForm.durationDays}
              onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })}
              required
            />
            <button type="submit" disabled={busy} className="btn-primary w-full">
              Create plan
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default function AdminSubscriptionsPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <SubscriptionsInner />
    </Suspense>
  );
}
