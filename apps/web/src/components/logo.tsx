import Link from 'next/link';

export function Logo({ href = '/', light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2" aria-label="Alaya home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/alaya-icon.png" alt="" className="h-8 w-8 rounded-xl sm:h-9 sm:w-9" />
      <span className={`text-[16px] font-semibold tracking-[-0.03em] sm:text-[17px] ${light ? 'text-white' : 'text-ink'}`}>
        Alaya
      </span>
    </Link>
  );
}
