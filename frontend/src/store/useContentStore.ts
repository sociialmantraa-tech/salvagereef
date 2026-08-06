import { create } from 'zustand';

export interface SiteContent {
  // Home Page
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeSearchPlaceholder: string;
  homeAuctionsHeading: string;
  homeClassifiedsHeading: string;
  homeFooterCallout: string;

  // About Us Page
  aboutTitle: string;
  aboutSubtitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  aboutKycText: string;
  aboutTeamText: string;

  // Terms & Conditions
  termsTitle: string;
  termsIntro: string;
  termsClause1: string;
  termsClause2: string;
  termsClause3: string;

  // Privacy Policy
  privacyTitle: string;
  privacyText: string;

  // Copyright Policy
  copyrightTitle: string;
  copyrightText: string;

  // Contact & Corporate Info
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  locationCity: string;
  locationState: string;
}

const DEFAULT_CONTENT: SiteContent = {
  homeHeroTitle: 'Search classified and auctions',
  homeHeroSubtitle: 'India\'s B2B marketplace for Forward Auctions, industrial scrap, and capital assets.',
  homeSearchPlaceholder: 'Enter Action Id or Title...',
  homeAuctionsHeading: 'Upcoming Forward Auctions',
  homeClassifiedsHeading: 'Machinery Classifieds',
  homeFooterCallout: 'RECOVER. REUSE. RECYCLE.',

  aboutTitle: 'About SalvageReef',
  aboutSubtitle: 'India\'s Transparent Forward Auction Marketplace for Salvage & Scrap Assets',
  aboutParagraph1: 'SalvageReef is an online marketplace that provides Forward Auctions for the transparent and efficient buying and selling of damaged, distressed, obsolete, old, rejected, abandoned, second-hand, or otherwise unwanted assets, capital equipment, cargo, and merchandise.',
  aboutParagraph2: 'With a strong focus on transparency at every stage of the online auction process, SalvageReef is committed to offering a superior pool of buyers. Our strict KYC (Know Your Customer) norms ensure that all participating parties are screened and verified through a proper identification process, ensuring that only reputable sellers and genuine buyers participate.',
  aboutKycText: 'Strict Know Your Customer (KYC) verification norms ensure that all participating sellers and buyers are fully verified.',
  aboutTeamText: 'The SalvageReef team comprises professionals with diverse backgrounds who share a common vision of creating a broader marketplace.',

  termsTitle: 'Terms and Conditions',
  termsIntro: 'These Terms & Conditions govern your access to and use of the SalvageReef platform.',
  termsClause1: '1. Registration & KYC Compliance: All buyers and agents must complete Know Your Customer (KYC) verification before placing bids or posting tenders.',
  termsClause2: '2. Forward Bidding Rules: Bids submitted during live auctions are binding financial offers.',
  termsClause3: '3. Asset Inspection: Physical inspection of salvage lots is hosted in Mumbai, Maharashtra prior to bidding close.',

  privacyTitle: 'Privacy Policy',
  privacyText: 'SalvageReef respects your privacy and is committed to protecting your personal and corporate data.',

  copyrightTitle: 'Copyright & Intellectual Property Policy',
  copyrightText: 'All content, branding, trademarks, logos, and software code on SalvageReef are protected by intellectual property laws.',

  contactPhone: '+91 7304481166',
  contactEmail: 'salvagereef@gmail.com',
  contactAddress: '101 Imperial Bldg, Bhayander West, Mumbai, Maharashtra 401101',
  locationCity: 'Mumbai',
  locationState: 'Maharashtra',
};

interface ContentStore {
  content: SiteContent;
  updateContent: (newContent: Partial<SiteContent>) => void;
  resetContent: () => void;
}

export const useContentStore = create<ContentStore>((set) => ({
  content: JSON.parse(localStorage.getItem('sr_site_content') || 'null') || DEFAULT_CONTENT,
  updateContent: (newContent) =>
    set((state) => {
      const updated = { ...state.content, ...newContent };
      localStorage.setItem('sr_site_content', JSON.stringify(updated));
      return { content: updated };
    }),
  resetContent: () => {
    localStorage.setItem('sr_site_content', JSON.stringify(DEFAULT_CONTENT));
    set({ content: DEFAULT_CONTENT });
  },
}));
