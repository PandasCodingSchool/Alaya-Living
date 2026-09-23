import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Saved people and rooms',
  description: 'Bookmarks you saved on Alaya.',
  path: '/saved',
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
