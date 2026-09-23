import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy — Alaya',
  description:
    'How Alaya treats phone numbers, email, exact addresses and living-profile data. Public cards show first name, locality and lifestyle — not contact details.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 text-ink sm:px-5 sm:py-16">
      <h1 className="text-4xl font-semibold">Privacy</h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        Alaya is built so a stranger cannot harvest your phone number from a listing. This page explains what is public,
        what stays hidden, and what we store to run matching.
      </p>
      <h2 className="mt-10 text-xl font-semibold">What other people can see</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Public profiles show first name, age band, occupation, locality, budget range and lifestyle answers. They do not
        show your phone, email or exact address. Room cards show corridor, rent split, amenities and whether sharing is
        permitted — not the PG gate or apartment number.
      </p>
      <h2 className="mt-10 text-xl font-semibold">Chat and contact</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Messages exist only after a mutual match. Contact details unlock after a match, with a small free allowance, then
        Premium. You can block someone and they leave discovery.
      </p>
      <h2 className="mt-10 text-xl font-semibold">What we store</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        We store the account you create, your living profile, preferences, listings, bookmarks, interests and chat
        messages so the product can function. We do not sell this data to brokers. Identity KYC is not live in this MVP.
      </p>
      <h2 className="mt-10 text-xl font-semibold">Questions</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Write to us from the email on your account if you want a correction or a deletion request.
      </p>
    </article>
  );
}
