import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Matches',
  description: 'Your mutual roommate matches on Alaya.',
  path: '/matches',
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
