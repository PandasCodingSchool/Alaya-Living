import { SavedSearchKind } from '@prisma/client';

type Filters = Record<string, unknown>;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function num(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function textIncludes(haystack: string, needle: unknown) {
  if (typeof needle !== 'string' || !needle.trim()) return true;
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

export function listingMatchesSavedSearch(
  kind: SavedSearchKind,
  filters: Filters,
  listing: Record<string, unknown>,
): boolean {
  if (kind === 'PEOPLE') return false;

  const localities = asStringArray(filters.localities);
  const locality = typeof listing.locality === 'string' ? listing.locality : '';
  if (localities.length && !localities.includes(locality)) return false;

  const minBudget = num(filters.minBudget);
  const maxBudget = num(filters.maxBudget);

  if (kind === 'ROOMS') {
    const rent = num(listing.roommateContribution);
    if (minBudget != null && rent != null && rent < minBudget) return false;
    if (maxBudget != null && rent != null && rent > maxBudget) return false;
    if (filters.roomType && listing.roomType !== filters.roomType) return false;
  }

  if (kind === 'PGS') {
    const rent = num(listing.monthlyRent);
    if (minBudget != null && rent != null && rent < minBudget) return false;
    if (maxBudget != null && rent != null && rent > maxBudget) return false;
    const gender = filters.gender;
    if (gender && listing.genderPolicy !== gender && listing.genderPolicy !== 'ANY') return false;
  }

  if (kind === 'FLATS') {
    const rent = num(listing.monthlyRent);
    if (minBudget != null && rent != null && rent < minBudget) return false;
    if (maxBudget != null && rent != null && rent > maxBudget) return false;
    if (filters.roomType && listing.bhk !== filters.roomType) return false;
  }

  const q = filters.q;
  if (q) {
    const title = typeof listing.title === 'string' ? listing.title : '';
    const notes = typeof listing.notes === 'string' ? listing.notes : '';
    if (!textIncludes(`${title} ${notes} ${locality}`, q)) return false;
  }

  return true;
}
