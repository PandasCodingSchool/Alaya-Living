import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Create an Alaya living profile',
  description:
    'Join Alaya to find a compatible roommate in Bengaluru. Tell us if you have a room or need one, then match on budget, corridor and lifestyle.',
  path: '/register',
  keywords: ['create roommate profile Bengaluru', 'list a room Bellandur', 'join Alaya'],
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
