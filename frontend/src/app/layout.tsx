import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0B192C',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'SalvageReef — Salvage Auction & Scrap Marketplace India',
  description: 'SalvageReef connects verified scrap metal buyers, industrial plants, damaged fleet disposers, and scrap sellers across India with real-time bidding.',
  keywords: [
    'salvage auction',
    'scrap metal bidding',
    'heavy machinery classifieds',
    'HMS steel scrap',
    'industrial asset recovery',
    'tender bidding India',
    'scrap copper price'
  ],
  authors: [{ name: 'SalvageReef Operations Desk' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    title: 'SalvageReef — B2B Industrial Salvage Auctions & Scrap Marketplace',
    description: "India's premier scrap buyer & seller platform. Real-time bidding on industrial scrap metal, damaged fleet vehicles, and factory assets.",
    siteName: 'SalvageReef',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'SalvageReef Scrap Auctions & Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SalvageReef — B2B Industrial Salvage Auctions & Scrap Marketplace',
    description: "India's premier scrap buyer & seller platform. Real-time bidding on industrial scrap metal, damaged fleet vehicles, and factory assets.",
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'SalvageReef Operations Desk',
              url: 'https://salvagereef.com',
              description: 'B2B salvage auction and scrap marketplace platform in India.',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-7304481166',
                contactType: 'customer service',
                areaServed: 'IN',
              },
            }),
          }}
        />
      </head>
      <body className="bg-[#f2f0e8] text-slate-800 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
