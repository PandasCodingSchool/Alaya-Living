import Link from 'next/link';
import {
  BadgeCheck,
  Ban,
  BookmarkCheck,
  EyeOff,
  Filter,
  HeartHandshake,
  Languages,
  Lock,
  MapPin,
  MessageCircle,
  PhoneOff,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

const steps = [
  { n: '01', title: 'Pick a side', copy: 'I have a room, or I need one. Flatmates can be captured now; the group workflow comes later.', icon: Users },
  { n: '02', title: 'Build a living profile', copy: 'Sleep, food, cleanliness, guests, work hours, languages — not just name and job title.', icon: Sparkles },
  { n: '03', title: 'Set hard limits', copy: 'Budget, localities, move-in date. If it cannot work, we do not show it.', icon: Filter },
  { n: '04', title: 'Read the match', copy: 'Every card shows why: same locality, similar budget, different cooking habits.', icon: Scale },
  { n: '05', title: 'Interest, then mutual match', copy: 'One-way likes stay private-ish. Chat opens only when both people say yes.', icon: HeartHandshake },
  { n: '06', title: 'Talk on the platform', copy: 'Phone and exact address stay hidden until you choose to share them.', icon: MessageCircle },
];

const features = [
  { title: 'Compatibility you can audit', copy: 'We do not hide behind an opaque 87%. Location, budget, move-in, lifestyle, food, language and work hours are scored separately, then written out as reasons and differences.', icon: Scale },
  { title: 'Hard filters before ranking', copy: 'If budgets do not overlap, localities do not match, or move-in dates are 45+ days apart, the person is dropped. Soft preferences only rank who is left.', icon: Filter },
  { title: 'Two-sided from day one', copy: 'Someone already paying ₹20K can list a shareable room. Someone moving to Bellandur can find that room and the occupant — not a broker catalogue.', icon: Users },
  { title: 'Mutual match lock', copy: 'Interest is one-way until it is returned. That is when a conversation is created. No cold calls, no leaked WhatsApp numbers on first view.', icon: Lock },
  { title: 'Privacy by default', copy: 'Public profiles show first name, locality, occupation and lifestyle. Phone, email and exact address stay off the card.', icon: EyeOff },
  { title: 'Phone verification', copy: 'OTP on an Indian mobile. Verified accounts get a visible trust mark. Identity KYC and property checks are Phase 2 — we do not pretend they exist yet.', icon: BadgeCheck },
  { title: 'Sharing has to be allowed', copy: 'Every listing asks: is another person permitted by the PG or landlord? Yes / needs approval / no. We will not help people quietly break a rental agreement.', icon: BookmarkCheck },
  { title: 'Language as a preference', copy: 'Hindi, English, Kannada, Tamil, Telugu and more. You decide if language compatibility matters. The engine does not assume it for you.', icon: Languages },
];

const corridors = ['Bellandur', 'Kadubeesanahalli', 'Marathahalli', 'Whitefield', 'HSR', 'Koramangala', 'Electronic City'];

export default function HomePage() {
  return (
    <div className="bg-night text-white" style={{ background: 'radial-gradient(900px 480px at 85% 0%, rgba(244,63,122,0.28), transparent 50%), #14080E' }}>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay">Alaya · Sanskrit for abode</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] md:text-6xl">
            Share the rent with someone you can actually live with.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70 md:text-lg">
            Alaya is not a PG marketplace. It matches a person who has a room with a person who needs one —
            using budget, locality, move-in date and lifestyle, then explains the fit before anyone chats.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">I have a room</Link>
            <Link href="/register" className="btn bg-white text-ink hover:bg-paper">I need a room</Link>
          </div>
          <p className="mt-6 text-sm text-white/45">
            Typical case: ₹20,000 single room → one compatible roommate → ~₹10,000 each, if the property allows it.
          </p>
        </div>

        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero-roommates.png" alt="Two professionals sharing a Bengaluru apartment" className="h-72 w-full rounded-[1.5rem] object-cover md:h-80" />
          <div className="panel absolute -bottom-10 left-4 right-4 text-ink md:left-8 md:right-auto md:w-80">
            <div className="flex items-center gap-3 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/portrait-arjun.png" alt="Arjun" className="h-12 w-12 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Arjun · 27</p>
                <p className="text-xs text-muted">Software Engineer · Bellandur</p>
              </div>
              <p className="text-sm font-semibold text-clay">87%</p>
            </div>
            <div className="border-t border-sand px-4 py-3 text-xs text-muted">
              + Same locality · Similar sleep · Both non-smokers
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 border-y border-white/10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-white/10 md:grid-cols-4">
          {[
            [Sparkles, 'Living profile', 'Lifestyle, not just photos'],
            [Filter, 'Hard filters', 'Budget · locality · dates'],
            [Scale, 'Explained score', 'Reasons on every card'],
            [ShieldCheck, 'Safe chat', 'Only after mutual match'],
          ].map(([Icon, title, copy]) => {
            const Glyph = Icon as typeof Sparkles;
            return (
              <div key={String(title)} className="bg-night px-5 py-6">
                <Glyph className="h-5 w-5 text-clay" />
                <p className="mt-3 text-lg font-semibold">{title as string}</p>
                <p className="mt-1 text-sm text-white/50">{copy as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-paper py-20 text-ink">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">THE PROBLEM</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold md:text-4xl">
            Finding a cheaper room is easy. Finding a person you can share it with is the broken part.
          </h2>
          <div className="mt-10 grid items-center gap-6 md:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/match-connect.png" alt="Two people matched as compatible roommates" className="h-72 w-full rounded-[1.5rem] object-cover" />
            <div className="space-y-4">
              <div className="panel p-5">
                <p className="text-sm font-medium text-muted">WhatsApp / Telegram groups</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/75">
                  <li>Random people, no lifestyle data</li>
                  <li>Phone numbers public from the first message</li>
                  <li>No idea if sharing is even allowed in that PG</li>
                </ul>
              </div>
              <div className="panel border-clay/30 p-5">
                <p className="text-sm font-medium text-clay">Alaya</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/75">
                  <li>Structured living profile + preferences</li>
                  <li>Chat only after both people express interest</li>
                  <li>Listings must declare landlord/PG permission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-paper pb-20 text-ink">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">HOW IT WORKS</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">The product loop, not a property feed</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="panel p-5">
                <step.icon className="h-5 w-5 text-clay" />
                <p className="mt-3 text-xs font-semibold text-clay">{step.n}</p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20 text-ink">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">WHY THIS IS NOT ANOTHER RENTAL APP</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold md:text-4xl">
            Person + room + chemistry + trust. Property photos are secondary.
          </h2>
          <div className="mt-10 grid gap-px bg-sand md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white p-6">
                <feature.icon className="h-5 w-5 text-clay" />
                <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-20 text-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">WHAT A ROOM LOOKS LIKE</p>
            <h2 className="mt-3 text-3xl font-semibold">The room is real. The address stays private.</h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              You see the locality, rent split, amenities and whether sharing is permitted. Exact PG or apartment address is held back until you match.
            </p>
            <div className="mt-5 flex gap-3">
              <span className="chip"><Wallet className="mr-1 h-3 w-3" />₹10,000 / person</span>
              <span className="chip"><MapPin className="mr-1 h-3 w-3" />Bellandur</span>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/room-single.png" alt="Furnished single room in Bengaluru" className="h-72 w-full rounded-[1.5rem] object-cover" />
        </div>
      </section>

      <section id="safety" className="bg-night py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/40">TRUST BEFORE GROWTH</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold md:text-4xl">
            Contact details are a privilege, not the default listing field.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [PhoneOff, 'Hidden phone', 'Numbers are never on public profiles. Chat first. Share contact only if you want to.'],
              [EyeOff, 'Hidden address', 'Seekers see Bellandur, not the PG gate. Exact address stays with the occupant.'],
              [Ban, 'Block', 'Either person can end the thread. Blocked users disappear from discovery.'],
            ].map(([Icon, title, copy]) => {
              const Glyph = Icon as typeof Ban;
              return (
                <div key={String(title)} className="rounded-2xl border border-white/10 p-5">
                  <Glyph className="h-5 w-5 text-clay" />
                  <h3 className="mt-3 text-lg font-semibold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{copy as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/city-bengaluru.png" alt="Bengaluru tech corridor at dusk" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-night/70" />
        <div className="relative mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/60">LAUNCH CITY</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Bengaluru corridors first. Not “India’s roommate app”.</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {corridors.map((locality) => (
              <span key={locality} className="rounded-full bg-white/15 px-3 py-2 text-sm backdrop-blur">
                {locality}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl">Start with a living profile, not a listing dump.</h2>
            <p className="mt-2 text-white/60">Free for the MVP. Phone OTP works with 123456 in local/dev.</p>
          </div>
          <Link href="/register" className="btn-primary">Create your profile</Link>
        </div>
      </section>
    </div>
  );
}
