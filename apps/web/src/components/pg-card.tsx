import Link from 'next/link';
import { BadgeCheck, BedDouble, MapPin, Utensils } from 'lucide-react';
import type { PgListing } from '@/lib/types';
import { inr, prettyEnum } from '@/lib/format';
import { roomPhotoFor } from '@/lib/media';

export function PgCard({ pg }: { pg: PgListing }) {
  return (
    <article className="panel overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={roomPhotoFor(pg.locality, pg.photos)} alt={pg.title} className="h-40 w-full object-cover" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-semibold">{pg.title}</p>
          {(pg.status === 'CLOSED' || pg.bedsAvailable <= 0) && (
            <span className="rounded-full bg-[#FFF1F5] px-2 py-0.5 text-[11px] font-semibold text-clay">Hidden</span>
          )}
        </div>
        <p className="mt-1 text-xl font-semibold">
          {inr(pg.monthlyRent)}
          <span className="text-sm font-medium text-muted"> / bed</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5" /> {pg.locality} · {prettyEnum(pg.genderPolicy)} only
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink/70">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" /> {pg.bedsAvailable} of {pg.totalBeds} beds
          </span>
          {pg.mealsIncluded && (
            <span className="inline-flex items-center gap-1">
              <Utensils className="h-3.5 w-3.5" /> Meals
            </span>
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pg.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="chip">{amenity}</span>
          ))}
        </div>
        {pg.owner.phoneVerified && (
          <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-forest">
            <BadgeCheck className="h-3.5 w-3.5" /> Operator verified
          </p>
        )}
        <Link href={`/pgs/${pg.id}`} className="btn-ghost mt-5 w-full">
          View PG
        </Link>
      </div>
    </article>
  );
}
