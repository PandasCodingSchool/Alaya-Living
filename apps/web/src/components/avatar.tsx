import { initials } from '@/lib/format';
import { portraitFor } from '@/lib/media';

export function Avatar({
  name,
  photoUrl,
  size = 48,
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
}) {
  return (
    <span className="story-ring inline-grid shrink-0 place-items-center rounded-full p-[2px]" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={portraitFor(name, photoUrl)}
        alt={name}
        className="h-full w-full rounded-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          event.currentTarget.parentElement?.insertAdjacentHTML(
            'beforeend',
            `<span class="grid h-full w-full place-items-center rounded-full bg-[#FFE8F0] text-sm font-semibold text-[#F43F7A]">${initials(name)}</span>`,
          );
        }}
      />
    </span>
  );
}
