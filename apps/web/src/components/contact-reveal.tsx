'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Lock, Phone, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import type { ContactAccess } from '@/lib/types';

export function ContactReveal({ userId, matched }: { userId: string; matched: boolean }) {
  const [data, setData] = useState<ContactAccess | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!matched) {
      setData(null);
      return;
    }
    api<ContactAccess>(`/contact/${userId}`)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load contact'));
  }, [userId, matched]);

  if (!matched) {
    return (
      <div className="mt-5 rounded-2xl border border-sand bg-[#FFF8F4] p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Lock className="h-4 w-4 text-clay" />
          Contact stays hidden
        </p>
        <p className="mt-1 text-sm text-muted">Phone and email unlock only after both of you match. Chat first.</p>
      </div>
    );
  }

  if (!data) {
    return <p className="mt-5 text-sm text-muted">{error || 'Checking contact access…'}</p>;
  }

  if (!data.allowed && data.reason === 'PREMIUM_REQUIRED') {
    return (
      <div className="mt-5 rounded-2xl border border-sand bg-[#FFF8F4] p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Lock className="h-4 w-4 text-clay" />
          Free contact unlocks used
        </p>
        <p className="mt-1 text-sm text-muted">
          The first {data.membership.freeLimit} matches include phone and email. Unlock Alaya Premium to see this contact.
        </p>
        <Link href="/premium" className="btn-primary mt-4">
          See Premium
        </Link>
      </div>
    );
  }

  if (!data.allowed) {
    return (
      <div className="mt-5 rounded-2xl border border-sand bg-[#FFF8F4] p-4">
        <p className="text-sm text-muted">Contact stays hidden until you both match.</p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-sand bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Matched contact</p>
      <p className="mt-2 flex items-center gap-2 text-sm">
        <Phone className="h-4 w-4 text-clay" />
        {data.phone || 'No phone on file'}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm">
        <Mail className="h-4 w-4 text-clay" />
        {data.email || 'No email on file'}
      </p>
    </div>
  );
}
