import Header from '@components/Header/Header';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';
import '@/styles/globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-display',
  display: 'swap',
});
const interfaceFont = Manrope({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });
export const metadata: Metadata = { title: 'Caelum', description: 'Your sky. Your story.' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const signedIn = Boolean(await getCurrentAccount());
  let chartReady = false;
  if (signedIn) {
    try {
      chartReady = Boolean((await getBirthProfile())?.chart);
    } catch (error) {
      if (!(error instanceof ProfileStorageError)) throw error;
    }
  }
  return (
    <html lang="en" className={`${display.variable} ${interfaceFont.variable}`}>
      <body>
        <a className="skipLink" href="#main">
          Skip to content
        </a>
        <Header signedIn={signedIn} chartReady={chartReady} />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
