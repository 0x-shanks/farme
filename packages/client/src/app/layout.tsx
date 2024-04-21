import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'tldraw/tldraw.css';
import '@farcaster/auth-kit/styles.css';

import { Providers } from './provider';
import { inter } from './fonts';

export const metadata: Metadata = {
  title: 'farme',
  description: 'Everyone builds memories onchain'
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
