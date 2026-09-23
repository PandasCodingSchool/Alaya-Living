import type { MetadataRoute } from 'next';
import { corridors } from '@/lib/marketing';
import { absoluteUrl, localitySlug } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    { path: '/', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/stories', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/register', priority: 0.7, changeFrequency: 'yearly' as const },
    { path: '/login', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    ...corridors.map((corridor) => ({
      path: `/bengaluru/${localitySlug(corridor.name)}`,
      priority: 0.7,
      changeFrequency: 'weekly' as const,
    })),
  ];

  return pages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
