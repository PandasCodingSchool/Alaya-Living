import Link from 'next/link';
import { BadgeCheck, Calendar, MapPin } from 'lucide-react';
import type { Room } from '@/lib/types';
import { inr, prettyEnum } from '@/lib/format';
import { roomPhotoFor } from '@/lib/media';
import { Reasons } from './reasons';

export function RoomCard({ room }: { room: Room }) {
  return (
    <article className="panel overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={roomPhotoFor(room.locality, room.photos)} alt={`${room.locality} room`} className="h-40 w-full object-cover" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-semibold">{inr(room.roommateContribution)}<span className="text-sm font-medium text-muted"> / mo</span></p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5" /> {room.locality} · {prettyEnum(room.roomType)}
            </p>
          </div>
          {room.compatibility && (
            <div className="text-right">
              <p className="text-lg font-semibold text-clay">{room.compatibility.score}%</p>
              <p className="text-[11px] text-muted">fit</p>
            </div>
          )}
        </div>
        <p className="mt-3 flex items-center gap-1 text-sm text-ink/70">
          <Calendar className="h-3.5 w-3.5" />
          Available {new Date(room.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          {' · '}{room.owner.occupation || room.owner.name}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="chip">{amenity}</span>
          ))}
        </div>
        {room.owner.phoneVerified && (
          <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-forest">
            <BadgeCheck className="h-3.5 w-3.5" /> Occupant verified
          </p>
        )}
        {room.compatibility && <Reasons reasons={room.compatibility.reasons} />}
        <Link href={`/rooms/${room.id}`} className="btn-ghost mt-5 w-full">
          View room
        </Link>
      </div>
    </article>
  );
}
