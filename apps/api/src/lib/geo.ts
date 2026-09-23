export type GeoPoint = { lat: number; lng: number };
export type GeoOrigin = 'office' | 'home';

export const DEFAULT_RADIUS_KM = 5;
export const RADIUS_OPTIONS_KM = [2, 5, 10, 15, 0] as const;

export const LOCALITY_COORDS: Record<string, GeoPoint> = {
  Bellandur: { lat: 12.9256, lng: 77.6763 },
  Kadubeesanahalli: { lat: 12.9365, lng: 77.6953 },
  Marathahalli: { lat: 12.9592, lng: 77.6974 },
  Whitefield: { lat: 12.9698, lng: 77.7499 },
  HSR: { lat: 12.9116, lng: 77.6389 },
  Koramangala: { lat: 12.9352, lng: 77.6245 },
  'Electronic City': { lat: 12.839, lng: 77.677 },
};

export const OFFICE_COORDS: Record<string, GeoPoint> = {
  'RMZ Ecoworld': { lat: 12.9275, lng: 77.685 },
  'Embassy TechVillage': { lat: 12.931, lng: 77.691 },
  Ecospace: { lat: 12.926, lng: 77.679 },
  'Cessna Business Park': { lat: 12.9335, lng: 77.6935 },
  'Prestige Tech Park': { lat: 12.955, lng: 77.7 },
  ITPL: { lat: 12.985, lng: 77.737 },
  'EPIP Zone / Graphite India': { lat: 12.975, lng: 77.745 },
  'Koramangala offices': { lat: 12.9352, lng: 77.6245 },
  'HSR / BTM offices': { lat: 12.9116, lng: 77.6389 },
  'Electronic City Phase 1': { lat: 12.845, lng: 77.665 },
};

export function coordsForLocality(name?: string | null): GeoPoint | null {
  if (!name) return null;
  return LOCALITY_COORDS[name] ?? null;
}

export function coordsForOffice(work?: string | null): GeoPoint | null {
  if (!work) return null;
  return OFFICE_COORDS[work] ?? coordsForLocality(work);
}

export function originCoords(input: {
  workLocation?: string | null;
  localities?: string[];
  origin?: GeoOrigin;
}): GeoPoint | null {
  const origin = input.origin || 'office';
  if (origin === 'office') {
    return coordsForOffice(input.workLocation) || coordsForLocality(input.localities?.[0]);
  }
  return coordsForLocality(input.localities?.[0]) || coordsForOffice(input.workLocation);
}

export function haversineKm(a: GeoPoint, b: GeoPoint) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function distanceKm(from: GeoPoint | null, to: GeoPoint | null) {
  if (!from || !to) return null;
  return Math.round(haversineKm(from, to) * 10) / 10;
}

export function withinRadius(km: number | null, radiusKm?: number | null) {
  if (radiusKm == null || radiusKm <= 0) return true;
  if (km == null) return true;
  return km <= radiusKm;
}

export function distanceLabel(km: number | null, origin: GeoOrigin = 'office') {
  if (km == null) return null;
  const place = origin === 'office' ? 'office' : 'home';
  if (km < 1) return `${Math.round(km * 1000)} m from ${place}`;
  return `${km.toFixed(1)} km from ${place}`;
}
