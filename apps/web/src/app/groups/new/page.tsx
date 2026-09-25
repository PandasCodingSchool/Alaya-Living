'use client';

import { LOCALITIES } from '@fmr/shared';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function NewGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [localities, setLocalities] = useState<string[]>(user?.localities.slice(0, 2) ?? ['HSR']);
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const group = await api<{ id: string }>('/groups', {
        method: 'POST',
        body: JSON.stringify({
          title: data.get('title'),
          targetSize: Number(data.get('targetSize')),
          targetRentEach: Number(data.get('targetRentEach')),
          localities,
          moveInDate: data.get('moveInDate') || undefined,
          notes: data.get('notes') || undefined,
        }),
      });
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create group');
    }
  }

  function toggle(locality: string) {
    setLocalities((current) =>
      current.includes(locality) ? current.filter((item) => item !== locality) : [...current, locality],
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-5 sm:py-10">
      <Link href="/groups" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Groups
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Form a flat group</h1>
      <p className="mt-2 text-sm text-muted">Need three people for a 3BHK? Set the target size and rent per person.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="title" required placeholder="Group name, e.g. HSR 3BHK Oct move-in" className="field" />
        <div className="grid grid-cols-2 gap-3">
          <input name="targetSize" type="number" required min={2} max={6} defaultValue={3} placeholder="People needed" className="field" />
          <input name="targetRentEach" type="number" required min={5000} defaultValue={12000} placeholder="₹ / person" className="field" />
        </div>
        <input name="moveInDate" type="date" className="field" />
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Corridors</p>
          <div className="flex flex-wrap gap-2">
            {LOCALITIES.map((locality) => (
              <button
                key={locality}
                type="button"
                onClick={() => toggle(locality)}
                className={`rounded-full px-3 py-1.5 text-xs ${localities.includes(locality) ? 'bg-night text-white' : 'bg-[#FFE8F0]'}`}
              >
                {locality}
              </button>
            ))}
          </div>
        </div>
        <textarea name="notes" placeholder="Must be vegetarian, no smoking indoors…" className="field min-h-24 rounded-3xl py-3" />
        <button className="btn-primary w-full">Create group</button>
      </form>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
    </div>
  );
}
