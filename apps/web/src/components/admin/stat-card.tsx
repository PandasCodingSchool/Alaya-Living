import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  sub,
  href,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className="panel block p-5 transition hover:border-clay/40 hover:shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFE8F0] text-clay">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
