'use client';

import { usePathname } from 'next/navigation';
import { AppHeader, MarketingHeader } from './app-header';
import { SiteFooter } from './site-footer';

const hideChrome = ['/login', '/register', '/onboarding', '/verify-phone'];

function isMarketing(pathname: string) {
  return (
    pathname === '/' ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/stories') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/bengaluru')
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = hideChrome.includes(pathname);
  const marketing = isMarketing(pathname);
  const appChrome = !hideNav && !marketing;

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      {!hideNav && (marketing ? <MarketingHeader /> : <AppHeader />)}
      <main id="main" className={appChrome ? 'pb-20 md:pb-8' : undefined}>
        {children}
      </main>
      {marketing && <SiteFooter />}
    </div>
  );
}
