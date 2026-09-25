'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Membership } from '@/lib/types';

interface CheckoutSession {
  mode: 'demo' | 'razorpay';
  keyId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { email?: string; name?: string };
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PremiumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user) return;
    api<Membership>('/membership').then(setMembership);
  }, [user]);

  async function activateDemo() {
    try {
      const next = await api<Membership>('/membership/activate', { method: 'POST' });
      setMembership(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not activate');
    }
  }

  async function checkout() {
    setPaying(true);
    setError('');
    try {
      const session = await api<CheckoutSession>('/membership/checkout', { method: 'POST' });
      if (session.mode === 'demo') {
        await activateDemo();
        return;
      }
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Could not load payment gateway');
      }
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: session.keyId,
          amount: session.amount,
          currency: session.currency,
          name: session.name,
          description: session.description,
          order_id: session.orderId,
          prefill: session.prefill,
          theme: { color: '#C45C4A' },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const next = await api<Membership>('/membership/verify', {
                method: 'POST',
                body: JSON.stringify(response),
              });
              setMembership(next);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        });
        rzp.open();
      });
    } catch (err) {
      if (err instanceof Error && err.message !== 'Payment cancelled') {
        setError(err.message);
      }
    } finally {
      setPaying(false);
    }
  }

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to manage Premium.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">Alaya Premium</p>
      <h1 className="mt-3 text-3xl font-semibold">See contact after you match</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Chat is always free after a mutual match. Phone and email stay hidden until then.
        The first {membership?.freeLimit ?? 3} matches include contact unlock. After that, Premium is required.
      </p>
      <div className="panel mt-8 space-y-3 p-5 text-sm">
        <p>Matches so far: {membership?.matchCount ?? '—'}</p>
        <p>Free contact unlocks left: {membership?.isPremium ? 'Unlimited' : membership?.freeRemaining ?? '—'}</p>
        <p>Status: {membership?.isPremium ? 'Premium active' : 'Free plan'}</p>
        {!membership?.isPremium && (
          <p className="font-medium text-ink">
            ₹{membership?.premiumAmountInr ?? 299}/month
            {membership?.paymentsEnabled ? ' · pay with Razorpay' : ' · demo mode (no card charged)'}
          </p>
        )}
      </div>
      {membership?.isPremium ? (
        <button onClick={() => router.back()} className="btn-dark mt-6">
          Back to your match
        </button>
      ) : (
        <button onClick={checkout} disabled={paying} className="btn-primary mt-6">
          {paying ? 'Opening checkout…' : membership?.paymentsEnabled ? 'Pay with Razorpay' : 'Activate Premium (demo)'}
        </button>
      )}
      {error && <p className="mt-3 text-sm text-clay">{error}</p>}
    </div>
  );
}
