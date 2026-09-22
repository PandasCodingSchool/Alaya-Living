import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import { Shell } from '@/components/shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alaya — Compatible roommates in Bengaluru',
  description:
    'Find a compatible person to share a room with. Match on budget, locality, lifestyle and language — then chat only after both sides agree.',
  icons: { icon: '/brand/alaya-icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-ink antialiased">
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
