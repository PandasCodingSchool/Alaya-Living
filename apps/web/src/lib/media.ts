const portraits: Record<string, string> = {
  pankaj: '/images/portrait-pankaj.png',
  arjun: '/images/portrait-arjun.png',
  priya: '/images/portrait-priya.png',
  rahul: '/images/portrait-rahul.png',
  vivek: '/images/portrait-vivek.png',
};

const extras = [
  '/images/portrait-arjun.png',
  '/images/portrait-pankaj.png',
  '/images/portrait-priya.png',
  '/images/portrait-rahul.png',
  '/images/portrait-vivek.png',
];

export function portraitFor(name?: string | null, photoUrl?: string | null) {
  if (photoUrl) return photoUrl;
  const key = (name || '').toLowerCase().split(' ')[0];
  if (portraits[key]) return portraits[key];
  const index = Math.abs((name || 'x').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % extras.length;
  return extras[index];
}

export function roomPhotoFor(locality?: string, photos?: string[]) {
  if (photos?.[0]) return photos[0];
  if (locality === 'HSR' || locality === 'Koramangala') return '/images/room-hsr.png';
  return '/images/room-single.png';
}
