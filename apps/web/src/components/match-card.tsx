import Link from 'next/link';
import { BadgeCheck, MapPin, Moon, Wallet } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { hourLabel, inr } from '@/lib/format';
import { Avatar } from './avatar';
import { Reasons } from './reasons';

export function MatchCard({ person }: { person: Profile }) {
  return (
    <article className="panel overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <Avatar name={person.name} photoUrl={person.photoUrl} size={56} />
            <div>
              <p className="text-lg font-semibold">{person.name}</p>
              <p className="text-sm text-muted">{[person.age, person.occupation].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
          {person.compatibility && (
            <div className="text-right">
              <p className="text-lg font-semibold text-clay">{person.compatibility.score}%</p>
              <p className="text-[11px] text-muted">match</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {person.minBudget && person.maxBudget && (
            <span className="chip"><Wallet className="mr-1 h-3 w-3" />{inr(person.minBudget)}–{inr(person.maxBudget)}</span>
          )}
          {person.localities.slice(0, 2).map((locality) => (
            <span key={locality} className="chip"><MapPin className="mr-1 h-3 w-3" />{locality}</span>
          ))}
          {person.sleepStart != null && (
            <span className="chip"><Moon className="mr-1 h-3 w-3" />{hourLabel(person.sleepStart)}</span>
          )}
        </div>
        {person.phoneVerified && (
          <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-forest">
            <BadgeCheck className="h-3.5 w-3.5" /> Phone verified
          </p>
        )}
        {person.compatibility && <Reasons reasons={person.compatibility.reasons} />}
        <Link href={`/people/${person.id}`} className="btn-ghost mt-5 w-full">
          View why you match
        </Link>
      </div>
    </article>
  );
}
