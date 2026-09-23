'use client';

import { LOCALITIES } from '@fmr/shared';
import { ChevronDown, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function LocationPicker() {
  const { user, refresh } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = user?.localities?.[0] || 'Set location';

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;

  async function choose(locality: string) {
    if (user.localities[0] === locality) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      const rest = user.localities.filter((item) => item !== locality);
      await api('/preferences', {
        method: 'PUT',
        body: JSON.stringify({ localities: [locality, ...rest] }),
      });
      await refresh();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={saving}
        className="inline-flex max-w-[7.5rem] items-center gap-1 rounded-full bg-[#FFE8F0] px-2.5 py-1.5 text-xs font-medium text-ink/80 hover:bg-[#FFD6E4] sm:max-w-[11rem] sm:px-3"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <MapPin className="h-3 w-3 shrink-0 text-clay" />
        <span className="truncate">{current}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-muted" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-2xl border border-sand bg-white p-2 shadow-panel">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Living area</p>
          {LOCALITIES.map((locality) => (
            <button
              key={locality}
              type="button"
              disabled={saving}
              onClick={() => choose(locality)}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
                user.localities[0] === locality ? 'bg-[#FFE8F0] font-semibold' : 'hover:bg-[#FFF1F5]'
              }`}
            >
              {locality}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
