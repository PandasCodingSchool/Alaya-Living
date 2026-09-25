'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { Logo } from '@/components/logo';
import { api, setToken } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { homeForUser } from '@/lib/routes';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const pgOwner = searchParams.get('as') === 'pg-owner';

  async function onEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const res = await api<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: data.get('email'),
          password: data.get('password'),
        }),
      });
      setToken(res.accessToken);
      const me = await refresh();
      router.push(homeForUser(me));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  async function onPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const phone = String(data.get('phone'));
    try {
      await api('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) });
      router.push(`/verify-phone?phone=${phone}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send OTP');
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-roommates.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-night/55" />
        <div className="relative flex h-full flex-col justify-between px-10 py-10 text-white">
        <Logo href="/" light />
        <div>
          <p className="text-4xl font-semibold leading-tight">
            Chat stays locked until both people say yes.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">
            Email or phone OTP. Seed walkthrough: arjun@fmr.test / Password123!
          </p>
        </div>
        <p className="text-[11px] font-semibold text-white/60">BENGALURU MVP</p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-5 py-16 lg:px-16">
        <div className="lg:hidden">
          <Logo href="/" />
        </div>
        <h1 className="mt-8 text-3xl font-semibold">{pgOwner ? 'PG operator sign in' : 'Sign in to Alaya'}</h1>
        {pgOwner && (
          <p className="mt-2 text-sm text-muted">
            Use the same account you created as a PG operator. You&apos;ll land on your dashboard.
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 rounded-full bg-[#FFE8F0] p-1 text-sm">
          <button className={`rounded-full py-2 ${mode === 'email' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`} onClick={() => setMode('email')}>
            Email
          </button>
          <button className={`rounded-full py-2 ${mode === 'phone' ? 'bg-white font-medium shadow-sm' : 'text-muted'}`} onClick={() => setMode('phone')}>
            Phone OTP
          </button>
        </div>
        {mode === 'email' ? (
          <form onSubmit={onEmail} className="mt-6 space-y-3">
            <input name="email" type="email" required placeholder="Email" className="field" />
            <input name="password" type="password" required placeholder="Password" className="field" />
            <button className="btn-primary w-full">Continue</button>
          </form>
        ) : (
          <form onSubmit={onPhone} className="mt-6 space-y-3">
            <input name="phone" required placeholder="10-digit mobile" className="field" />
            <button className="btn-primary w-full">Send OTP</button>
            <p className="text-xs text-muted">Local/dev OTP is 123456.</p>
          </form>
        )}
        {error && <p className="mt-4 text-sm text-orange-700">{error}</p>}
        <p className="mt-6 text-sm text-muted">
          New here?{' '}
          <Link href={pgOwner ? '/register?as=pg-owner' : '/register'} className="text-clay">
            {pgOwner ? 'Create a PG operator account' : 'Create a living profile'}
          </Link>
        </p>
        {!pgOwner && (
          <p className="mt-3 text-sm text-muted">
            List PG beds?{' '}
            <Link href="/login?as=pg-owner" className="text-clay">PG operator sign in</Link>
            {' · '}
            <Link href="/register?as=pg-owner" className="text-clay">Register as PG operator</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-muted">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
