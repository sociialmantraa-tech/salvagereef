import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getEcho } from '../services/echo';
import api from '../services/api';
import { Gavel, Clock, Trophy, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { Auction, Bid } from '../types';

import { formatBidderName } from '../utils/formatUtils';

interface LiveBiddingWidgetProps {
  auction: Auction;
  onBidSuccess?: (data?: any) => void;
}

export default function LiveBiddingWidget({ auction: initialAuction, onBidSuccess }: LiveBiddingWidgetProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [auction, setAuction] = useState<Auction>(initialAuction);
  const [bids, setBids] = useState<Bid[]>(initialAuction.bids || []);
  const [currentHighest, setCurrentHighest] = useState<number>(
    initialAuction.current_highest_bid || initialAuction.starting_price
  );
  const [bidAmount, setBidAmount] = useState<string | number>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [highlightPulse, setHighlightPulse] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isClosed: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isClosed: false,
  });

  useEffect(() => {
    setAuction(initialAuction);
    setBids(initialAuction.bids || []);
    setCurrentHighest(initialAuction.current_highest_bid || initialAuction.starting_price);
    setBidAmount((initialAuction.current_highest_bid || initialAuction.starting_price) + 1000);
  }, [initialAuction]);

  useEffect(() => {
    if (!auction?.end_time) return;

    const calculateTime = () => {
      const end = new Date(auction.end_time!).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isClosed: true });
        setAuction((prev) => ({ ...prev, status: 'closed' }));
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isClosed: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [auction?.end_time]);

  useEffect(() => {
    if (!auction?.id) return;

    const echo = getEcho();
    let channel: any = null;

    if (echo) {
      channel = echo.channel(`auction.${auction.id}`);

      channel.listen('.BidPlaced', (data: any) => {
        setCurrentHighest(data.amount);
        setBids((prevBids) => [
          {
            id: Date.now(),
            amount: data.amount,
            user: { name: data.bidder_name },
            created_at: data.created_at,
          },
          ...prevBids,
        ]);
        setHighlightPulse(true);
        setTimeout(() => setHighlightPulse(false), 1500);
      });

      channel.listen('.AuctionClosed', (data: any) => {
        setAuction((prev) => ({ ...prev, status: 'closed' }));
        if (data.winning_bid) {
          setCurrentHighest(data.winning_bid);
        }
      });
    }

    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get(`/auctions/${auction.slug || auction.id}`);
        const fresh: Auction = res.data.auction;
        if (fresh) {
          if (fresh.current_highest_bid && fresh.current_highest_bid > currentHighest) {
            setCurrentHighest(fresh.current_highest_bid);
            setBids(fresh.bids || []);
            setHighlightPulse(true);
            setTimeout(() => setHighlightPulse(false), 1500);
          }
          if (fresh.status !== auction.status) {
            setAuction((prev) => ({ ...prev, status: fresh.status }));
          }
        }
      } catch (e) {
        // Silent poll error
      }
    }, 4000);

    return () => {
      if (channel) {
        channel.stopListening('.BidPlaced');
        channel.stopListening('.AuctionClosed');
      }
      clearInterval(pollInterval);
    };
  }, [auction?.id, auction?.slug, currentHighest]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!isAuthenticated) {
      setError('Please sign in or register to place a bid.');
      return;
    }

    const numAmount = parseFloat(String(bidAmount));
    if (isNaN(numAmount) || numAmount <= currentHighest) {
      setError(`Bid must be greater than current highest ₹${currentHighest.toLocaleString('en-IN')}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/auctions/${auction.id}/bid`, { amount: numAmount });
      setSuccessMsg(res.data.message || 'Bid placed successfully!');
      setCurrentHighest(numAmount);
      setBidAmount(numAmount + 1000);
      if (onBidSuccess) onBidSuccess(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to place bid. Someone may have outbid you!';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isClosed = auction?.status === 'closed' || timeLeft.isClosed;
  const isUpcoming = auction?.status === 'upcoming';
  const isLive = auction?.status === 'live' && !isClosed;
  const isOwner = user?.id === auction?.created_by;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6">
      {/* Current Highest Bid Box with Pulse Highlight */}
      <div
        className={`p-5 rounded-xl transition-all duration-500 border ${
          highlightPulse
            ? 'bg-[#D48B1C]/20 border-[#D48B1C] scale-102 shadow-lg animate-bid-pulse'
            : isClosed
            ? 'bg-slate-100 border-slate-300'
            : 'bg-[#0B192C] border-[#0B192C] text-white'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isClosed ? 'text-slate-500' : 'text-[#D48B1C]'}`}>
            {isClosed ? 'Final Winning Bid' : 'Current Highest Bid'}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Bidding
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-3xl sm:text-4xl font-black ${isClosed ? 'text-slate-800' : 'text-white'}`}>
            ₹{Number(currentHighest).toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400">
            (Starting: ₹{Number(auction.starting_price).toLocaleString('en-IN')})
          </span>
        </div>

        {/* Live Countdown */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#D48B1C]" /> Time Remaining:
          </span>
          <span className="font-mono font-bold text-[#D48B1C]">
            {isClosed ? (
              <span className="text-red-400">AUCTION CLOSED</span>
            ) : (
              `${String(timeLeft.hours).padStart(2, '0')}h : ${String(timeLeft.minutes).padStart(2, '0')}m : ${String(timeLeft.seconds).padStart(2, '0')}s`
            )}
          </span>
        </div>
      </div>

      {/* Notifications / Errors */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Bid Placement Form */}
      {isClosed ? (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
          <Trophy className="w-8 h-8 text-[#D48B1C] mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">Auction Has Ended</h4>
          <p className="text-xs text-slate-500">
            Bidding is now locked for this lot.
          </p>
        </div>
      ) : isUpcoming ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center space-y-1">
          <Clock className="w-6 h-6 text-[#D48B1C] mx-auto" />
          <h4 className="font-bold text-amber-900 text-sm">Auction Starts Soon</h4>
          <p className="text-xs text-amber-700">
            Bidding opens at {new Date(auction.start_time!).toLocaleString('en-IN')}.
          </p>
        </div>
      ) : isOwner ? (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center text-xs text-blue-800">
          <ShieldAlert className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          You are the creator of this auction lot. You cannot place bids on your own listing.
        </div>
      ) : (
        <form onSubmit={handlePlaceBid} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Enter Bid Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="500"
                min={currentHighest + 1}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={submitting}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D48B1C] focus:bg-white text-base"
                placeholder="Enter amount"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum bid required: ₹{(Number(currentHighest) + 1).toLocaleString('en-IN')}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#D48B1C] hover:bg-[#B87514] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Submitting Bid...
              </>
            ) : (
              <>
                <Gavel className="w-4 h-4" /> Place Real-Time Bid
              </>
            )}
          </button>
        </form>
      )}

      {/* Live Recent Bids History */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Bid History ({bids.length})</span>
          <span className="text-[10px] text-slate-400 font-normal">Real-time updates</span>
        </h4>

        {bids.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2 text-center">
            No bids placed yet. Be the first bidder!
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {bids.map((b, idx) => (
              <div
                key={b.id || idx}
                className={`flex justify-between items-center p-2.5 rounded-lg text-xs border ${
                  idx === 0 ? 'bg-[#D48B1C]/10 border-[#D48B1C]/30 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {idx === 0 && <Trophy className="w-3.5 h-3.5 text-[#D48B1C]" />}
                  <span>{formatBidderName(b.user?.name || b.bidder_name, user?.role === 'admin')}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">₹{Number(b.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
