import { BadgeCheck } from 'lucide-react';
import type { Profile } from '@/lib/types';

export function VerificationBadges({
  profile,
  propertyVerified,
  compact = false,
}: {
  profile: Pick<Profile, 'phoneVerified' | 'identityVerified' | 'employmentVerified' | 'propertyVerified'>;
  propertyVerified?: boolean;
  compact?: boolean;
}) {
  const badges: string[] = [];
  if (profile.phoneVerified) badges.push('Phone');
  if (profile.identityVerified) badges.push('ID');
  if (profile.employmentVerified) badges.push('Work');
  if (propertyVerified || profile.propertyVerified) badges.push('Property');
  if (!badges.length) return null;

  return (
    <p className={`flex flex-wrap items-center gap-2 font-mono text-[11px] font-medium text-forest ${compact ? '' : 'mt-3'}`}>
      <BadgeCheck className="h-3.5 w-3.5" />
      {badges.map((label) => (
        <span key={label} className="rounded-full bg-[#E8F5EE] px-2 py-0.5">
          {label} verified
        </span>
      ))}
    </p>
  );
}
