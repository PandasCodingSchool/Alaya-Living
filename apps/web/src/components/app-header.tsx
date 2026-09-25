'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bookmark, Building2, Compass, Heart, Home, Menu, MessageCircle, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useInbox } from '@/lib/inbox';
import { homeForUser, isPgOperator } from '@/lib/routes';
import { Avatar } from './avatar';
import { LocationPicker } from './location-picker';
import { Logo } from './logo';

const livingPaths = ['/living', '/pgs', '/groups', '/replacements', '/agreements'];

const seekerLinks = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/matches', label: 'Matches', icon: Heart },
  { href: '/chat', label: 'Messages', icon: MessageCircle },
  { href: '/listings', label: 'Rooms', icon: Home },
  { href: '/living', label: 'Living', icon: Building2, match: livingPaths },
];

const operatorLinks = [
  { href: '/operator', label: 'Dashboard', icon: Building2 },
  { href: '/chat', label: 'Messages', icon: MessageCircle },
];

type NavLink = (typeof seekerLinks)[number];

function linkActive(pathname: string, link: NavLink) {
  if (link.match) return link.match.some((path) => pathname.startsWith(path));
  if (link.href === '/operator') return pathname.startsWith('/operator');
  if (link.href === '/pgs') return pathname.startsWith('/pgs');
  return pathname.startsWith(link.href);
}

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useInbox();
  const [open, setOpen] = useState(false);
  const [incoming, setIncoming] = useState(0);
  const [listingId, setListingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pgOperator = isPgOperator(user);
  const isOperator = pgOperator || user?.role === 'ADMIN';
  const navLinks = pgOperator ? operatorLinks : seekerLinks;

  useEffect(() => {
    if (!user) return;
    api<{ incoming: { id: string }[] }>('/interests')
      .then((data) => setIncoming(data.incoming?.length || 0))
      .catch(() => undefined);
    api<{ id: string }[]>('/rooms/mine')
      .then((rows) => setListingId(rows[0]?.id ?? null))
      .catch(() => setListingId(null));
  }, [user]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-sand/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:gap-4 sm:px-5">
        <Logo href={user ? homeForUser(user) : '/'} />
        {!pgOperator && <LocationPicker />}

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = linkActive(pathname, link);
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
                {link.href === '/operator' && incoming > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] text-white">
                    {incoming}
                  </span>
                )}
                {link.href === '/chat' && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {user ? (
          <div className="flex items-center gap-2">
            {!pgOperator && (
              <Link
                href="/saved"
                aria-label="Saved"
                className={`grid h-10 w-10 place-items-center rounded-full ${
                  pathname.startsWith('/saved') ? 'bg-[#FFE8F0] text-clay' : 'text-muted hover:bg-[#FFF1F5] hover:text-ink'
                }`}
              >
                <Bookmark className="h-4 w-4" />
              </Link>
            )}
            {isOperator ? (
              <Link href="/operator" className="btn-primary hidden h-10 px-4 sm:inline-flex">
                <Building2 className="mr-1 h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <Link href={listingId ? `/rooms/${listingId}/edit` : '/rooms/new'} className="btn-primary hidden h-10 px-4 sm:inline-flex">
                <Plus className="mr-1 h-4 w-4" />
                {listingId ? 'Edit listing' : 'List a room'}
              </Link>
            )}
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
                    <p className="text-xs text-muted">
                      {pgOperator ? 'PG operator' : user.occupation || 'Complete your living profile'}
                    </p>
                  </div>
                  <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-[#FFF1F5]">
                    View profile
                  </Link>
                  {!pgOperator && (
                    <>
                      <Link href="/saved" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-[#FFF1F5]">
                        Saved
                      </Link>
                      <Link href="/living" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-[#FFF1F5]">
                        Living
                      </Link>
                    </>
                  )}
                  {isOperator && (
                    <Link href="/operator" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-[#FFF1F5]">
                      Operator dashboard
                    </Link>
                  )}
                  <Link
                    href={isOperator ? '/operator' : listingId ? `/rooms/${listingId}/edit` : '/rooms/new'}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm hover:bg-[#FFF1F5] sm:hidden"
                  >
                    {isOperator ? 'Operator dashboard' : listingId ? 'Edit listing' : 'List a room'}
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
          <div className="ml-auto flex items-center gap-2 text-sm sm:gap-3">
            <Link href="/login" className="text-muted">Sign in</Link>
            <Link href="/register" className="btn-primary px-3 sm:px-5">Start matching</Link>
          </div>
        )}
      </div>

      {user && (
        <nav className="flex items-center justify-around border-t border-sand/70 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
          {navLinks.map((link) => {
            const active = linkActive(pathname, link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center gap-1 px-3 text-[11px] ${active ? 'font-semibold text-clay' : 'text-muted'}`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {(link.href === '/matches' || link.href === '/operator') && incoming > 0 && (
                  <span className="absolute right-1 top-0 h-1.5 w-1.5 rounded-full bg-clay" />
                )}
                {link.href === '/chat' && unreadCount > 0 && (
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

const marketingLinks = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/stories', label: 'Stories' },
  { href: '/faq', label: 'FAQ' },
  { href: '/#safety', label: 'Safety' },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-night/90 text-white backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
        <Logo href="/" light />
        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {marketingLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-white/70 hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="text-white/80">Sign in</Link>
          <Link href="/register" className="btn bg-white text-ink hover:bg-paper">Start matching</Link>
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/register" className="btn bg-white px-3 text-ink hover:bg-paper">Join</Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-white/10 px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 text-sm">
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-white/80 hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-white/80 hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
