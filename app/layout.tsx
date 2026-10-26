import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Figtree, IBM_Plex_Mono, Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';

// Self-hosted at build time, so visitors' browsers never call Google.
const sans = Figtree({ subsets: ['latin'], variable: '--f-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-mono' });
const brand = Inter({ subsets: ['latin'], variable: '--f-brand' });
const deva = Noto_Sans_Devanagari({ subsets: ['devanagari'], variable: '--f-deva', preload: false });

const description = 'Hold fn, speak, let go. Clean, punctuated text lands in any app on your Mac about 0.6 seconds later. Free, on your own Groq key.';

export const metadata: Metadata = {
  metadataBase: new URL('https://manishkumarveo-jpg.github.io/Elevique-Flow-releases/'),
  title: 'Elevique Flow · Voice dictation for Mac',
  description,
  openGraph: {
    type: 'website',
    title: 'Elevique Flow · Talk anywhere you type',
    description: 'Free voice dictation for Mac. Hold fn, speak, let go: clean text in any app.',
    images: [{ url: 'og.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#121212', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={[sans.variable, mono.variable, brand.variable, deva.variable].join(' ')} suppressHydrationWarning>
      <head>
        {/* Reveal animations hide content only once we know scripts run; if they haven't started in 3 s, show everything. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__motion)document.documentElement.classList.remove('js')},3000)" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
