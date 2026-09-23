'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import { apiUpload } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { hourLabel, inr, prettyEnum } from '@/lib/format';

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <p className="px-5 py-16 text-center">Sign in to view your profile.</p>;

  async function onPhoto(file?: File) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await apiUpload('/users/me/photo', file);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="panel p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={user.name} photoUrl={user.photoUrl} size={72} />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-night text-white shadow"
              aria-label="Upload profile photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onPhoto(event.target.files?.[0])}
            />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">{user.name}</h1>
            <p className="mt-1 text-sm text-muted">{user.occupation} · {user.city}</p>
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 text-sm font-medium text-clay" disabled={uploading}>
              {uploading ? 'Uploading…' : user.photoUrl ? 'Change photo' : 'Upload photo'}
            </button>
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
        {error && <p className="mt-4 text-sm text-clay">{error}</p>}
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
