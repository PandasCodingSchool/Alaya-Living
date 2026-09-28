'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { api, setToken } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { homeForUser } from '@/lib/routes';

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const { user, refresh } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    api<{ ok: boolean }>('/auth/email/confirm', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then(async () => {
        setMessage('Email verified. You can close this tab or continue in the app.');
        if (user) await refresh();
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Invalid or expired link'));
  }, [token, user, refresh]);

  async function requestCode() {
    setSending(true);
    setError('');
    try {
      await api('/auth/email/request', { method: 'POST' });
      setMessage('Verification email sent. Use code 123456 in local development.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send email');
    } finally {
      setSending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError('');
    try {
      const res = await api<{ accessToken: string }>('/auth/email/verify', {
        method: 'POST',
        body: JSON.stringify({ code: data.get('code') }),
      });
      setToken(res.accessToken);
      const me = await refresh();
      router.push(homeForUser(me));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    }
  }

  if (user?.emailVerified) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <h1 className="text-3xl font-semibold">Email verified</h1>
        <p className="mt-3 text-sm text-muted">Your email is already verified.</p>
        <Link href="/profile" className="btn-primary mt-6">Back to profile</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <h1 className="text-3xl font-semibold">Verify your email</h1>
      <p className="mt-3 text-sm text-muted">
        {user?.email ? `We will send a code to ${user.email}.` : 'Sign in with an email account first.'}
        {' '}Use <strong>123456</strong> in local development.
      </p>

      {!token && user && (
        <>
          <button type="button" onClick={requestCode} disabled={sending} className="btn-ghost mt-6 w-full">
            {sending ? 'Sending…' : 'Send verification email'}
          </button>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input name="code" required placeholder="6-digit code" className="field" />
            <button className="btn-primary w-full">Verify email</button>
          </form>
        </>
      )}

      {!user && !token && (
        <p className="mt-6 text-sm">
          <Link href="/login" className="text-clay">Sign in</Link> to verify your email.
        </p>
      )}

      {message && <p className="mt-4 text-sm text-forest">{message}</p>}
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
