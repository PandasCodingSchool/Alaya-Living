export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const payload = Array.isArray(data)
    ? { '@context': 'https://schema.org', '@graph': data.map(({ '@context': _context, ...rest }) => rest) }
    : data;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export function organizationJsonLd(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Alaya',
    url,
    logo: `${url}/brand/alaya-icon.png`,
    description:
      'Alaya matches compatible roommates in Bengaluru using budget, locality, lifestyle and mutual consent before chat.',
    areaServed: { '@type': 'City', name: 'Bengaluru', containedInPlace: { '@type': 'Country', name: 'India' } },
  };
}

export function websiteJsonLd(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Alaya',
    url,
    inLanguage: 'en-IN',
    publisher: { '@type': 'Organization', name: 'Alaya', url },
  };
}

export function softwareJsonLd(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Alaya',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    url,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    description:
      'Find a compatible roommate in Bengaluru. Match on budget, corridor and lifestyle, then chat only after both people agree.',
    featureList: [
      'Explained compatibility score',
      'Hard filters for budget and locality',
      'Chat after mutual match',
      'Hidden phone and exact address',
      'Office-radius search',
    ],
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
