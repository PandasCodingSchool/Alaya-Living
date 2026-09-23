import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Messages',
  description: 'Private Alaya conversations after a mutual match.',
  path: '/chat',
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
