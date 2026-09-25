'use client';

import { inr, prettyEnum } from '@/lib/format';
import type { PgSharingOption } from '@/lib/types';

export const SHARING_TIER_LABELS: Record<PgSharingOption['sharingType'], string> = {
  SINGLE: 'Single sharing',
  DOUBLE: 'Double sharing',
  TRIPLE: 'Triple sharing',
};

export type SharingTierDraft = {
  sharingType: PgSharingOption['sharingType'];
  enabled: boolean;
  monthlyRent: number;
  bedsAvailable: number;
  totalBeds: number;
};

export const defaultSharingTiers = (): SharingTierDraft[] => [
  { sharingType: 'SINGLE', enabled: true, monthlyRent: 12000, bedsAvailable: 1, totalBeds: 4 },
  { sharingType: 'DOUBLE', enabled: true, monthlyRent: 9500, bedsAvailable: 2, totalBeds: 6 },
  { sharingType: 'TRIPLE', enabled: false, monthlyRent: 8000, bedsAvailable: 0, totalBeds: 0 },
];

export function tiersFromListing(options?: PgSharingOption[] | null): SharingTierDraft[] {
  const map = new Map((options ?? []).map((row) => [row.sharingType, row]));
  return (['SINGLE', 'DOUBLE', 'TRIPLE'] as const).map((sharingType) => {
    const row = map.get(sharingType);
    return {
      sharingType,
      enabled: !!row && row.totalBeds > 0,
      monthlyRent: row?.monthlyRent ?? (sharingType === 'SINGLE' ? 12000 : sharingType === 'DOUBLE' ? 9500 : 8000),
      bedsAvailable: row?.bedsAvailable ?? 0,
      totalBeds: row?.totalBeds ?? 0,
    };
  });
}

export function tiersToPayload(tiers: SharingTierDraft[]) {
  return tiers
    .filter((tier) => tier.enabled && tier.totalBeds > 0)
    .map((tier) => ({
      sharingType: tier.sharingType,
      monthlyRent: tier.monthlyRent,
      bedsAvailable: tier.bedsAvailable,
      totalBeds: tier.totalBeds,
    }));
}

export function SharingTiersForm({
  tiers,
  onChange,
}: {
  tiers: SharingTierDraft[];
  onChange: (tiers: SharingTierDraft[]) => void;
}) {
  function update(index: number, patch: Partial<SharingTierDraft>) {
    onChange(tiers.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">Sharing & pricing</p>
        <p className="mt-1 text-xs text-muted">
          Set rent and vacancy for single, double, and triple sharing. Disable a type if you don&apos;t offer it.
        </p>
      </div>
      {tiers.map((tier, index) => (
        <div key={tier.sharingType} className="panel space-y-3 p-4">
          <label className="flex items-center justify-between gap-3 text-sm font-medium">
            <span>{SHARING_TIER_LABELS[tier.sharingType]}</span>
            <input
              type="checkbox"
              checked={tier.enabled}
              onChange={(e) => update(index, { enabled: e.target.checked })}
              className="rounded"
            />
          </label>
          {tier.enabled && (
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-xs text-muted">
                Rent / bed (₹)
                <input
                  type="number"
                  min={1000}
                  required
                  value={tier.monthlyRent}
                  onChange={(e) => update(index, { monthlyRent: Number(e.target.value) })}
                  className="field mt-1"
                />
              </label>
              <label className="block text-xs text-muted">
                Beds open
                <input
                  type="number"
                  min={0}
                  required
                  value={tier.bedsAvailable}
                  onChange={(e) => update(index, { bedsAvailable: Number(e.target.value) })}
                  className="field mt-1"
                />
              </label>
              <label className="block text-xs text-muted">
                Total beds
                <input
                  type="number"
                  min={1}
                  required
                  value={tier.totalBeds}
                  onChange={(e) => update(index, { totalBeds: Number(e.target.value) })}
                  className="field mt-1"
                />
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function SharingTiersTable({
  options,
  monthlyRent,
  bedsAvailable,
  totalBeds,
}: {
  options?: PgSharingOption[] | null;
  monthlyRent?: number;
  bedsAvailable?: number;
  totalBeds?: number;
}) {
  const rows = (options ?? []).filter((row) => row.totalBeds > 0);
  if (!rows.length) {
    if (monthlyRent == null) return null;
    return (
      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FFF1F5] text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Sharing type</th>
              <th className="px-4 py-3 font-medium">Rent / bed</th>
              <th className="px-4 py-3 font-medium">Vacancy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 font-medium">{SHARING_TIER_LABELS.SINGLE}</td>
              <td className="px-4 py-3">{inr(monthlyRent)}</td>
              <td className="px-4 py-3">
                {(bedsAvailable ?? 0) > 0 ? (
                  <span className="font-medium text-forest">{bedsAvailable} open</span>
                ) : (
                  <span className="text-muted">Full</span>
                )}
                {totalBeds != null && <span className="text-muted"> · {totalBeds} total</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#FFF1F5] text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Sharing type</th>
            <th className="px-4 py-3 font-medium">Rent / bed</th>
            <th className="px-4 py-3 font-medium">Vacancy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand">
          {rows.map((row) => (
            <tr key={row.sharingType}>
              <td className="px-4 py-3 font-medium">{SHARING_TIER_LABELS[row.sharingType]}</td>
              <td className="px-4 py-3">{inr(row.monthlyRent)}</td>
              <td className="px-4 py-3">
                {row.bedsAvailable > 0 ? (
                  <span className="font-medium text-forest">{row.bedsAvailable} open</span>
                ) : (
                  <span className="text-muted">Full</span>
                )}
                <span className="text-muted"> · {row.totalBeds} total</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function sharingTierSummary(options?: PgSharingOption[] | null, monthlyRent?: number) {
  const rows = (options ?? []).filter((row) => row.totalBeds > 0);
  if (!rows.length) {
    return monthlyRent != null ? `From ${inr(monthlyRent)}` : 'No beds open';
  }
  const active = rows.filter((row) => row.bedsAvailable > 0);
  const minRent = active.length
    ? Math.min(...active.map((row) => row.monthlyRent))
    : Math.min(...rows.map((row) => row.monthlyRent));
  return active.length ? `From ${inr(minRent)}` : 'No beds open';
}
