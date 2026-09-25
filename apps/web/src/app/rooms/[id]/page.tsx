'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { ContactReveal } from '@/components/contact-reveal';
import { Reasons } from '@/components/reasons';
import { ReportButton } from '@/components/report-button';
import { SaveButton } from '@/components/save-button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { inr, prettyEnum } from '@/lib/format';
import { roomPhotoFor } from '@/lib/media';
import type { InterestState, Room } from '@/lib/types';

export default function RoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [state, setState] = useState<InterestState | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await api<Room>(`/rooms/${params.id}`);
      setRoom(data);
      const s = await api<InterestState>(`/interests/${data.owner.id}`);
      setState(s);
    };
    load();
  }, [params.id]);

  if (!room) return <p className="px-5 py-16 text-center text-ink/50">Loading…</p>;

  const mine = user?.id === room.owner.id;

  async function interest() {
    if (!room) return;
    const next = await api<InterestState>('/interests', {
      method: 'POST',
      body: JSON.stringify({ toUserId: room.owner.id, roomId: room.id }),
    });
    setState(next);
    if (next.conversationId) router.push(`/chat/${next.conversationId}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={roomPhotoFor(room.locality, room.photos)} alt={`${room.locality} room`} className="mb-3 h-64 w-full rounded-[1.5rem] object-cover" />
      {room.photos.length > 1 && (
        <div className="mb-6 grid grid-cols-4 gap-2">
          {room.photos.slice(0, 4).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="h-20 w-full rounded-xl object-cover" />
          ))}
        </div>
      )}
      <p className="text-sm text-ink/50">{room.city} · {room.locality}</p>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{inr(room.roommateContribution)} / person</h1>
      <p className="mt-2 text-ink/60">
        Full rent {inr(room.monthlyRent)} · {prettyEnum(room.roomType)} · {prettyEnum(room.propertyType)}
      </p>
      <p className="mt-6 text-sm text-ink/70">
        Exact address is hidden until you match. Sharing permission: {prettyEnum(room.sharingPermission)}.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {room.amenities.map((amenity) => (
          <span key={amenity} className="chip">{amenity}</span>
        ))}
      </div>
      {room.notes && <p className="mt-6 text-ink/70">{room.notes}</p>}
      {room.compatibility && <Reasons reasons={room.compatibility.reasons} />}
      <div className="panel mt-8 flex items-center gap-4 p-5">
        <Avatar name={room.owner.name} photoUrl={room.owner.photoUrl} size={56} />
        <div>
        <p className="text-sm text-ink/50">Current occupant</p>
        <p className="mt-1 text-xl font-semibold">{room.owner.name}</p>
        <p className="text-sm text-ink/60">{room.owner.occupation}</p>
        <Link href={`/people/${room.owner.id}`} className="mt-1 inline-block text-sm text-clay">View living profile</Link>
        </div>
      </div>
      {!mine && <ContactReveal userId={room.owner.id} matched={!!state?.matched} />}
      <div className="mt-8 flex flex-wrap gap-3">
        {mine ? (
          <>
            <Link href={`/rooms/${room.id}/edit`} className="btn-dark">Edit listing</Link>
            <Link href={`/replacements/new?roomId=${room.id}`} className="btn-ghost">Find replacement</Link>
          </>
        ) : (
          <button onClick={interest} className="btn-primary">
            {state?.matched ? 'Open chat' : state?.interested ? 'Interest sent' : 'Interested'}
          </button>
        )}
        <SaveButton kind="ROOM" targetId={room.id} hide={mine} variant="label" />
        {!mine && <ReportButton targetKind="ROOM" targetId={room.id} />}
      </div>
    </div>
  );
}
