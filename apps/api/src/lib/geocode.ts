import { coordsForLocality, type GeoPoint } from './geo';

const USER_AGENT = process.env.GEOCODE_USER_AGENT || 'FindMyRoommate/1.0 (dev@findmyroommate.local)';

export async function geocodeAddress(query: string, city = 'Bengaluru'): Promise<GeoPoint | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const q = `${trimmed}, ${city}, India`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as { lat: string; lon: string }[];
    const hit = rows[0];
    if (!hit) return null;
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export async function resolveCoordinates(input: {
  exactAddress?: string | null;
  locality?: string | null;
  city?: string | null;
}): Promise<GeoPoint | null> {
  if (input.exactAddress?.trim()) {
    const geocoded = await geocodeAddress(input.exactAddress, input.city || 'Bengaluru');
    if (geocoded) return geocoded;
  }
  return coordsForLocality(input.locality);
}
