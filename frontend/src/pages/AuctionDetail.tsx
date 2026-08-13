import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LiveBiddingWidget from '../components/LiveBiddingWidget';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Building, Layers, ShieldCheck, CheckCircle2, Send, ChevronRight } from 'lucide-react';
import { Auction } from '../types';
import { INITIAL_AUCTIONS } from '../services/mockService';

import SEOHead from '../components/SEOHead';

export default function AuctionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();

  const initialMatch = INITIAL_AUCTIONS.find((a) => a.slug === slug || a.id.toString() === slug) || INITIAL_AUCTIONS[0];
  const [auction, setAuction] = useState<Auction | null>(initialMatch);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<number>(0);

  const [interestMsg, setInterestMsg] = useState<string>('');
  const [submittingInterest, setSubmittingInterest] = useState<boolean>(false);
  const [interestSubmitted, setInterestSubmitted] = useState<boolean>(false);

  const fetchAuctionDetail = async () => {
    if (!auction) {
      setLoading(true);
    }
    try {
      const res = await api.get(`/auctions/${slug}`);
      if (res.data?.auction) {
        setAuction(res.data.auction);
        setIsUnlocked(res.data.is_unlocked ?? true);
      }
    } catch (err) {
      console.error('Error loading auction detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionDetail();
  }, [slug]);

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !auction) return;

    setSubmittingInterest(true);
    try {
      await api.post(`/auctions/${auction.id}/interest`, { message: interestMsg });
      setInterestSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit interest');
    } finally {
      setSubmittingInterest(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#D48B1C] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-xs font-semibold">Loading Salvage Lot Specifications...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Auction Lot Not Found</h2>
        <p className="text-xs text-slate-500">The specified auction lot could not be found or has been removed.</p>
        <Link to="/auctions" className="inline-block px-6 py-2.5 bg-[#D48B1C] text-white font-bold rounded-xl text-xs">
          Return to Auctions
        </Link>
      </div>
    );
  }

  const images = auction.images && auction.images.length > 0
    ? auction.images.map((img) => img.image_path)
    : ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEOHead
        title={`${auction.title} (Starting ₹${Number(auction.starting_price).toLocaleString('en-IN')})`}
        description={`Live Auction Lot #${auction.id}: ${auction.title} located in ${auction.location_city}, ${auction.location_state}. ${auction.description.substring(0, 140)}...`}
        keywords={`${auction.title}, ${auction.category?.name || 'scrap'}, ${auction.location_city} scrap auction, salvage lot ${auction.id}`}
        ogImage={images[0]}
        ogType="product"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: auction.title,
          description: auction.description,
          image: images[0],
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'INR',
            lowPrice: auction.starting_price,
            highPrice: auction.current_highest_bid || auction.starting_price,
            offerCount: auction.bids?.length || 1,
            price: auction.current_highest_bid || auction.starting_price,
            availability: 'https://schema.org/InStock'
          }
        }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-[#D48B1C]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/auctions" className="hover:text-[#D48B1C]">Auctions</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{auction.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={images[activeImage]}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-[#0B192C] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {auction.auction_type} Lot
                </span>
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider text-white ${
                  auction.status === 'live' ? 'bg-emerald-600' : 'bg-slate-700'
                }`}>
                  {auction.status}
                </span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === idx ? 'border-[#D48B1C] scale-105' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              {(() => {
                let displayCode = `LOT-#${auction.id}`;
                let displayTitle = auction.title;
                if (auction.title && auction.title.includes('|')) {
                  const parts = auction.title.split('|');
                  if (parts[0] && parts[0].trim().length <= 15) {
                    displayCode = parts[0].trim();
                    displayTitle = parts.slice(1).join('|').trim();
                  }
                }
                return (
                  <>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                      <span className="bg-[#0077B6]/15 text-[#0077B6] border border-[#0077B6]/30 font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase">
                        {displayCode}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-[#D48B1C]">{auction.category?.name}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                      {displayTitle}
                    </h1>
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Total Quantity</span>
                <span className="font-bold text-slate-900 text-sm">{auction.quantity} {auction.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Starting Price</span>
                <span className="font-bold text-slate-900 text-sm">₹{Number(auction.starting_price).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Location</span>
                <span className="font-bold text-slate-900 text-sm">{auction.location_city}, {auction.location_state}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Tender Type</span>
                <span className="font-bold text-slate-900 text-sm capitalize">{auction.auction_type}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Lot Description</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {auction.description}
              </p>
            </div>

            {auction.is_group && auction.group_children && auction.group_children.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#D48B1C]" /> Sub-Lots Included in Group ({auction.group_children.length})
                </h3>
                <div className="space-y-2">
                  {auction.group_children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/auctions/${child.slug}`}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs hover:border-[#D48B1C] transition-colors"
                    >
                      <span className="font-semibold text-slate-800">{child.title}</span>
                      <span className="text-[#D48B1C] font-bold">₹{Number(child.starting_price).toLocaleString('en-IN')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Building className="w-4 h-4 text-[#D48B1C]" /> Seller: {auction.creator?.company_name || auction.creator?.name || 'SalvageReef Verified Seller'}
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Agent
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          {!isUnlocked ? (
            <div className="bg-white rounded-3xl p-6 border-2 border-purple-200 shadow-xl space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Private Auction Lot Locked</h3>
                <p className="text-xs text-slate-500 mt-1">
                  This tender is confidential and restricted to approved corporate buyers. Express interest to request bidding permission.
                </p>
              </div>

              {interestSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-sm">Interest Submitted</h4>
                  <p className="text-xs text-emerald-700">
                    Your request has been submitted to SalvageReef admin desk. You will be notified once access is approved.
                  </p>
                </div>
              ) : isAuthenticated ? (
                <form onSubmit={handleInterestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reason / Company Message for Seller
                    </label>
                    <textarea
                      rows={3}
                      value={interestMsg}
                      onChange={(e) => setInterestMsg(e.target.value)}
                      placeholder="e.g. Requesting access to place bulk scrap tender bid..."
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInterest}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Request Tender Access
                  </button>
                </form>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-3">
                  <p className="text-xs text-slate-600">Please sign in to request access to this private tender.</p>
                  <Link
                    to="/login"
                    className="inline-block px-6 py-2 bg-[#D48B1C] text-white font-bold rounded-xl text-xs"
                  >
                    Sign In Now
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <LiveBiddingWidget auction={auction} onBidSuccess={fetchAuctionDetail} />
          )}
        </div>
      </div>
    </div>
  );
}
