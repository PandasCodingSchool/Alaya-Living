import Link from 'next/link';
import { faqs } from '@/lib/marketing';

export function FaqSection({
  items = faqs,
  heading = 'Questions people ask before they share a flat',
  limit,
  seeAll = false,
}: {
  items?: readonly { q: string; a: string }[];
  heading?: string;
  limit?: number;
  seeAll?: boolean;
}) {
  const list = limit ? items.slice(0, limit) : items;

  return (
    <section id="faq" className="bg-white py-16 text-ink sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">FAQ</p>
        <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{heading}</h2>
        <div className="mt-8 divide-y divide-sand border-y border-sand">
          {list.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-semibold marker:content-none">
                <span>{item.q}</span>
                <span className="mt-0.5 text-lg font-normal text-clay transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
        {seeAll && (
          <p className="mt-6 text-sm">
            <Link href="/faq" className="font-semibold text-clay">
              Read all roommate FAQs
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
