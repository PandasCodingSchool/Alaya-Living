'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Clock } from 'lucide-react';
import { api } from '@/lib/api';

type VerificationRow = {
  id: string;
  kind: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pgListingId?: string | null;
  flatListingId?: string | null;
};

export function PropertyVerifyButton({
  pgListingId,
  flatListingId,
  propertyVerified,
}: {
  pgListingId?: string;
  flatListingId?: string;
  propertyVerified?: boolean;
}) {
  const [status, setStatus] = useState<'none' | 'PENDING' | 'APPROVED' | 'REJECTED'>('none');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<VerificationRow[]>('/kyc/mine')
      .then((rows) => {
        const match = rows.find(
          (row) =>
            row.kind === 'PROPERTY' &&
            ((pgListingId && row.pgListingId === pgListingId) ||
              (flatListingId && row.flatListingId === flatListingId)),
        );
        if (match) setStatus(match.status);
        else if (propertyVerified) setStatus('APPROVED');
      })
      .catch(() => undefined);
  }, [pgListingId, flatListingId, propertyVerified]);

  async function submit() {
    setLoading(true);
    setMessage('');
    try {
      const row = await api<VerificationRow>('/kyc/submit', {
        method: 'POST',
        body: JSON.stringify({
          kind: 'PROPERTY',
          pgListingId,
          flatListingId,
          notes: 'Property verification requested from listing edit',
        }),
      });
      setStatus(row.status);
      setMessage('Submitted for admin review.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not submit verification');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'APPROVED' || propertyVerified) {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-[#D8F0E3] bg-[#F3FBF6] px-4 py-3 text-sm text-forest">
        <BadgeCheck className="h-4 w-4" />
        Property verified on this listing
      </p>
    );
  }

  if (status === 'PENDING') {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-sand bg-[#FFF8F4] px-4 py-3 text-sm">
        <Clock className="h-4 w-4 text-clay" />
        Property verification pending admin review
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-sand bg-white p-4">
      <p className="text-sm font-medium">Verify this property</p>
      <p className="mt-1 text-sm text-muted">Submit ownership proof for admin review. Verified listings show a trust badge.</p>
      <button type="button" onClick={submit} disabled={loading} className="btn-ghost mt-3">
        {loading ? 'Submitting…' : 'Request property verification'}
      </button>
      {message && <p className="mt-2 text-sm text-muted">{message}</p>}
    </div>
  );
}
