import Link from 'next/link';
import { testimonials } from '@/lib/marketing';

export function Testimonials({
  limit = 3,
  heading = 'What sharing actually looked like',
  showMore = true,
}: {
  limit?: number;
  heading?: string;
  showMore?: boolean;
}) {
  const stories = testimonials.slice(0, limit);

  return (
    <section id="stories" className="bg-paper py-16 text-ink sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">SUCCESS STORIES</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">{heading}</h2>
          {showMore && (
            <Link href="/stories" className="text-sm font-semibold text-clay">
              More stories
            </Link>
          )}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <figure key={story.name} className="panel flex flex-col p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">{story.outcome}</p>
              <blockquote className="mt-3 flex-1 text-sm leading-6 text-ink/80">“{story.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFE8F0] text-sm font-semibold text-clay" aria-hidden>
                  {story.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{story.name}</p>
                  <p className="text-xs text-muted">{story.role} · {story.place}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
