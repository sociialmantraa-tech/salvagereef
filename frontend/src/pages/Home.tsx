import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AuctionCard from '../components/AuctionCard';
import ClassifiedCard from '../components/ClassifiedCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Search, ShieldCheck, Gavel, Truck } from 'lucide-react';
import { Auction, Classified } from '../types';
import { INITIAL_AUCTIONS, INITIAL_CLASSIFIEDS } from '../services/mockService';
import { useCategoryLocationStore } from '../store/useCategoryLocationStore';
import { useContentStore } from '../store/useContentStore';

import SEOHead from '../components/SEOHead';

export default function Home() {
  const navigate = useNavigate();
  const { categories, locations } = useCategoryLocationStore();
  const { content } = useContentStore();
  const [liveAuctions, setLiveAuctions] = useState<Auction[]>(INITIAL_AUCTIONS);
  const [classifieds, setClassifieds] = useState<Classified[]>(INITIAL_CLASSIFIEDS.slice(0, 4));
  const [loading, setLoading] = useState<boolean>(false);

  // Search Form Filters matching Seal The Deal banner
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [listingType, setListingType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aucRes, classRes] = await Promise.all([
          api.get('/auctions').catch(() => null),
          api.get('/classifieds').catch(() => null),
        ]);

        if (aucRes?.data?.data && aucRes.data.data.length > 0) {
          setLiveAuctions(aucRes.data.data);
        }
        if (classRes?.data?.data && classRes.data.data.length > 0) {
          setClassifieds(classRes.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCategory) params.append('category_id', searchCategory);
    if (listingType) params.append('auction_type', listingType);
    if (location) params.append('location', location);
    if (searchQuery) params.append('search', searchQuery);
    navigate(`/auctions?${params.toString()}`);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16 space-y-10">
      <SEOHead
        title={content.siteBrandName ? `${content.siteBrandName} — B2B Salvage Auctions & Heavy Scrap Marketplace` : undefined}
        description={content.homeHeroTitle ? `${content.homeHeroTitle} on SalvageReef. Bid on industrial scrap metal, damaged plant equipment, and commercial lots across India.` : undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: content.siteBrandName || 'SalvageReef',
          url: window.location.origin,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${window.location.origin}/auctions?search={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }}
      />
      {/* Hero Sunset Cityscape Banner */}
      <section className="relative min-h-[440px] py-12 px-4 bg-slate-900 flex flex-col justify-center items-center overflow-hidden">
        {/* Full-width High-Res City Skyline Sunset Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={content.heroBannerUrl || "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80"}
            alt="Hero Banner"
            className="w-full h-full object-cover object-center opacity-70"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/70"></div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-3xl mx-auto space-y-6 text-center">
          {/* Main Title Banner Header */}
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            {content.homeHeroTitle || 'Search classified and auctions'}
          </h1>

          {/* Floating Dark Glassmorphism Filter Card */}
          <div className="bg-[#1e293b]/75 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-slate-600/40 shadow-2xl space-y-3.5">
            <form onSubmit={handleSearch} className="space-y-3 text-xs sm:text-sm font-medium">
              {/* Row 1: Select Category */}
              <div>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full p-3 bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0096C7] font-medium"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Listing Type & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full p-3 bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0096C7] font-medium"
                >
                  <option value="">Listing Type</option>
                  <option value="public">Public Auctions</option>
                  <option value="private">Private Tenders</option>
                  <option value="group">Group Lots</option>
                </select>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0096C7] font-medium"
                >
                  <option value="">Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.city}>
                      {loc.city}{loc.state ? `, ${loc.state}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3: Action Id/Title & Search Button */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={content.homeSearchPlaceholder || 'Enter Action Id or Title...'}
                    className="w-full p-3 bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0096C7] font-medium"
                  />
                </div>

                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    className="w-full h-full py-3 bg-[#0096C7] hover:bg-[#0077B6] text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 text-sm uppercase tracking-wider"
                  >
                    <Search className="w-4 h-4" /> Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Value Cards */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">{content.homeFeature1Title || 'Verified Corporate Sellers'}</h3>
            <p className="text-slate-600 text-xs leading-relaxed">{content.homeFeature1Desc || 'Strict KYC norms ensure reputable sellers and genuine buyers.'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D48B1C] flex items-center justify-center shrink-0">
            <Gavel className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">{content.homeFeature2Title || 'Transparent Bidding'}</h3>
            <p className="text-slate-600 text-xs leading-relaxed">{content.homeFeature2Desc || 'Real-time forward auctions with binding financial offers.'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">{content.homeFeature3Title || 'Pan-India Logistics'}</h3>
            <p className="text-slate-600 text-xs leading-relaxed">{content.homeFeature3Desc || 'Seamless physical inspection and asset handover support in Mumbai.'}</p>
          </div>
        </div>
      </section>

      {/* Upcoming Auction Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {content.homeAuctionsHeading || 'Upcoming Forward Auctions'}
          </h2>

          <Link
            to="/auctions"
            className="text-xs font-bold text-[#0096C7] hover:underline"
          >
            View All Auctions &rarr;
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={4} />
        ) : liveAuctions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No active auctions found. Explore upcoming auctions in the portal.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveAuctions.map((auc) => (
              <AuctionCard key={auc.id} auction={auc} />
            ))}
          </div>
        )}
      </section>

      {/* Machinery Classifieds Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {content.homeClassifiedsHeading || 'Machinery Classifieds'}
          </h2>

          <Link
            to="/classifieds"
            className="text-xs font-bold text-[#0096C7] hover:underline"
          >
            Explore All Classifieds &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {classifieds.map((cls) => (
            <ClassifiedCard key={cls.id} classified={cls} />
          ))}
        </div>
      </section>
    </div>
  );
}
