import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Sign in to Alaya',
  description: 'Sign in to Alaya to see compatible roommates and rooms in Bengaluru. Email or phone OTP.',
  path: '/login',
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
