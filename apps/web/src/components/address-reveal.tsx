'use client';

import { useEffect, useState } from 'react';
import { Lock, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

export interface AddressAccess {
  allowed: boolean;
  reason: 'NOT_MATCHED' | null;
  exactAddress: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function AddressReveal({
  endpoint,
  matched,
  ownerView = false,
}: {
  endpoint: string;
  matched: boolean;
  ownerView?: boolean;
}) {
  const [data, setData] = useState<AddressAccess | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ownerView || !matched) {
      setData(null);
      return;
    }
    api<AddressAccess>(endpoint)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load address'));
  }, [endpoint, matched, ownerView]);

  if (ownerView) {
    return (
      <div className="mt-5 rounded-2xl border border-sand bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Your listing</p>
        <p className="mt-2 text-sm text-muted">Seekers see locality only. Exact address unlocks after a mutual match.</p>
      </div>
    );
  }

  if (!matched) {
    return (
      <div className="mt-5 rounded-2xl border border-sand bg-[#FFF8F4] p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Lock className="h-4 w-4 text-clay" />
          Exact address hidden
        </p>
        <p className="mt-1 text-sm text-muted">Full address and map pin unlock only after you both match.</p>
      </div>
    );
  }

  if (!data) {
    return <p className="mt-5 text-sm text-muted">{error || 'Checking address access…'}</p>;
  }

  if (!data.allowed) {
    return (
      <div className="mt-5 rounded-2xl border border-sand bg-[#FFF8F4] p-4">
        <p className="text-sm text-muted">Exact address stays hidden until you both match.</p>
      </div>
    );
  }

  const mapsUrl =
    data.latitude != null && data.longitude != null
      ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
      : data.exactAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.exactAddress)}`
        : null;

  return (
    <div className="mt-5 rounded-2xl border border-sand bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Matched address</p>
      <p className="mt-2 flex items-start gap-2 text-sm">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
        {data.exactAddress || 'Exact address not on file — use chat to coordinate.'}
      </p>
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn-ghost mt-3 inline-flex text-sm">
          Open in Maps
        </a>
      )}
    </div>
  );
}
