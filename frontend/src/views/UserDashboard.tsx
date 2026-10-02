import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Gavel, Trophy, Eye, Tag, ArrowUpRight, Clock } from 'lucide-react';
import { Classified } from '../types';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dashboardData, setDashboardData] = useState<{
    stats: { active_bids: number; auctions_won: number; watchlist_count: number };
    recent_bids: any[];
    my_listings: Classified[];
  }>({
    stats: { active_bids: 0, auctions_won: 0, watchlist_count: 0 },
    recent_bids: [],
    my_listings: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/user/dashboard');
        setDashboardData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#D48B1C] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const { stats, recent_bids, my_listings } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Pending Admin Approval Banner */}
      {!user?.is_verified && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                Account Verification Pending Admin Approval
                <span className="px-2.5 py-0.5 bg-amber-200/80 text-amber-900 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                  Under Review
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                Thank you for registering on SalvageReef! Your submitted profile details and KYC documents (PAN, GST, Bank Cheque) are currently being reviewed by our Admin Team. You will receive bidding and listing privileges as soon as your account is approved.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/917304481166?text=Hello%20SalvageReef%2C%20I%20registered%20my%20vendor%20account%20and%20would%20like%20to%20inquire%20about%20admin%20verification."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5"
          >
            Chat with Admin Desk
          </a>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0B192C] text-white p-6 sm:p-8 rounded-3xl border-b-4 border-[#D48B1C] shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[#D48B1C] text-xs font-bold uppercase tracking-wider block mb-1">
            {user?.role === 'agent' ? 'SalvageReef Verified Seller Dashboard' : 'SalvageReef Buyer Dashboard'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <span>{user?.company_name || (user?.role === 'agent' ? 'Scrap Vendor' : 'Independent Buyer')}</span>
            <span>&bull;</span>
            <span className="text-[#D48B1C] font-semibold">{user?.city}, {user?.state}</span>
          </p>
        </div>

        {/* Action Button & Tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/sell-scrap"
            className="px-4 py-2 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" /> + Sell Your Scrap
          </Link>

          {/* Top Tab Bar */}
          <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'overview' ? 'bg-[#D48B1C] text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'bids' ? 'bg-[#D48B1C] text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              My Bids
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'listings' ? 'bg-[#D48B1C] text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              My Products ({my_listings.length})
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Simple Stat Cards ONLY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Active Bids</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.active_bids}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D48B1C] border border-amber-200 flex items-center justify-center">
            <Gavel className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Auctions Won</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.auctions_won}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Watchlist</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.watchlist_count}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Single Clean List: My Recent Bids */}
      {(activeTab === 'overview' || activeTab === 'bids') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[#D48B1C]" /> My Recent Bids
            </h3>
            <span className="text-xs text-slate-400">Total Bids ({recent_bids.length})</span>
          </div>

          {recent_bids.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              You have not placed any bids yet. Explore live tenders to place your first bid!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent_bids.map((bid) => {
                let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                if (bid.my_status === 'winning') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (bid.my_status === 'outbid') badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
                if (bid.my_status === 'won') badgeStyle = 'bg-emerald-600 text-white';
                if (bid.my_status === 'lost') badgeStyle = 'bg-red-50 text-red-700 border-red-200';

                return (
                  <div key={bid.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <Link
                        to={`/auctions/${bid.auction_slug}`}
                        className="font-bold text-slate-900 text-sm hover:text-[#D48B1C] transition-colors flex items-center gap-1.5"
                      >
                        {bid.auction_title} <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                      <p className="text-xs text-slate-500">
                        Placed on {new Date(bid.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">My Bid</span>
                        <span className="font-black text-slate-900 text-sm">₹{Number(bid.bid_amount).toLocaleString('en-IN')}</span>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${badgeStyle}`}>
                        {bid.my_status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Simple "My Listings" Section */}
      {my_listings.length > 0 && (activeTab === 'overview' || activeTab === 'listings') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#D48B1C]" /> My Classified Listings
            </h3>
            {(user?.role === 'admin' || user?.role === 'agent') && (
              <Link to="/classifieds/post-listing" className="text-xs font-bold text-[#D48B1C] hover:underline">
                + Post New Listing
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {my_listings.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-[#D48B1C]">₹{Number(item.price).toLocaleString('en-IN')}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
