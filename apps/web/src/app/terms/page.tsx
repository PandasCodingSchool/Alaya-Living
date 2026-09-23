import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms — Alaya',
  description:
    'Terms for using Alaya to find or list a roommate share in Bengaluru. One listing per person, honest sharing permission, and no scraping of contact details.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 text-ink sm:px-5 sm:py-16">
      <h1 className="text-4xl font-semibold">Terms of use</h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        Alaya is a matching product for people who want to share a room in Bengaluru. By creating a profile you agree to
        use it honestly and not to harvest other people&apos;s contact details.
      </p>
      <h2 className="mt-10 text-xl font-semibold">Your listing</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        You may publish one active room. You must declare whether the landlord or PG allows another occupant. Do not list
        a room you cannot legally share.
      </p>
      <h2 className="mt-10 text-xl font-semibold">Conduct</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        No harassment, no fake profiles, no scraping. Either person can block the other. We may suspend accounts that
        break these rules.
      </p>
      <h2 className="mt-10 text-xl font-semibold">The match is not a lease</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Alaya does not become a party to your rental agreement. Verify the property, the occupant and the permission
        yourself before you move in or accept money.
      </p>
    </article>
  );
}
