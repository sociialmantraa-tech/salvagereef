import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: object | object[];
}

export default function SEOHead({
  title = "SalvageReef — Premier Salvage Auction & Scrap Marketplace India",
  description = "SalvageReef connects verified scrap metal buyers, industrial plants, damaged fleet disposers, and scrap sellers across India with real-time bidding.",
  keywords = "salvage auction, scrap metal bidding, heavy machinery classifieds, HMS steel scrap, industrial asset recovery, tender bidding India, scrap copper price",
  canonicalUrl,
  ogImage = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
  ogType = "website",
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes('SalvageReef') ? title : `${title} — SalvageReef`;
    document.title = fullTitle;

    const setMeta = (name: string, content: string, attrName: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attrName}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Tags
    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('robots', 'index, follow');
    setMeta('theme-color', '#0B192C');

    // Open Graph Tags
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', ogType, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:site_name', 'SalvageReef Auctions & Classifieds', 'property');
    setMeta('og:url', canonicalUrl || window.location.href, 'property');

    // Twitter Card Tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // Canonical URL Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl || window.location.href);

    // JSON-LD Structured Data Schema
    let scriptTag = document.getElementById('json-ld-schema') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const defaultOrganizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SalvageReef Operations Desk',
      url: 'https://salvagereef.com',
      logo: 'https://salvagereef.com/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-7304481166',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi', 'Marathi']
      }
    };

    const finalSchema = jsonLd ? (Array.isArray(jsonLd) ? [defaultOrganizationSchema, ...jsonLd] : [defaultOrganizationSchema, jsonLd]) : defaultOrganizationSchema;
    scriptTag.textContent = JSON.stringify(finalSchema);
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, jsonLd]);

  return null;
}
