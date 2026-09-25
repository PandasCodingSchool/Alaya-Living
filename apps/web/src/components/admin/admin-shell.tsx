'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

const links = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/subscriptions', label: 'Subscriptions' },
  { href: '/admin/pg-owners', label: 'PG owners' },
  { href: '/admin/revenue', label: 'Revenue' },
  { href: '/admin/reports', label: 'Reports' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const allowed = user?.role === 'ADMIN';

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!allowed) router.replace('/discover');
  }, [user, loading, allowed, router]);

  if (loading || !user) {
    return <p className="px-5 py-16 text-center text-muted">Loading…</p>;
  }
  if (!allowed) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Platform control</h1>
      </div>
      <nav className="mt-6 flex flex-wrap gap-2">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm ${
                active ? 'bg-night text-white font-medium' : 'bg-[#FFE8F0] text-ink hover:bg-[#FFD6E4]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
