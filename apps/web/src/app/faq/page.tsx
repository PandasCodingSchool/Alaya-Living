import type { Metadata } from 'next';
import { FaqSection } from '@/components/faq-section';
import { faqJsonLd, JsonLd } from '@/components/json-ld';
import { faqs } from '@/lib/marketing';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Roommate FAQ — Alaya Bengaluru',
  description:
    'Answers about Alaya matching, mutual chat, hidden phone numbers, sharing permission, same-gender discovery, Premium unlocks and Bengaluru corridors.',
  path: '/faq',
  keywords: [
    'Alaya FAQ',
    'roommate app Bengaluru questions',
    'when can I chat with a roommate',
    'is phone number hidden',
    'PG sharing permission',
  ],
});

export default function FaqPage() {
  return (
    <div className="bg-paper">
      <JsonLd data={faqJsonLd([...faqs])} />
      <div className="mx-auto max-w-3xl px-4 pb-4 pt-12 sm:px-5 sm:pt-16">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">HELP</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Roommate questions, answered plainly</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          How matching, chat, privacy and listings work on Alaya in Bengaluru — before you share a flat.
        </p>
      </div>
      <FaqSection heading="Everything people ask before they match" />
    </div>
  );
}
