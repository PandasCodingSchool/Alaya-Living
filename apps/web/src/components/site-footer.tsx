import Link from 'next/link';
import { corridors } from '@/lib/marketing';
import { localitySlug } from '@/lib/seo';
import { Logo } from './logo';

const product = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features', label: 'Why Alaya' },
  { href: '/#safety', label: 'Safety' },
  { href: '/stories', label: 'Success stories' },
  { href: '/faq', label: 'FAQ' },
];

const account = [
  { href: '/register', label: 'Create a profile' },
  { href: '/login', label: 'Sign in' },
  { href: '/register', label: 'List a room' },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-night text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs">
          <Logo href="/" light />
          <p className="mt-4 text-sm leading-6 text-white/60">
            Compatible roommates in Bengaluru. Person + room + chemistry + trust — not a broker catalogue.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Product</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {product.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Bengaluru corridors</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {corridors.map((corridor) => (
              <li key={corridor.name}>
                <Link href={`/bengaluru/${localitySlug(corridor.name)}`} className="hover:text-white">
                  Roommates in {corridor.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Account</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {account.map((link) => (
              <li key={link.href + link.label}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 text-sm text-white/75">
            <Link href="/privacy" className="block hover:text-white">Privacy</Link>
            <Link href="/terms" className="block hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 sm:px-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Alaya. Bengaluru, India.</p>
          <p>Phone and exact address stay private until a mutual match.</p>
        </div>
      </div>
    </footer>
  );
}
