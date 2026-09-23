export const TECH_PARKS: { name: string; locality: string; nearby: string[] }[] = [
  { name: 'RMZ Ecoworld', locality: 'Bellandur', nearby: ['Bellandur', 'Kadubeesanahalli', 'Marathahalli'] },
  { name: 'Embassy TechVillage', locality: 'Bellandur', nearby: ['Bellandur', 'Kadubeesanahalli', 'Marathahalli'] },
  { name: 'Ecospace', locality: 'Bellandur', nearby: ['Bellandur', 'Kadubeesanahalli'] },
  { name: 'Cessna Business Park', locality: 'Kadubeesanahalli', nearby: ['Kadubeesanahalli', 'Bellandur', 'Marathahalli'] },
  { name: 'Prestige Tech Park', locality: 'Marathahalli', nearby: ['Marathahalli', 'Bellandur', 'Whitefield'] },
  { name: 'ITPL', locality: 'Whitefield', nearby: ['Whitefield', 'Marathahalli'] },
  { name: 'EPIP Zone / Graphite India', locality: 'Whitefield', nearby: ['Whitefield', 'Marathahalli'] },
  { name: 'Koramangala offices', locality: 'Koramangala', nearby: ['Koramangala', 'HSR'] },
  { name: 'HSR / BTM offices', locality: 'HSR', nearby: ['HSR', 'Koramangala'] },
  { name: 'Electronic City Phase 1', locality: 'Electronic City', nearby: ['Electronic City'] },
  { name: 'Remote / no fixed office', locality: '', nearby: [] },
];

export type TechParkName = (typeof TECH_PARKS)[number]['name'];

export function findPark(work?: string | null) {
  if (!work) return null;
  return TECH_PARKS.find((park) => park.name === work || park.locality === work) ?? null;
}

export function officeLocalities(work?: string | null) {
  const park = findPark(work);
  if (!park) return work ? [work] : [];
  return [...new Set([park.locality, ...park.nearby].filter(Boolean))];
}

/** 4 same park, 3 same office locality, 2 nearby corridor, 1 far, 0 unknown */
export function officeProximity(aWork?: string | null, bWork?: string | null) {
  if (!aWork && !bWork) return 0;
  if (aWork && bWork && aWork === bWork) return 4;
  const a = findPark(aWork);
  const b = findPark(bWork);
  if (a?.locality && b?.locality && a.locality === b.locality) return 3;
  if (a && b && ((b.locality && a.nearby.includes(b.locality)) || (a.locality && b.nearby.includes(a.locality)))) {
    return 2;
  }
  if (aWork && bWork) return 1;
  return 0;
}

export function officeProximityLabel(score: number) {
  if (score >= 4) return 'Same tech park';
  if (score >= 3) return 'Same office corridor';
  if (score >= 2) return 'Nearby tech-park corridor';
  if (score >= 1) return 'Farther office';
  return 'Office not set';
}

export function isOppositeGender(a?: string | null, b?: string | null) {
  return (a === 'MALE' && b === 'FEMALE') || (a === 'FEMALE' && b === 'MALE');
}
