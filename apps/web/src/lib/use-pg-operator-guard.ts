'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './auth';
import { homeForUser, isPgOperator } from './routes';

/** Redirect PG operators away from seeker-only pages (discover, matches, etc.). */
export function usePgOperatorGuard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isPgOperator(user)) router.replace(homeForUser(user));
  }, [user, loading, router]);

  return { user, loading, blocked: isPgOperator(user) };
}
