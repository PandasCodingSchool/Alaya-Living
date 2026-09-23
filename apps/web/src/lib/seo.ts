import type { Metadata } from 'next';

export const SITE_NAME = 'Alaya';
export const SITE_TAGLINE = 'Compatible roommates in Bengaluru';
export const DEFAULT_TITLE = 'Alaya — Find a compatible roommate in Bengaluru';
export const DEFAULT_DESCRIPTION =
  'Alaya matches people who have a room with people who need one in Bengaluru. Filter by budget, corridor, move-in date and lifestyle, then chat only after a mutual match.';

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl()}${normalized === '/' ? '/' : normalized}`;
}

export function localitySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function localityFromSlug(slug: string) {
  return slug
    .split('-')
    .map((part) => (part === 'hsr' ? 'HSR' : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

export function pageMetadata({
  title,
  description,
  path = '/',
  index = true,
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  index?: boolean;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes('Alaya') ? title : `${title} | Alaya`;
  return {
    title: { absolute: fullTitle },
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}
