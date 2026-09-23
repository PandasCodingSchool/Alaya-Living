import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { corridors, faqs } from '@/lib/marketing';
import { FaqSection } from '@/components/faq-section';
import { Testimonials } from '@/components/testimonials';
import { localitySlug, pageMetadata } from '@/lib/seo';

type Params = { locality: string };

function corridorFor(slug: string) {
  return corridors.find((item) => localitySlug(item.name) === slug);
}

export function generateStaticParams() {
  return corridors.map((corridor) => ({ locality: localitySlug(corridor.name) }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locality } = await params;
  const corridor = corridorFor(locality);
  if (!corridor) return {};
  return pageMetadata({
    title: `Find a roommate in ${corridor.name}, Bengaluru | Alaya`,
    description: `Looking for a compatible roommate in ${corridor.name}? ${corridor.blurb} Match on budget, lifestyle and sharing permission — chat only after both people agree.`,
    path: `/bengaluru/${locality}`,
    keywords: [
      `roommate in ${corridor.name}`,
      `share room ${corridor.name} Bengaluru`,
      `find roommate ${corridor.name}`,
      'Alaya roommate app',
    ],
  });
}

export default async function LocalityPage({ params }: { params: Promise<Params> }) {
  const { locality } = await params;
  const corridor = corridorFor(locality);
  if (!corridor) notFound();

  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-5 sm:py-16">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">BENGALURU · {corridor.name.toUpperCase()}</p>
        <h1 className="mt-3 text-4xl font-semibold">Find a compatible roommate in {corridor.name}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{corridor.blurb}</p>
        <p className="mt-4 text-sm leading-7 text-muted">
          Alaya is not a PG feed. You build a living profile, we drop people whose budget or dates cannot work, and you
          read why the remaining matches fit — before anyone gets a phone number.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="btn-primary w-full sm:w-auto">I need a room in {corridor.name}</Link>
          <Link href="/register" className="btn-ghost w-full sm:w-auto">I have a room here</Link>
        </div>
      </section>
      <Testimonials limit={3} heading={`Stories from nearby corridors`} />
      <FaqSection items={faqs.slice(0, 5)} heading={`Before you search ${corridor.name}`} seeAll />
    </div>
  );
}
