import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { BookmarkProvider } from '@/lib/bookmarks';
import { InboxProvider } from '@/lib/inbox';
import { absoluteUrl, DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, siteUrl } from '@/lib/seo';
import { JsonLd, organizationJsonLd, softwareJsonLd, websiteJsonLd } from '@/components/json-ld';
import { Shell } from '@/components/shell';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'lifestyle',
  keywords: [
    'roommate Bengaluru',
    'find roommate Bellandur',
    'share room Whitefield',
    'compatible roommate',
    'PG sharing permission',
    'HSR roommate',
    'Alaya',
  ],
  alternates: { canonical: absoluteUrl('/') },
  robots: { index: true, follow: true },
  icons: {
    icon: '/brand/alaya-icon.png',
    apple: '/brand/alaya-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: absoluteUrl('/'),
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: '#14080E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const url = siteUrl();
  return (
    <html lang="en-IN" className={poppins.variable}>
      <body className="font-sans text-ink antialiased">
        <JsonLd data={[organizationJsonLd(url), websiteJsonLd(url), softwareJsonLd(url)]} />
        <AuthProvider>
          <InboxProvider>
            <BookmarkProvider>
              <Shell>{children}</Shell>
            </BookmarkProvider>
          </InboxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
