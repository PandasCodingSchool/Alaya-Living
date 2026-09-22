'use client';

import { usePathname } from 'next/navigation';
import { AppHeader, MarketingHeader } from './app-header';

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = ['/login', '/register', '/onboarding', '/verify-phone'].includes(pathname);
  const marketing = pathname === '/';

  return (
    <div className="min-h-screen">
      {!hideNav && (marketing ? <MarketingHeader /> : <AppHeader />)}
      <main>{children}</main>
    </div>
  );
}
