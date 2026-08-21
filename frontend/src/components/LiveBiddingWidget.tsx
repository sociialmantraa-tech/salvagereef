import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { getEcho } from '../services/echo';
import api from '../services/api';
import { Gavel, Clock, Trophy, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Lock, ShieldCheck } from 'lucide-react';
import { Auction, Bid } from '../types';
import { formatBidderName } from '../utils/formatUtils';
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../services/realtimeSync';

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

  const incrementStep = initialAuction.bid_increment && Number(initialAuction.bid_increment) > 0
    ? Number(initialAuction.bid_increment)
    : 1000;

  const minAllowedBid = currentHighest + incrementStep;

  const [bidAmount, setBidAmount] = useState<string | number>(minAllowedBid);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [highlightPulse, setHighlightPulse] = useState<boolean>(false);

  // Pre-Bid Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isClosed: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isClosed: false,
  });

  useEffect(() => {
    setAuction(initialAuction);
    setBids(initialAuction.bids || []);
    const highest = initialAuction.current_highest_bid || initialAuction.starting_price;
    const step = initialAuction.bid_increment && Number(initialAuction.bid_increment) > 0 ? Number(initialAuction.bid_increment) : 1000;
    setCurrentHighest(highest);
    setBidAmount(highest + step);
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

  // Real-time Event Subscription & Active Polling across all browsers
  useEffect(() => {
    if (!auction?.id) return;

    const unsubscribeRealtime = subscribeRealtimeEvents((event) => {
      if (event.type === 'bid_status_updated' && (event.payload?.auctionId === auction.id || event.payload?.auction_id === auction.id)) {
        if (event.payload.status === 'approved' && Number(event.payload.amount) > 0) {
          const approvedAmount = Number(event.payload.amount);
          setCurrentHighest(approvedAmount);
          setBidAmount(approvedAmount + incrementStep);
          setHighlightPulse(true);
          setBids((prev) => [
            {
              id: event.payload.bidId || Date.now(),
              amount: approvedAmount,
              status: 'approved',
              user: { name: event.payload.bidder_name || 'Verified Bidder' },
              created_at: new Date().toISOString(),
            },
            ...prev.filter((b) => b.id !== event.payload.bidId),
          ]);
          setTimeout(() => setHighlightPulse(false), 2000);
        }
      } else if (event.type === 'auction_updated' && event.payload?.id === auction.id) {
        setAuction((prev) => ({ ...prev, ...event.payload }));
      }
    });

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
      } catch (e) {}
    }, 3000);

    return () => {
      unsubscribeRealtime();
      clearInterval(pollInterval);
    };
  }, [auction?.id, auction?.slug, currentHighest, incrementStep]);

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!isAuthenticated) {
      setError('Please sign in or register to place a bid.');
      return;
    }

    const numAmount = parseFloat(String(bidAmount));
    if (isNaN(numAmount) || numAmount < minAllowedBid) {
      setError(`Bid amount must be at least ₹${minAllowedBid.toLocaleString('en-IN')} (Minimum increment step of ₹${incrementStep.toLocaleString('en-IN')}).`);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalBidSubmit = async () => {
    setShowConfirmModal(false);
    const numAmount = parseFloat(String(bidAmount));
    setSubmitting(true);

    try {
      const res = await api.post(`/auctions/${auction.id}/bid`, { amount: numAmount });
      setSuccessMsg(res.data?.message || `✓ Your bid of ₹${numAmount.toLocaleString('en-IN')} is submitted! Pending Admin Review & Approval.`);
      if (res.data?.new_end_time) {
        setAuction((prev) => ({ ...prev, end_time: res.data.new_end_time }));
      }

      const newBidObj = {
        id: res.data?.bid_id || Date.now(),
        auction_id: auction.id,
        auction_title: auction.title,
        amount: numAmount,
        status: 'pending',
        bidder_name: user?.name || 'Registered Bidder',
        bidder_email: user?.email || 'bidder@salvagereef.com',
        bidder_company: user?.company_name || 'Metals & Scrap Trader',
        created_at: new Date().toISOString(),
      };

      // Add to local state
      setBids((prev) => [newBidObj as any, ...prev]);

      // Save into sr_admin_bids so Admin console sees it immediately
      try {
        const storedBids = JSON.parse(localStorage.getItem('sr_admin_bids') || '[]');
        const updatedBids = [newBidObj, ...storedBids.filter((b: any) => b.id !== newBidObj.id)];
        localStorage.setItem('sr_admin_bids', JSON.stringify(updatedBids));
      } catch {}

      // Broadcast live event to Admin Panel in real time
      broadcastRealtimeEvent('bid_submitted', newBidObj);

      if (onBidSuccess) onBidSuccess(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to place bid. Another bidder may have placed a higher bid!';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isClosed = auction?.status === 'closed' || timeLeft.isClosed;
  const isUpcoming = auction?.status === 'upcoming';
  const isLive = auction?.status === 'live' && !isClosed;
  const isOwner = user?.id === auction?.created_by;

  const getWhatsAppAlertUrl = () => {
    const highestBidderName = bids[0]?.user?.name || bids[0]?.bidder_name || 'Highest Bidder';
    const text = encodeURIComponent(
      `SalvageReef Update: Bidding has ENDED for Auction Lot #${auction.id} (${auction.title}). Final Winning Bid: ₹${Number(currentHighest).toLocaleString('en-IN')}. Highest Bidder: ${formatBidderName(highestBidderName, false)}.`
    );
    return `https://wa.me/917304481166?text=${text}`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6">
      {/* Current Highest Bid Box */}
      <div
        className={`p-5 rounded-2xl transition-all duration-500 border ${
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
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Bidding
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`text-3xl sm:text-4xl font-black ${isClosed ? 'text-slate-800' : 'text-white'}`}>
            ₹{Number(currentHighest).toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            (Starting Price: ₹{Number(auction.starting_price).toLocaleString('en-IN')})
          </span>
        </div>

        {/* MINIMUM NEXT BID & BID INCREMENT DISPLAY */}
        <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block font-bold">Min Next Allowed Bid</span>
            <span className="text-amber-300 font-extrabold font-mono text-sm">
              ₹{minAllowedBid.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block font-bold">Bid Increment Step</span>
            <span className="text-emerald-300 font-extrabold font-mono text-sm">
              + ₹{incrementStep.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Live Countdown */}
        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
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
        <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 p-3.5 rounded-2xl text-xs font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3.5 rounded-2xl text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Bid Placement Form */}
      {isClosed ? (
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-3">
          <Trophy className="w-8 h-8 text-[#D48B1C] mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">Bidding Closed — Pending Admin Approval</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Bidding for this lot is completed. Top bidders H1, H2, and H3 are under final admin selection.
          </p>
          <a
            href={getWhatsAppAlertUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition-all"
          >
            Send WhatsApp Auction Completion Alert
          </a>
        </div>
      ) : isUpcoming ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center space-y-1">
          <Clock className="w-6 h-6 text-[#D48B1C] mx-auto" />
          <h4 className="font-bold text-amber-900 text-sm">Auction Starts Soon</h4>
          <p className="text-xs text-amber-700">
            Bidding opens at {new Date(auction.start_time!).toLocaleString('en-IN')}.
          </p>
        </div>
      ) : !isAuthenticated ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-[#D48B1C] p-5 rounded-2xl text-center space-y-3 shadow-md">
          <div className="w-10 h-10 bg-[#D48B1C] text-white rounded-full flex items-center justify-center mx-auto shadow">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Bidding Restricted to Verified Bidders</h4>
            <p className="text-xs text-slate-600 mt-1">
              Please sign in or complete the 3-stage business vendor registration to place bids.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              to="/login"
              className="px-5 py-2.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-extrabold rounded-xl text-xs shadow transition-all"
            >
              Sign In &rarr;
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all"
            >
              Register Account
            </Link>
          </div>
        </div>
      ) : isOwner ? (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center text-xs text-blue-800">
          <ShieldAlert className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          You are the creator of this auction lot. You cannot place bids on your own listing.
        </div>
      ) : (
        <form onSubmit={handleOpenConfirmModal} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Enter Your Bid Amount (₹)
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                Min: ₹{minAllowedBid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                step={incrementStep}
                min={minAllowedBid}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={submitting}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D48B1C] focus:bg-white text-lg font-mono shadow-inner"
                placeholder="Enter bid amount"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D48B1C]" />
              <span>Each bid must increase by at least ₹{incrementStep.toLocaleString('en-IN')}.</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Processing Bid...
              </>
            ) : (
              <>
                <Gavel className="w-4 h-4" /> Review & Place Bid
              </>
            )}
          </button>
        </form>
      )}

      {/* LIVE RECENT BIDS HISTORY TABLE (MASKED BIDDER NAMES) */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Bid History ({bids.length})</span>
          <span className="text-[10px] text-slate-400 font-semibold font-mono">Live Stream</span>
        </h4>

        {bids.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2 text-center">
            No bids placed yet. Be the first bidder!
          </p>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {bids.map((b, idx) => (
              <div
                key={b.id || idx}
                className={`flex justify-between items-center p-3 rounded-xl text-xs border transition-all ${
                  idx === 0
                    ? 'bg-[#D48B1C]/10 border-[#D48B1C]/40 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {idx === 0 && <Trophy className="w-4 h-4 text-[#D48B1C] shrink-0" />}
                  <div>
                    {/* ENFORCES FIRST 2 + *** + LAST 2 MASKING (e.g. Ne***ma) */}
                    <span className="font-bold text-slate-900 block font-mono">
                      {formatBidderName(b.user?.name || b.bidder_name, user?.role === 'admin')}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {b.created_at ? new Date(b.created_at).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-slate-900 text-sm font-mono block">
                    ₹{Number(b.amount).toLocaleString('en-IN')}
                  </span>
                  {idx === 0 && (
                    <span className="text-[9px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded uppercase">
                      Highest Bid
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRE-BID ALERT CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 text-slate-900">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl border border-amber-300">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Confirm Real-Time Bid</h3>
                  <p className="text-[11px] text-slate-500">Auction Lot #{auction.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl px-2"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Current Highest Bid:</span>
                <span className="font-bold text-slate-900">₹{Number(currentHighest).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Minimum Bid Increment:</span>
                <span className="font-bold text-emerald-700">+ ₹{incrementStep.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-extrabold text-slate-900 text-sm">Your Proposed Bid:</span>
                <span className="font-black text-xl text-[#D48B1C] font-mono">
                  ₹{Number(bidAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-[11px] space-y-1">
              <span className="font-extrabold block uppercase tracking-wider text-[10px]">⚠️ Binding Bid Agreement</span>
              <p className="text-amber-800 leading-relaxed font-medium">
                Bids placed on SalvageReef are legally binding. By confirming, you agree to pay ₹{Number(bidAmount).toLocaleString('en-IN')} if your bid is selected by the admin desk.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalBidSubmit}
                className="w-2/3 py-3 bg-[#D48B1C] hover:bg-[#B87514] text-white font-black rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Gavel className="w-4 h-4" /> Confirm & Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
