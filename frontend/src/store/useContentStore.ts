import { create } from 'zustand';

export interface SiteContent {
  // Global Site & Branding
  siteBrandName: string;
  siteTagline: string;
  siteLogoUrl?: string;
  footerLogoUrl?: string;

  // Header & Nav Links
  navHomeText: string;
  navAuctionsText: string;
  navClassifiedsText: string;
  navAboutText: string;
  navContactText: string;
  navPostListingButton: string;
  navSignInText: string;
  navRegisterText: string;

  // Footer & Value Pillars
  footerDescription: string;
  footerBadge1Title: string;
  footerBadge1Desc: string;
  footerBadge2Title: string;
  footerBadge2Desc: string;
  footerBadge3Title: string;
  footerBadge3Desc: string;
  footerCopyrightText: string;

  // Home Page Content
  homeHeroBadge: string;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  heroBannerUrl?: string;
  homeSearchPlaceholder: string;
  homeFeature1Title: string;
  homeFeature1Desc: string;
  homeFeature2Title: string;
  homeFeature2Desc: string;
  homeFeature3Title: string;
  homeFeature3Desc: string;
  homeHowItWorksTitle: string;
  homeStep1Title: string;
  homeStep1Desc: string;
  homeStep2Title: string;
  homeStep2Desc: string;
  homeStep3Title: string;
  homeStep3Desc: string;
  homeAuctionsHeading: string;
  homeClassifiedsHeading: string;
  homeFooterCallout: string;

  // Auctions & Classifieds Pages
  auctionsPageTitle: string;
  auctionsPageSubtitle: string;
  classifiedsPageTitle: string;
  classifiedsPageSubtitle: string;

  // About Us Page
  aboutTitle: string;
  aboutSubtitle: string;
  aboutWhoWeAreHeading: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  aboutKycText: string;
  aboutTeamText: string;
  aboutVisionTitle: string;
  aboutProcessTitle: string;
  aboutProcessText: string;

  // Terms & Conditions
  termsTitle: string;
  termsIntro: string;
  termsClause1: string;
  termsClause2: string;
  termsClause3: string;

  // Privacy Policy
  privacyTitle: string;
  privacyText: string;

  // Disclaimer Page
  disclaimerTitle: string;
  disclaimerText: string;

  // Copyright Policy
  copyrightTitle: string;
  copyrightText: string;

  // Contact & Corporate Info
  contactTitle: string;
  contactSubtitle: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactHours: string;
  locationCity: string;
  locationState: string;

  // Top Announcement / Offer Banner (Header Banner)
  offerBannerEnabled: boolean;
  offerBannerText: string;
  offerBannerBadgeText: string;
  offerBannerLinkText: string;
  offerBannerLinkUrl: string;
  offerBannerBgColor: string;
  offerBannerTextColor: string;
}

export const DEFAULT_CONTENT: SiteContent = {
  // Top Announcement / Offer Banner
  offerBannerEnabled: false,
  offerBannerText: 'Special Industrial Liquidation: 0% Platform Buyer Premium on all Ferrous & Non-Ferrous lots this month!',
  offerBannerBadgeText: '🔥 SPECIAL OFFER',
  offerBannerLinkText: 'Explore Auctions →',
  offerBannerLinkUrl: '/auctions',
  offerBannerBgColor: '#0B192C',
  offerBannerTextColor: '#ffffff',
  // Global Site & Branding
  siteBrandName: 'SalvageReef',
  siteTagline: 'AUCTIONS & CLASSIFIEDS',
  siteLogoUrl: './logo.png',
  footerLogoUrl: './logo.png',

  // Header & Nav Links
  navHomeText: 'Home',
  navAuctionsText: 'Auction',
  navClassifiedsText: 'Classifieds',
  navAboutText: 'About Us',
  navContactText: 'Contact Us',
  navPostListingButton: 'Sell Your Scrap',
  navSignInText: 'Sign In',
  navRegisterText: 'Register',


  // Footer & Value Pillars
  footerDescription: 'SalvageReef is a premier salvage auction and scrap marketplace platform connecting verified scrap metal buyers, industrial sellers, and fleet disposers across India.',
  footerBadge1Title: 'Sustainable Practices',
  footerBadge1Desc: 'Responsible recycling & recovery',
  footerBadge2Title: 'Trusted Service',
  footerBadge2Desc: 'Verified buyers & transparent tender bidding',
  footerBadge3Title: 'Better Planet Better Future',
  footerBadge3Desc: 'Building a cleaner tomorrow',
  footerCopyrightText: '© 2026 SalvageReef Auctions & Classifieds. All rights reserved.',

  // Home Page Content
  homeHeroBadge: 'Verified Industrial Marketplace',
  homeHeroTitle: 'Search classified and auctions',
  homeHeroSubtitle: 'Connect directly with verified corporate sellers, liquidators, and industrial buyers across India',
  heroBannerUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80',
  homeSearchPlaceholder: 'Search scrap category, location, or auction lot...',
  homeFeature1Title: 'Verified Corporate Sellers',
  homeFeature1Desc: 'Strict KYC norms ensure reputable sellers and genuine buyers.',
  homeFeature2Title: 'Transparent Bidding',
  homeFeature2Desc: 'Real-time forward auctions with binding financial offers.',
  homeFeature3Title: 'Pan-India Logistics',
  homeFeature3Desc: 'Seamless physical inspection and asset handover support in Mumbai.',
  homeHowItWorksTitle: 'How SalvageReef Works',
  homeStep1Title: '1. Register & KYC',
  homeStep1Desc: 'Create your account and complete identity verification.',
  homeStep2Title: '2. Inspect & Bid Live',
  homeStep2Desc: 'Inspect salvage lots in Mumbai and place competitive bids.',
  homeStep3Title: '3. Pay & Collect',
  homeStep3Desc: 'Complete payment upon winning and arrange asset pickup.',
  homeAuctionsHeading: 'Upcoming Forward Auctions',
  homeClassifiedsHeading: 'Machinery Classifieds',
  homeFooterCallout: 'RECOVER. REUSE. RECYCLE.',

  // Auctions & Classifieds Pages
  auctionsPageTitle: 'Live B2B Forward Auctions',
  auctionsPageSubtitle: 'Bid on industrial scrap, capital machinery, and salvage lots across India',
  classifiedsPageTitle: 'Industrial Scrap & Heavy Machinery Classifieds',
  classifiedsPageSubtitle: 'Direct buy & sell listings for second-hand tools, equipment, and scrap metals',

  // About Us Page
  aboutTitle: 'About SalvageReef',
  aboutSubtitle: 'India\'s Transparent Forward Auction Marketplace for Salvage & Scrap Assets',
  aboutWhoWeAreHeading: 'Transparent & Efficient Marketplace for Distressed & Idle Assets',
  aboutParagraph1: 'SalvageReef is an online marketplace that provides Forward Auctions for the transparent and efficient buying and selling of damaged, distressed, obsolete, old, rejected, abandoned, second-hand, or otherwise unwanted assets, capital equipment, cargo, and merchandise.',
  aboutParagraph2: 'With a strong focus on transparency at every stage of the online auction process, SalvageReef is committed to offering a superior pool of buyers. Our strict KYC (Know Your Customer) norms ensure that all participating parties are screened and verified through a proper identification process, ensuring that only reputable sellers and genuine buyers participate.',
  aboutKycText: 'Strict Know Your Customer (KYC) verification norms ensure that all participating sellers and buyers are fully verified.',
  aboutTeamText: 'The SalvageReef team comprises professionals with diverse backgrounds who share a common vision of creating a broader marketplace.',
  aboutVisionTitle: 'Diverse & Experienced Team',
  aboutProcessTitle: 'Professional & Standardized Process',
  aboutProcessText: 'Through a professional, standardized, and fair auction process, we help businesses efficiently trade salvage and idle assets while benefiting both industry and the economy.',

  // Terms & Conditions
  termsTitle: 'Terms and Conditions',
  termsIntro: 'These Terms & Conditions govern your access to and use of the SalvageReef platform.',
  termsClause1: '1. Registration & KYC Compliance: All buyers and agents must complete Know Your Customer (KYC) verification before placing bids or posting tenders.',
  termsClause2: '2. Forward Bidding Rules: Bids submitted during live auctions are binding financial offers.',
  termsClause3: '3. Asset Inspection: Physical inspection of salvage lots is hosted in Mumbai, Maharashtra prior to bidding close.',

  // Privacy Policy
  privacyTitle: 'Privacy Policy',
  privacyText: 'SalvageReef respects your privacy and is committed to protecting your personal and corporate data.',

  // Disclaimer Page
  disclaimerTitle: 'Disclaimer',
  disclaimerText: `All the contents of this website are provided by Salvagereef for general information and informational purposes only. They do not constitute professional, financial, legal, commercial, or any other form of advice and should not be relied upon in making, or refraining from making, any decision.\n\nSalvagereef makes reasonable efforts to ensure that the information provided on this website is accurate and up to date; however, Salvagereef makes no representation or warranty, express or implied, regarding the quality, accuracy, timeliness, correctness, completeness, reliability, performance, availability, or fitness for a particular purpose of the website or any of its contents, including but not limited to any information, prices, tools, listings, data, or other materials made available through the website.\n\nSalvagereef shall not be liable for any direct, indirect, incidental, consequential, special, or other damages, including without limitation loss of business, loss of profits, loss of opportunities, loss of data, or any other losses or damages arising out of, or in connection with, the use of or inability to use this website or any of its contents, or from any action taken or refrained from being taken based on the information contained on the website.\n\nSalvagereef does not warrant that the website or its contents will always be available, uninterrupted, secure, error-free, or free from viruses or other harmful, contaminating, or destructive components.\n\nUsers are advised to independently verify all information and, where appropriate, obtain professional advice before relying on any information available through this website.\n\nBy accessing and using this website, you acknowledge and agree to the terms of this Disclaimer.`,

  // Copyright Policy
  copyrightTitle: 'Copyright & Intellectual Property Policy',
  copyrightText: 'All content, branding, trademarks, logos, and software code on SalvageReef are protected by intellectual property laws.',

  // Contact & Corporate Info
  contactTitle: 'Contact SalvageReef Operations Desk',
  contactSubtitle: 'Get in touch with our Mumbai team for tender inquiries, listing assistance, or KYC support',
  contactPhone: '+91 7304481166',
  contactEmail: 'salvagereef@gmail.com',
  contactAddress: 'Mumbai, Maharashtra 401101',
  contactHours: 'Mon - Sat: 9:30 AM - 7:00 PM IST',
  locationCity: 'Mumbai',
  locationState: 'Maharashtra',
};

interface ContentStore {
  content: SiteContent;
  previousContentSnapshot: SiteContent | null;
  updateContent: (newContent: Partial<SiteContent>) => void;
  resetContent: () => void;
  revertToPreviousSnapshot: () => boolean;
  fetchContentFromApi: () => Promise<void>;
}

const safeGetItem = (key: string): string | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
};

const safeSetItem = (key: string, val: string) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try { localStorage.setItem(key, val); } catch {}
};

const getInitialContent = (): SiteContent => {
  let stored: Partial<SiteContent> | null = null;
  try {
    const raw = safeGetItem('sr_site_content');
    stored = raw ? JSON.parse(raw) : null;
    if (stored) {
      let needsSave = false;
      if (stored.contactAddress && (stored.contactAddress.includes('Imperial') || stored.contactAddress.includes('Bhayander'))) {
        stored.contactAddress = 'Mumbai, Maharashtra 401101';
        needsSave = true;
      }
      if (!stored.navPostListingButton || stored.navPostListingButton.includes('Post Listing')) {
        stored.navPostListingButton = 'Sell Your Scrap';
        needsSave = true;
      }
      if (!stored.navRegisterText || stored.navRegisterText === 'Register Free') {
        stored.navRegisterText = 'Register';
        needsSave = true;
      }
      if (needsSave) {
        safeSetItem('sr_site_content', JSON.stringify({ ...DEFAULT_CONTENT, ...stored }));
      }
    }
  } catch (e) {
    stored = null;
  }
  const merged = { ...DEFAULT_CONTENT, ...(stored || {}) };
  if (!merged.contactAddress || merged.contactAddress.includes('Imperial') || merged.contactAddress.includes('Bhayander')) {
    merged.contactAddress = 'Mumbai, Maharashtra 401101';
  }
  if (!merged.navPostListingButton || merged.navPostListingButton.includes('Post Listing')) {
    merged.navPostListingButton = 'Sell Your Scrap';
  }
  if (!merged.navRegisterText || merged.navRegisterText === 'Register Free') {
    merged.navRegisterText = 'Register';
  }
  return merged;
};

import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../services/realtimeSync';

export const useContentStore = create<ContentStore>((set) => {
  // Subscribe to real-time content changes across all tabs/windows
  if (typeof window !== 'undefined') {
    subscribeRealtimeEvents((event) => {
      if (event.type === 'content_updated' && event.payload) {
        set((state) => ({ content: { ...state.content, ...event.payload } }));
      }
    });
  }

  return {
    content: getInitialContent(),
    previousContentSnapshot: null,
    updateContent: (newContent) =>
      set((state) => {
        const updated = { ...state.content, ...newContent };
        safeSetItem('sr_site_content', JSON.stringify(updated));
        broadcastRealtimeEvent('content_updated', updated);
        return { 
          previousContentSnapshot: state.content,
          content: updated 
        };
      }),
    resetContent: () => {
      safeSetItem('sr_site_content', JSON.stringify(DEFAULT_CONTENT));
      broadcastRealtimeEvent('content_updated', DEFAULT_CONTENT);
      set((state) => ({ previousContentSnapshot: state.content, content: DEFAULT_CONTENT }));
    },
    revertToPreviousSnapshot: () => {
      let success = false;
      set((state) => {
        if (state.previousContentSnapshot) {
          safeSetItem('sr_site_content', JSON.stringify(state.previousContentSnapshot));
          broadcastRealtimeEvent('content_updated', state.previousContentSnapshot);
          success = true;
          return {
            content: state.previousContentSnapshot,
            previousContentSnapshot: null,
          };
        }
        return state;
      });
      return success;
    },
    fetchContentFromApi: async () => {
      try {
        const apiModule = await import('../services/api');
        const res = await apiModule.default.get('/system/settings');
        if (res.data?.settings && typeof res.data.settings === 'object') {
          const settings = res.data.settings;
          if (settings.contactAddress && (settings.contactAddress.includes('Imperial') || settings.contactAddress.includes('Bhayander'))) {
            settings.contactAddress = 'Mumbai, Maharashtra 401101';
          }
          set((state) => {
            const merged = { ...state.content, ...settings };
            if (merged.contactAddress.includes('Imperial') || merged.contactAddress.includes('Bhayander')) {
              merged.contactAddress = 'Mumbai, Maharashtra 401101';
            }
            safeSetItem('sr_site_content', JSON.stringify(merged));
            return { content: merged };
          });
        } else {
          set((state) => {
            if (state.content.contactAddress.includes('Imperial') || state.content.contactAddress.includes('Bhayander')) {
              const cleaned = { ...state.content, contactAddress: 'Mumbai, Maharashtra 401101' };
              safeSetItem('sr_site_content', JSON.stringify(cleaned));
              return { content: cleaned };
            }
            return state;
          });
        }
      } catch (err) {
        // Fall back silently to cached/default content
      }
    },
  };
});
