'use client';

import { Plus, Trash2 } from 'lucide-react';
import { SHARING_TIER_LABELS } from '@/components/pg-sharing-tiers';
import { inr } from '@/lib/format';
import type { PgBed, PgSharingOption } from '@/lib/types';

export type BedDraft = {
  key: string;
  roomLabel: string;
  bedLabel: string;
  sharingType: PgBed['sharingType'];
  monthlyRent: number;
  status: PgBed['status'];
};

let bedKeyCounter = 0;
function newBedKey() {
  bedKeyCounter += 1;
  return `bed-${bedKeyCounter}`;
}

export function defaultBeds(): BedDraft[] {
  return [
    { key: newBedKey(), roomLabel: 'Room 101', bedLabel: 'A', sharingType: 'SINGLE', monthlyRent: 12000, status: 'AVAILABLE' },
    { key: newBedKey(), roomLabel: 'Room 102', bedLabel: 'A', sharingType: 'SINGLE', monthlyRent: 12000, status: 'OCCUPIED' },
    { key: newBedKey(), roomLabel: 'Room 201', bedLabel: 'A', sharingType: 'DOUBLE', monthlyRent: 9500, status: 'AVAILABLE' },
    { key: newBedKey(), roomLabel: 'Room 201', bedLabel: 'B', sharingType: 'DOUBLE', monthlyRent: 9500, status: 'AVAILABLE' },
    { key: newBedKey(), roomLabel: 'Room 202', bedLabel: 'A', sharingType: 'DOUBLE', monthlyRent: 9500, status: 'OCCUPIED' },
    { key: newBedKey(), roomLabel: 'Room 202', bedLabel: 'B', sharingType: 'DOUBLE', monthlyRent: 9500, status: 'OCCUPIED' },
  ];
}

export function bedsFromListing(beds?: PgBed[] | null): BedDraft[] {
  if (beds?.length) {
    return beds.map((bed) => ({
      key: bed.id,
      roomLabel: bed.roomLabel,
      bedLabel: bed.bedLabel,
      sharingType: bed.sharingType,
      monthlyRent: bed.monthlyRent,
      status: bed.status,
    }));
  }
  return defaultBeds();
}

export function bedsToPayload(beds: BedDraft[]) {
  return beds
    .filter((bed) => bed.roomLabel.trim() && bed.bedLabel.trim())
    .map(({ roomLabel, bedLabel, sharingType, monthlyRent, status }) => ({
      roomLabel: roomLabel.trim(),
      bedLabel: bedLabel.trim(),
      sharingType,
      monthlyRent,
      status,
    }));
}

export function bedInventorySummary(beds?: PgBed[] | null, sharingOptions?: PgSharingOption[] | null, monthlyRent?: number) {
  const rows = beds ?? [];
  if (rows.length) {
    const open = rows.filter((bed) => bed.status === 'AVAILABLE');
    const minRent = open.length
      ? Math.min(...open.map((bed) => bed.monthlyRent))
      : Math.min(...rows.map((bed) => bed.monthlyRent));
    return open.length ? `From ${inr(minRent)}` : 'No beds open';
  }
  const tiers = (sharingOptions ?? []).filter((row) => row.totalBeds > 0);
  if (!tiers.length) return monthlyRent != null ? `From ${inr(monthlyRent)}` : 'No beds open';
  const active = tiers.filter((row) => row.bedsAvailable > 0);
  const minRent = active.length
    ? Math.min(...active.map((row) => row.monthlyRent))
    : Math.min(...tiers.map((row) => row.monthlyRent));
  return active.length ? `From ${inr(minRent)}` : 'No beds open';
}

export function BedInventoryForm({
  beds,
  onChange,
}: {
  beds: BedDraft[];
  onChange: (beds: BedDraft[]) => void;
}) {
  function update(index: number, patch: Partial<BedDraft>) {
    onChange(beds.map((bed, i) => (i === index ? { ...bed, ...patch } : bed)));
  }

  function remove(index: number) {
    onChange(beds.filter((_, i) => i !== index));
  }

  function addBed() {
    onChange([
      ...beds,
      {
        key: newBedKey(),
        roomLabel: '',
        bedLabel: 'A',
        sharingType: 'DOUBLE',
        monthlyRent: 9000,
        status: 'AVAILABLE',
      },
    ]);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">Bed inventory</p>
        <p className="mt-1 text-xs text-muted">
          Add each bed with room name, bed label, sharing type, rent, and vacancy.
        </p>
      </div>
      <div className="space-y-2">
        {beds.map((bed, index) => (
          <div key={bed.key} className="panel grid gap-2 p-3 sm:grid-cols-[1fr_72px_1fr_1fr_auto_auto] sm:items-end">
            <label className="block text-xs text-muted">
              Room
              <input
                required
                value={bed.roomLabel}
                onChange={(e) => update(index, { roomLabel: e.target.value })}
                placeholder="Room 4"
                className="field mt-1"
              />
            </label>
            <label className="block text-xs text-muted">
              Bed
              <input
                required
                value={bed.bedLabel}
                onChange={(e) => update(index, { bedLabel: e.target.value.toUpperCase() })}
                placeholder="A"
                className="field mt-1"
              />
            </label>
            <label className="block text-xs text-muted">
              Sharing
              <select
                value={bed.sharingType}
                onChange={(e) => update(index, { sharingType: e.target.value as BedDraft['sharingType'] })}
                className="field mt-1"
              >
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="TRIPLE">Triple</option>
              </select>
            </label>
            <label className="block text-xs text-muted">
              Rent (₹)
              <input
                type="number"
                min={1000}
                required
                value={bed.monthlyRent}
                onChange={(e) => update(index, { monthlyRent: Number(e.target.value) })}
                className="field mt-1"
              />
            </label>
            <label className="block text-xs text-muted">
              Status
              <select
                value={bed.status}
                onChange={(e) => update(index, { status: e.target.value as BedDraft['status'] })}
                className="field mt-1"
              >
                <option value="AVAILABLE">Open</option>
                <option value="OCCUPIED">Occupied</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => remove(index)}
              className="btn-ghost grid h-10 w-10 place-items-center self-end p-0 text-muted hover:text-clay"
              aria-label="Remove bed"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addBed} className="btn-ghost inline-flex items-center gap-2 text-sm">
        <Plus className="h-4 w-4" /> Add bed
      </button>
    </div>
  );
}

export function BedInventoryTable({
  beds,
  ownerView,
}: {
  beds?: PgBed[] | null;
  ownerView?: boolean;
}) {
  const rows = beds ?? [];
  if (!rows.length) return null;

  const grouped = rows.reduce<Map<string, PgBed[]>>((map, bed) => {
    const list = map.get(bed.roomLabel) ?? [];
    list.push(bed);
    map.set(bed.roomLabel, list);
    return map;
  }, new Map());

  const visible = ownerView ? rows : rows.filter((bed) => bed.status === 'AVAILABLE');

  if (!visible.length && !ownerView) {
    return <p className="text-sm text-muted">All beds are occupied right now.</p>;
  }

  return (
    <div className="panel overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#FFF1F5] text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Room · Bed</th>
            <th className="px-4 py-3 font-medium">Sharing</th>
            <th className="px-4 py-3 font-medium">Rent</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand">
          {(ownerView ? rows : visible).map((bed) => (
            <tr key={bed.id}>
              <td className="px-4 py-3 font-medium">
                {bed.roomLabel} · Bed {bed.bedLabel}
              </td>
              <td className="px-4 py-3">{SHARING_TIER_LABELS[bed.sharingType]}</td>
              <td className="px-4 py-3">{inr(bed.monthlyRent)}</td>
              <td className="px-4 py-3">
                {bed.status === 'AVAILABLE' ? (
                  <span className="font-medium text-forest">Open</span>
                ) : (
                  <span className="text-muted">Occupied</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!ownerView && grouped.size > 0 && (
        <p className="border-t border-sand px-4 py-2 text-xs text-muted">
          {visible.length} bed{visible.length === 1 ? '' : 's'} open across {grouped.size} room{grouped.size === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}

export function BedQuickToggle({
  beds,
  onChange,
}: {
  beds: BedDraft[];
  onChange: (beds: BedDraft[]) => void;
}) {
  function toggle(index: number) {
    onChange(
      beds.map((bed, i) =>
        i === index
          ? { ...bed, status: bed.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE' }
          : bed,
      ),
    );
  }

  return (
    <div className="space-y-2">
      {beds.map((bed, index) => (
        <label
          key={bed.key}
          className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-sand px-4 py-3 text-sm"
        >
          <span>
            <span className="font-medium">{bed.roomLabel || 'Room'} · Bed {bed.bedLabel}</span>
            <span className="ml-2 text-muted">{inr(bed.monthlyRent)}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className={bed.status === 'AVAILABLE' ? 'text-forest' : 'text-muted'}>
              {bed.status === 'AVAILABLE' ? 'Open' : 'Occupied'}
            </span>
            <input
              type="checkbox"
              checked={bed.status === 'AVAILABLE'}
              onChange={() => toggle(index)}
              className="rounded"
            />
          </span>
        </label>
      ))}
    </div>
  );
}
