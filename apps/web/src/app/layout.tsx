import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '../components/providers';
import { AppShell } from '../components/layout/app-shell';
import { SkipToContent } from '../components/ui/skip-link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CampusPulse — Discover University Opportunities',
  description:
    'CampusPulse is the all-in-one platform for university students to discover academic, career, competitive, research, social, cultural, sports, and other campus opportunities.',
  keywords: [
    'university',
    'campus',
    'opportunities',
    'events',
    'clubs',
    'organizations',
    'student life',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SkipToContent href="#main" />
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
