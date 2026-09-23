import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/discover',
          '/matches',
          '/chat',
          '/listings',
          '/profile',
          '/saved',
          '/premium',
          '/rooms',
          '/people',
          '/onboarding',
          '/verify-phone',
          '/api',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
