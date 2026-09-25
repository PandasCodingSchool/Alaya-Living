'use client';

import Link from 'next/link';
import { Building2, FileText, Home, RefreshCw, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const tiles = [
  {
    href: '/agreements',
    icon: FileText,
    title: 'Agreements',
    copy: 'After a mutual match, write the rent split, utilities, guests and quiet hours. Both people confirm.',
  },
  {
    href: '/groups',
    icon: Users,
    title: 'Flat formation',
    copy: 'Need 3 people for a 3BHK? Form a group, invite compatible people, then search flats and PGs together.',
  },
  {
    href: '/flats',
    icon: Home,
    title: 'Flat discovery',
    copy: 'Browse 2BHK and 3BHK listings by corridor and budget — ideal when your group is ready to rent together.',
  },
  {
    href: '/replacements',
    icon: RefreshCw,
    title: 'Replacement roommate',
    copy: 'Someone is leaving. Keep the room, find a compatible person for the same budget and corridor.',
  },
  {
    href: '/pgs',
    icon: Building2,
    title: 'PG marketplace',
    copy: 'Beds with meals, gender policy and sharing permission — not a roommate share of your own room.',
  },
];

const operatorTile = {
  href: '/operator',
  icon: Building2,
  title: 'Operator dashboard',
  copy: 'Manage PG listings, beds, pricing, and inquiries in one place.',
};

export default function LivingPage() {
  const { user } = useAuth();
  const [invites, setInvites] = useState(0);

  useEffect(() => {
    if (!user) return;
    api<{ myStatus: string }[]>('/groups')
      .then((rows) => setInvites(rows.filter((row) => row.myStatus === 'INVITED').length))
      .catch(() => undefined);
  }, [user]);

  if (!user) {
    return (
      <p className="px-5 py-16 text-center">
        <a href="/login" className="text-clay">Sign in</a> to form a flat, list a PG, or write an agreement.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
      <h1 className="text-3xl font-semibold">Living</h1>
      <p className="mt-2 text-sm text-muted">
        Beyond discovery: agreements, groups, replacements, and PGs with beds to fill.
      </p>
      {invites > 0 && (
        <Link href="/groups" className="mt-4 block rounded-2xl bg-[#FFE8F0] px-4 py-3 text-sm font-medium text-ink">
          You have {invites} group invite{invites === 1 ? '' : 's'} waiting.
        </Link>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(user.role === 'PG_OWNER'
          ? [operatorTile]
          : user.role === 'ADMIN'
            ? [operatorTile, ...tiles]
            : tiles
        ).map((tile) => (
          <Link key={tile.href} href={tile.href} className="panel p-5 hover:border-clay/40">
            <tile.icon className="h-5 w-5 text-clay" />
            <h2 className="mt-3 text-lg font-semibold">{tile.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{tile.copy}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
