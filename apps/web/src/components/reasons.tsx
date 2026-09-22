import type { CompatibilityReason } from '@/lib/types';

export function Reasons({ reasons }: { reasons: CompatibilityReason[] }) {
  if (!reasons.length) return null;
  return (
    <ul className="mt-4 space-y-1.5 text-[13px] leading-5">
      {reasons.map((reason) => (
        <li key={`${reason.factor}-${reason.description}`} className="flex gap-2">
          <span className={`mt-0.5 font-mono text-[11px] ${reason.kind === 'POSITIVE' ? 'text-forest' : 'text-orange-600'}`}>
            {reason.kind === 'POSITIVE' ? '+' : '–'}
          </span>
          <span className={reason.kind === 'POSITIVE' ? 'text-ink/80' : 'text-muted'}>{reason.description}</span>
        </li>
      ))}
    </ul>
  );
}
