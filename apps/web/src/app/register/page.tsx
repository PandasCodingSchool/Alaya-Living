'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Logo } from '@/components/logo';
import { api, setToken } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const res = await api<{ accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: data.get('firstName'),
          email: data.get('email'),
          password: data.get('password'),
        }),
      });
      setToken(res.accessToken);
      await refresh();
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register');
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/room-hsr.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-night/55" />
        <div className="relative flex h-full flex-col justify-between px-10 py-10 text-white">
        <Logo href="/" light />
        <div>
          <p className="text-4xl font-semibold leading-tight">
            A living profile first. Listings second.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/60">
            <li>Tell us if you have a room or need one</li>
            <li>Set budget, corridor and lifestyle</li>
            <li>See why someone matches — then decide</li>
          </ul>
        </div>
        <p className="text-[11px] font-semibold text-white/60">NO PAYMENTS · NO BROKERS · MVP</p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-5 py-16 lg:px-16">
        <div className="lg:hidden">
          <Logo href="/" />
        </div>
        <h1 className="mt-8 text-3xl font-semibold">Join Alaya</h1>
        <p className="mt-2 text-sm text-muted">Takes a few minutes. You can list a room after onboarding.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <input name="firstName" required placeholder="First name" className="field" />
          <input name="email" type="email" required placeholder="Work or personal email" className="field" />
          <input name="password" type="password" minLength={8} required placeholder="Password (8+ characters)" className="field" />
          <button className="btn-primary w-full">Continue to onboarding</button>
        </form>
        {error && <p className="mt-4 text-sm text-orange-700">{error}</p>}
        <p className="mt-6 text-sm text-muted">
          Already have an account? <Link href="/login" className="text-clay">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
