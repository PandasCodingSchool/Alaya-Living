import type { Metadata } from 'next';
import Link from 'next/link';
import { Testimonials } from '@/components/testimonials';
import { testimonials } from '@/lib/marketing';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Roommate success stories in Bengaluru | Alaya',
  description:
    'How people in Bellandur, Whitefield, HSR and Electronic City found a compatible roommate — split rent, mutual chat, and listings that declare sharing permission.',
  path: '/stories',
  keywords: [
    'roommate success stories Bengaluru',
    'shared flat Bellandur',
    'find roommate Whitefield',
    'HSR roommate experience',
  ],
});

export default function StoriesPage() {
  return (
    <div className="bg-paper pb-16">
      <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-5 sm:pt-16">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">SUCCESS STORIES</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Stories from Bengaluru flats that actually split</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Composite stories from the corridors Alaya launches in. The pattern is the same: a living profile, hard filters,
          then chat only after both people agree.
        </p>
      </div>
      <Testimonials limit={testimonials.length} heading="Six ways a match turned into a share" showMore={false} />
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <Link href="/register" className="btn-primary">
          Start your living profile
        </Link>
      </div>
    </div>
  );
}
