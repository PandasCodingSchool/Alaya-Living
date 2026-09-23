import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Discover compatible roommates',
  description: 'Private match feed for your Alaya living profile.',
  path: '/discover',
  index: false,
});

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
