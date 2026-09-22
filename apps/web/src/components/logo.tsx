import Link from 'next/link';

export function Logo({ href = '/', light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/alaya-icon.png" alt="Alaya" className="h-9 w-9 rounded-xl" />
      <span className={`text-[17px] font-semibold tracking-[-0.03em] ${light ? 'text-white' : 'text-ink'}`}>
        Alaya
      </span>
    </Link>
  );
}
