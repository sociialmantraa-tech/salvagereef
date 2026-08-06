import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AuctionCard from '../components/AuctionCard';
import ClassifiedCard from '../components/ClassifiedCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Search } from 'lucide-react';
import { Auction, Classified, Category } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const [liveAuctions, setLiveAuctions] = useState<Auction[]>([]);
  const [classifieds, setClassifieds] = useState<Classified[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search Form Filters matching Seal The Deal banner
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [listingType, setListingType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aucRes, classRes, catRes] = await Promise.all([
          api.get('/auctions'),
          api.get('/classifieds'),
          api.get('/categories'),
        ]);

        setLiveAuctions(aucRes.data.data || []);
        setClassifieds((classRes.data.data || []).slice(0, 4));
        setCategories(catRes.data || []);
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
      {/* Hero Sunset Cityscape Banner (Exact Seal The Deal layout) */}
      <section className="relative min-h-[440px] py-12 px-4 bg-slate-900 flex flex-col justify-center items-center overflow-hidden">
        {/* Full-width High-Res City Skyline Sunset Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80"
            alt="City Skyline Sunset"
            className="w-full h-full object-cover object-center opacity-70"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/70"></div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-3xl mx-auto space-y-6 text-center">
          {/* Main Title Banner Header */}
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            Search classified and auctions
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
                  <option value="Thane">Thane</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
              </div>

              {/* Row 3: Action Id/Title & Search Button */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Action Id/Title"
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

      {/* Upcoming Auction Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Upcoming Auction
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

      {/* Direct Scrap Machinery Classifieds */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900">Direct Scrap Machinery Classifieds</h2>
          <Link to="/classifieds" className="text-xs font-bold text-[#0096C7] hover:underline">
            View All Classifieds &rarr;
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classifieds.map((cl) => (
              <ClassifiedCard key={cl.id} classified={cl} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
