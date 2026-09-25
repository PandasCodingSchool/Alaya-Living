import Link from 'next/link';
import { BedDouble, MapPin, Sofa } from 'lucide-react';
import type { FlatListing } from '@/lib/types';
import { inr } from '@/lib/format';
import { roomPhotoFor } from '@/lib/media';

export function FlatCard({ flat, groupSize }: { flat: FlatListing; groupSize?: number }) {
  const bhkLabel = flat.bhk === 'TWO_BHK' ? '2 BHK' : '3 BHK';
  const perPerson = groupSize ? Math.round(flat.monthlyRent / groupSize) : null;

  return (
    <article className="panel overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={roomPhotoFor(flat.locality, flat.photos)} alt={flat.title} className="h-40 w-full object-cover" />
      <div className="p-5">
        <p className="text-lg font-semibold">{flat.title}</p>
        <p className="mt-1 text-xl font-semibold">{inr(flat.monthlyRent)}<span className="text-sm font-normal text-muted"> / month</span></p>
        {perPerson != null && <p className="mt-1 text-xs text-muted">≈ {inr(perPerson)} per person</p>}
        <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {flat.locality}
          </span>
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" /> {bhkLabel}
          </span>
          {flat.furnished && (
            <span className="inline-flex items-center gap-1">
              <Sofa className="h-3.5 w-3.5" /> Furnished
            </span>
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {flat.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="chip">{amenity}</span>
          ))}
        </div>
        <Link href={`/flats/${flat.id}`} className="btn-ghost mt-5 w-full">
          View flat
        </Link>
      </div>
    </article>
  );
}
