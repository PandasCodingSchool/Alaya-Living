import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Alaya — Compatible roommates in Bengaluru',
    short_name: 'Alaya',
    description: 'Find a compatible person to share a room with in Bengaluru.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF6F0',
    theme_color: '#14080E',
    lang: 'en-IN',
    icons: [
      { src: '/brand/alaya-icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/alaya-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
