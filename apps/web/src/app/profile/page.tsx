'use client';

import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { useAuth } from '@/lib/auth';
import { hourLabel, inr, prettyEnum } from '@/lib/format';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return <p className="px-5 py-16 text-center">Sign in to view your profile.</p>;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="panel p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} photoUrl={user.photoUrl} size={72} />
          <div>
        <h1 className="text-3xl font-semibold">{user.name}</h1>
        <p className="mt-1 text-sm text-muted">{user.occupation} · {user.city}</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="h-1.5 rounded bg-sand">
            <div className="h-1.5 rounded bg-forest" style={{ width: `${user.completion}%` }} />
          </div>
          <p className="mt-2 font-mono text-[11px] text-muted">PROFILE {user.completion}%</p>
        </div>
        <div className="mt-6 space-y-2 text-sm">
          <p>Office: {user.workLocation || '—'}</p>
          <p>Budget: {user.minBudget && user.maxBudget ? `${inr(user.minBudget)}–${inr(user.maxBudget)}` : '—'}</p>
          <p>Localities: {user.localities.join(', ')}</p>
          <p>Languages: {user.languages.join(', ')}</p>
          <p>Sleep: {hourLabel(user.sleepStart)} – {hourLabel(user.sleepEnd)}</p>
          <p>Food: {prettyEnum(user.foodPreference)}</p>
          <p>Phone: {user.phoneVerified ? 'Verified' : 'Not verified'}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Link href="/onboarding" className="btn-dark">Edit preferences</Link>
          {!user.phoneVerified && (
            <Link href="/verify-phone" className="btn-ghost">Verify phone</Link>
          )}
        </div>
      </div>
    </div>
  );
}
