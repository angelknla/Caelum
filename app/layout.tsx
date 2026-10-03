import Header from '@components/Header/Header';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { hasAppAccess, readViewer } from '@/lib/session';
import '@/styles/globals.css';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-display', display: 'swap' });
const interfaceFont = Manrope({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });
export const metadata: Metadata = { title: 'Caelum', description: 'Your sky. Your story.' };

export default async function RootLayout({ children }: { children: ReactNode }) {
    const signedIn = (await hasAppAccess()) && Boolean((await readViewer()).memberId);
    return (
        <html lang="en" className={`${display.variable} ${interfaceFont.variable}`}>
            <body>
            <a className="skipLink" href="#main">Skip to content</a>
                <Header signedIn={signedIn} />
            <main id="main">{children}</main>
            </body>
        </html>
    );
}