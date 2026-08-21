import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import AuctionCard from '../components/AuctionCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Auction } from '../types';
import { INITIAL_AUCTIONS } from '../services/mockService';
import { useCategoryLocationStore } from '../store/useCategoryLocationStore';

import SEOHead from '../components/SEOHead';

export default function Auctions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, locations, setCategories } = useCategoryLocationStore();
  const [auctions, setAuctions] = useState<Auction[]>(INITIAL_AUCTIONS);
  const [loading, setLoading] = useState<boolean>(false);

  const [category, setCategory] = useState<string>(searchParams.get('category_id') || '');
  const [auctionType, setAuctionType] = useState<string>(searchParams.get('auction_type') || '');
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [location, setLocation] = useState<string>(searchParams.get('location') || '');
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');

  const fetchAuctions = async () => {
    if (auctions.length === 0) {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams();
      if (category) params.append('category_id', category);
      if (auctionType) params.append('auction_type', auctionType);
      if (status) params.append('status', status);
      if (location) params.append('location', location);
      if (search) params.append('search', search);

      const [res, catRes] = await Promise.all([
        api.get(`/auctions?${params.toString()}`),
        api.get('/categories'),
      ]);

      if (res.data?.data && res.data.data.length > 0) {
        setAuctions(res.data.data);
      }
      if (catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error fetching auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [category, auctionType, status, location]);

  // Real-time synchronization for auctions list
  useEffect(() => {
    const importAndSubscribe = async () => {
      const { subscribeRealtimeEvents } = await import('../services/realtimeSync');
      return subscribeRealtimeEvents((event) => {
        if (
          event.type === 'auction_created' ||
          event.type === 'auction_updated' ||
          event.type === 'auction_deleted' ||
          event.type === 'bid_status_updated' ||
          event.type === 'winner_confirmed'
        ) {
          fetchAuctions();
        }
      });
    };

    let unsub: any = null;
    importAndSubscribe().then((fn) => { unsub = fn; });

    const pollInterval = setInterval(() => {
      fetchAuctions();
    }, 4000);

    return () => {
      if (unsub) unsub();
      clearInterval(pollInterval);
    };
  }, [category, auctionType, status, location, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuctions();
  };

  const clearFilters = () => {
    setCategory('');
    setAuctionType('');
    setStatus('');
    setLocation('');
    setSearch('');
    setSearchParams({});
  };

  return (
    <div className="bg-[#f2f0e8] min-h-screen py-8 space-y-6">
      <SEOHead
        title="Public Scrap Auctions & Private Corporate Tenders"
        description="Browse and bid on real-time B2B salvage auctions, copper cable scrap, HMS steel, and heavy plant equipment across India."
        keywords="salvage auctions India, scrap bidding, public scrap tenders, private corporate tenders, copper scrap auctions Mumbai"
      />
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Top Search Form Box (Matching SalvorSettlers) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs sm:text-sm font-semibold"
          >
            <div className="sm:col-span-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D70B8]"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D70B8]"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.city}>
                    {loc.city}{loc.state ? `, ${loc.state}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Auction Id/Title"
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D70B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#1D70B8] hover:bg-[#155893] text-white font-bold rounded-xl transition-colors shadow text-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Auction Type Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 pt-3 font-semibold">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuctionType('')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  auctionType === ''
                    ? 'bg-[#1D70B8] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Auctions
              </button>
              <button
                onClick={() => setAuctionType('public')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  auctionType === 'public'
                    ? 'bg-[#1D70B8] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Public Auctions
              </button>
              <button
                onClick={() => setAuctionType('private')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  auctionType === 'private'
                    ? 'bg-[#1D70B8] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Private Tenders
              </button>
              <button
                onClick={() => setAuctionType('group')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  auctionType === 'group'
                    ? 'bg-[#1D70B8] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Group Auctions
              </button>
            </div>

            {(category || auctionType || status || location || search) && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#1D70B8] font-bold hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Grid - 2 Cards per Row on Warm Light Background */}
        <div>
          {loading ? (
            <SkeletonLoader count={6} />
          ) : auctions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <h3 className="text-base font-bold text-slate-800">No Auctions Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No auctions match your current search criteria. Try resetting your search filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#1D70B8] text-white font-bold rounded-xl text-xs shadow"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {auctions.map((auc) => (
                <AuctionCard key={auc.id} auction={auc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
