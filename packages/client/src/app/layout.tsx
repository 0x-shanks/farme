import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'tldraw/tldraw.css';
import '@farcaster/auth-kit/styles.css';

import { Providers } from './provider';
import { inter } from './fonts';
import { siteOrigin } from './constants';

const title = 'farme';
const description = 'Everyone builds memories onchain';
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteOrigin,
    siteName: 'farme.club',
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    site: '@farmeclub'
  },
  alternates: {
    canonical: siteOrigin
  },
  metadataBase: new URL(siteOrigin)
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
