'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { api, setToken } from '@/lib/api';
import { useAuth } from '@/lib/auth';

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, refresh } = useAuth();
  const [error, setError] = useState('');
  const phone = params.get('phone') || '';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const path = user ? '/auth/otp/link' : '/auth/otp/verify';
      const res = await api<{ accessToken: string }>(path, {
        method: 'POST',
        body: JSON.stringify({
          phone: data.get('phone'),
          code: data.get('code'),
          firstName: data.get('firstName'),
        }),
      });
      setToken(res.accessToken);
      await refresh();
      router.push(user?.onboardingDone ? '/discover' : '/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">Verify your phone</h1>
      <p className="mt-3 text-sm text-muted">Use 123456 in local development. Verified numbers get a trust mark on cards.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <input name="phone" defaultValue={phone} required placeholder="Mobile number" className="field" />
        <input name="code" required placeholder="OTP" className="field" />
        {!user && <input name="firstName" placeholder="First name (new accounts)" className="field" />}
        <button className="btn-primary w-full">Verify</button>
      </form>
      {error && <p className="mt-4 text-sm text-orange-700">{error}</p>}
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
