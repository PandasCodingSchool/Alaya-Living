'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Compass, Heart, Home, MapPin, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Avatar } from './avatar';
import { Logo } from './logo';

const appLinks = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/matches', label: 'Matches', icon: Heart },
  { href: '/listings', label: 'Rooms', icon: Home },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [incoming, setIncoming] = useState(0);
  const [query, setQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    api<{ incoming: { id: string }[] }>('/interests')
      .then((data) => setIncoming(data.incoming?.length || 0))
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/discover?q=${encodeURIComponent(next)}` : '/discover');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-sand/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <Logo href={user ? '/discover' : '/'} />
        {user?.localities?.[0] && (
          <span className="hidden items-center gap-1 rounded-full bg-[#FFE8F0] px-3 py-1 text-xs font-medium text-ink/80 lg:inline-flex">
            <MapPin className="h-3 w-3 text-clay" />
            {user.localities[0]}
          </span>
        )}

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {appLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm ${
                  active ? 'bg-[#FFE8F0] font-semibold text-ink' : 'text-muted hover:bg-[#FFF1F5] hover:text-ink'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {link.href === '/matches' && incoming > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] text-white">
                    {incoming}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={onSearch} className="relative hidden w-56 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or rooms"
            className="w-full rounded-full border border-sand bg-[#FFF6F0] py-2 pl-9 pr-3 text-sm outline-none focus:border-clay"
          />
        </form>

        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/rooms/new" className="btn-primary hidden h-10 px-4 sm:inline-flex">
              <Plus className="mr-1 h-4 w-4" />
              List a room
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full border border-sand bg-white py-1 pl-1 pr-3"
              >
                <Avatar name={user.name} photoUrl={user.photoUrl} size={32} />
                <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-sand bg-white p-2 shadow-panel">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted">{user.occupation || 'Complete your living profile'}</p>
                  </div>
                  <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-[#FFF1F5]">
                    View profile
                  </Link>
                  <Link href="/rooms/new" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-[#FFF1F5] sm:hidden">
                    List a room
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-clay hover:bg-[#FFF1F5]"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/login" className="text-muted">Sign in</Link>
            <Link href="/register" className="btn-primary">Start matching</Link>
          </div>
        )}
      </div>

      {user && (
        <nav className="flex items-center justify-around border-t border-sand/70 px-2 py-2 md:hidden">
          {appLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center gap-1 px-3 text-[11px] ${active ? 'font-semibold text-clay' : 'text-muted'}`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {link.href === '/matches' && incoming > 0 && (
                  <span className="absolute right-1 top-0 h-1.5 w-1.5 rounded-full bg-clay" />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-night/90 text-white backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Logo href="/" light />
        <nav className="flex items-center gap-5 text-sm">
          <a href="#how-it-works" className="hidden text-white/70 hover:text-white md:inline">How it works</a>
          <a href="#features" className="hidden text-white/70 hover:text-white md:inline">Why us</a>
          <a href="#safety" className="hidden text-white/70 hover:text-white md:inline">Safety</a>
          <Link href="/login" className="text-white/80">Sign in</Link>
          <Link href="/register" className="btn bg-white text-ink hover:bg-paper">Start matching</Link>
        </nav>
      </div>
    </header>
  );
}
