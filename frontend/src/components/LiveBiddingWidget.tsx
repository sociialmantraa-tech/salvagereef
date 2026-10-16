import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { formatTimeOnly, parseIstDate } from '../utils/dateUtils';
import { getEcho } from '../services/echo';
import api from '../services/api';
import { Gavel, Clock, Trophy, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Lock, ShieldCheck, Scale, FileText, XCircle } from 'lucide-react';
import { Auction, Bid } from '../types';
import { formatBidderName } from '../utils/formatUtils';
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../services/realtimeSync';
import AuctionTermsModal from './AuctionTermsModal';
import WhatsAppIcon from './WhatsAppIcon';

interface LiveBiddingWidgetProps {
  auction: Auction;
  onBidSuccess?: (data?: any) => void;
}

export default function LiveBiddingWidget({ auction: initialAuction, onBidSuccess }: LiveBiddingWidgetProps) {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = Boolean(
    user && ['admin', 'master_admin', 'desk_admin', 'executive_admin', 'executive_desk_admin', 'read_only_admin'].includes(user.role)
  );
  const [auction, setAuction] = useState<Auction>(initialAuction);
  const [bids, setBids] = useState<Bid[]>((initialAuction.bids || []).filter((b: any) => b.status === 'approved'));
  const [userPendingBid, setUserPendingBid] = useState<any>(initialAuction?.user_pending_bid || null);
  const [currentHighest, setCurrentHighest] = useState<number>(
    initialAuction.current_highest_bid || initialAuction.starting_price
  );

  const incrementStep = auction?.bid_increment && Number(auction.bid_increment) > 0
    ? Number(auction.bid_increment)
    : (initialAuction?.bid_increment && Number(initialAuction.bid_increment) > 0 ? Number(initialAuction.bid_increment) : 1000);

  // Robust calculation: Highest bid must NEVER be lower than any APPROVED bid in the list or auction base
  const approvedBids = (bids && bids.length > 0)
    ? bids.filter((b: any) => b.status === 'approved')
    : [];

  const bidsMaxAmount = (approvedBids.length > 0)
    ? approvedBids.reduce((max, b) => Math.max(max, Number(b.amount) || 0), 0)
    : 0;

  const effectiveHighest = Math.max(
    Number(currentHighest) || 0,
    Number(auction?.current_highest_bid) || 0,
    Number(initialAuction?.current_highest_bid) || 0,
    Number(auction?.starting_price) || 0,
    Number(initialAuction?.starting_price) || 0,
    bidsMaxAmount
  );

  const minAllowedBid = effectiveHighest + incrementStep;

  // Sync internal state if effectiveHighest exceeds currentHighest
  useEffect(() => {
    if (effectiveHighest > currentHighest) {
      setCurrentHighest(effectiveHighest);
    }
  }, [effectiveHighest, currentHighest]);

  // Dynamic shortcut amount multipliers: 1x, 2x, 5x, 10x increment step
  const shortcutMultipliers = [1, 2, 5, 10];
  const isVerified = user?.is_verified === true || user?.is_verified === 1 || user?.is_verified === '1';

  const shortcutAmounts = shortcutMultipliers.map((m) => incrementStep * m);

  const handleShortcutClick = (shortcutValue: number) => {
    if (!isAuthenticated) {
      setError('Please sign in or register to place a bid.');
      return;
    }
    if (!isVerified) {
      setError('Account Verification Pending Admin Approval: Bidding authority is restricted until your KYC verification is approved by Admin.');
      return;
    }

    const currentVal = Number(bidAmount);
    const targetWithStepFromHighest = effectiveHighest + shortcutValue;

    if (!currentVal || isNaN(currentVal) || currentVal < minAllowedBid) {
      setBidAmount(targetWithStepFromHighest);
    } else if (currentVal === targetWithStepFromHighest) {
      // If clicking the same shortcut again, increment further by that step
      setBidAmount(currentVal + shortcutValue);
    } else if (currentVal === minAllowedBid && shortcutValue === incrementStep) {
      // Already at minAllowedBid (which is effectiveHighest + incrementStep), clicking +1x increments
      setBidAmount(currentVal + shortcutValue);
    } else {
      if (currentVal >= targetWithStepFromHighest) {
        setBidAmount(currentVal + shortcutValue);
      } else {
        setBidAmount(targetWithStepFromHighest);
      }
    }
    setError(null);
  };

  const [bidAmount, setBidAmount] = useState<string | number>(minAllowedBid);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [highlightPulse, setHighlightPulse] = useState<boolean>(false);

  // Pre-Bid Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Mandatory 1-Time Terms & Conditions Acceptance State
  const [termsAccepted, setTermsAccepted] = useState<boolean>(() => {
    try {
      const key = `sr_terms_accepted_auc_${initialAuction?.id}_user_${user?.id || 'guest'}`;
      return localStorage.getItem(key) === 'true' || localStorage.getItem('sr_terms_accepted_all_auctions') === 'true';
    } catch {
      return false;
    }
  });
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  const handleTermsAcceptance = () => {
    setTermsAccepted(true);
    setError(null);
    try {
      const key = `sr_terms_accepted_auc_${auction?.id}_user_${user?.id || 'guest'}`;
      localStorage.setItem(key, 'true');
      localStorage.setItem('sr_terms_accepted_all_auctions', 'true');
    } catch {}
  };

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isClosed: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isClosed: false,
  });

  useEffect(() => {
    setAuction(initialAuction);
    const incomingBids = (initialAuction.bids || []).filter((b: any) => b.status === 'approved');
    setBids(incomingBids);
    if (initialAuction.user_pending_bid !== undefined) {
      setUserPendingBid(initialAuction.user_pending_bid);
    }
    const maxIncomingBid = incomingBids.reduce((m, b) => Math.max(m, Number(b.amount) || 0), 0);
    const highest = Math.max(
      Number(initialAuction.current_highest_bid) || 0,
      Number(initialAuction.starting_price) || 0,
      maxIncomingBid
    );
    const step = initialAuction.bid_increment && Number(initialAuction.bid_increment) > 0 ? Number(initialAuction.bid_increment) : 1000;
    setCurrentHighest(highest);
    setBidAmount((prev) => {
      const pNum = Number(prev);
      return isNaN(pNum) || pNum <= highest ? highest + step : pNum;
    });
  }, [initialAuction]);

  useEffect(() => {
    if (!auction?.end_time) return;

    const calculateTime = () => {
      const end = parseIstDate(auction.end_time).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isClosed: true });
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
      if (event.type === 'bid_status_updated' && (String(event.payload?.auctionId) === String(auction.id) || String(event.payload?.auction_id) === String(auction.id))) {
        if (event.payload.status === 'approved' && Number(event.payload.amount) > 0) {
          const approvedAmount = Number(event.payload.amount);
          setCurrentHighest((prev) => Math.max(prev, approvedAmount));
          setBidAmount((prev) => {
            const pNum = Number(prev);
            return isNaN(pNum) || pNum <= approvedAmount ? approvedAmount + incrementStep : pNum;
          });
          setHighlightPulse(true);
          setBids((prev) => {
            const updated = [
              {
                id: event.payload.bidId || Date.now(),
                amount: approvedAmount,
                status: 'approved',
                user: { name: event.payload.bidder_name || 'Verified Bidder' },
                created_at: new Date().toISOString(),
              },
              ...prev.filter((b) => b.id !== event.payload.bidId),
            ];
            return updated.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
          });
          setUserPendingBid((prev: any) => {
            if (prev && (prev.id === event.payload.bidId || Number(prev.amount) === approvedAmount)) {
              return null;
            }
            return prev;
          });
          setTimeout(() => setHighlightPulse(false), 2000);
        } else if (event.payload.status === 'rejected') {
          setUserPendingBid((prev: any) => {
            if (prev && (prev.id === event.payload.bidId || Number(prev.amount) === Number(event.payload.amount))) {
              return null;
            }
            return prev;
          });
        }
      } else if (event.type === 'bid_submitted' && (String(event.payload?.auction_id) === String(auction.id) || String(event.payload?.auctionId) === String(auction.id))) {
        // STRICT RULE: Only update public live bid if bid is APPROVED!
        if (event.payload.status === 'approved') {
          const submittedAmount = Number(event.payload.amount);
          if (submittedAmount > 0) {
            setCurrentHighest((prev) => Math.max(prev, submittedAmount));
            setBidAmount((prev) => {
              const pNum = Number(prev);
              return isNaN(pNum) || pNum <= submittedAmount ? submittedAmount + incrementStep : pNum;
            });
            setHighlightPulse(true);
            setTimeout(() => setHighlightPulse(false), 2000);
          }
          setBids((prev) => {
            const updated = [
              {
                id: event.payload.id || Date.now(),
                amount: submittedAmount,
                status: 'approved',
                user: { name: event.payload.bidder_name || event.payload.bidder_company || 'Active Bidder' },
                created_at: event.payload.created_at || new Date().toISOString(),
              },
              ...prev.filter((b) => b.id !== event.payload.id),
            ];
            return updated.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
          });
        }
      } else if (event.type === 'auction_updated' && String(event.payload?.id) === String(auction.id)) {
        setAuction((prev) => ({ ...prev, ...event.payload }));
        if (event.payload.current_highest_bid) {
          const topBid = Number(event.payload.current_highest_bid);
          setCurrentHighest((prev) => Math.max(prev, topBid));
        }
      } else if (event.type === 'auction_winner_awarded' && String(event.payload?.auctionId) === String(auction.id)) {
        setAuction((prev) => ({ ...prev, winner_confirmed: true, awarded_winner_type: event.payload.winnerType }));
      }
    });

    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get(`/auctions/${auction.slug || auction.id}`);
        const fresh: Auction = res.data.auction;
        if (fresh) {
          const freshBids: Bid[] = (fresh.bids || []).filter((b: any) => b.status === 'approved');
          const freshMaxFromBids = freshBids.reduce((m, b) => Math.max(m, Number(b.amount) || 0), 0);
          const baseStartingPrice = Number(fresh.starting_price) || 0;
          const freshHighest = Math.max(Number(fresh.current_highest_bid) || 0, freshMaxFromBids, baseStartingPrice);

          if (freshHighest > 0 && freshHighest !== currentHighest) {
            setCurrentHighest(freshHighest);
            setHighlightPulse(true);
            setTimeout(() => setHighlightPulse(false), 1500);
          }
          setBids(freshBids.sort((a: any, b: any) => (Number(b.amount) || 0) - (Number(a.amount) || 0)));
          if (fresh.user_pending_bid !== undefined) {
            setUserPendingBid(fresh.user_pending_bid);
          }
          if (fresh.status !== auction.status || fresh.winner_confirmed !== auction.winner_confirmed) {
            setAuction((prev) => ({
              ...prev,
              status: fresh.status,
              winner_confirmed: fresh.winner_confirmed,
              awarded_winner_type: fresh.awarded_winner_type,
            }));
            if (fresh.status === 'closed') {
              setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isClosed: true });
            }
          }
        }
      } catch (e) {}
    }, 4000);

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

    if (!isVerified) {
      setError('Account Verification Pending Admin Approval: Bidding authority is restricted until your KYC verification is approved by Admin.');
      return;
    }

    const numAmount = parseFloat(String(bidAmount));
    if (isNaN(numAmount) || numAmount < minAllowedBid) {
      setError(`Bid amount must be at least ₹${minAllowedBid.toLocaleString('en-IN')} (Minimum increment step of ₹${incrementStep.toLocaleString('en-IN')}).`);
      return;
    }

    if (!termsAccepted) {
      setError('⚠️ Please review and tick the Terms & Conditions before placing your bid.');
      setShowTermsModal(true);
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
      const isPending = res.data?.status === 'pending' || res.data?.requires_admin_approval;

      const newBidObj = {
        id: res.data?.bid?.id || res.data?.bid_id || Date.now(),
        auction_id: auction.id,
        auction_title: auction.title,
        amount: numAmount,
        status: isPending ? 'pending' : 'approved',
        user_id: user?.id,
        bidder_name: user?.name || 'Registered Bidder',
        bidder_email: user?.email || 'bidder@salvagereef.com',
        bidder_company: user?.company_name || 'Metals & Scrap Trader',
        created_at: new Date().toISOString(),
      };

      if (isPending) {
        setUserPendingBid(newBidObj);
        setSuccessMsg(
          res.data?.message ||
            `⏳ Your initial bid of ₹${numAmount.toLocaleString('en-IN')} is submitted for Admin Acceptance. Once accepted, you can freely raise bids on this lot!`
        );
      } else {
        // ONLY update public highest bid if the bid is APPROVED!
        setCurrentHighest((prev) => Math.max(prev, numAmount));
        setBidAmount(numAmount + incrementStep);
        setAuction((prev) => ({
          ...prev,
          current_highest_bid: Math.max(Number(prev.current_highest_bid) || 0, numAmount),
        }));
        setSuccessMsg(res.data?.message || `✓ Bid of ₹${numAmount.toLocaleString('en-IN')} placed successfully!`);

        // Add to public approved bids list
        setBids((prev) => {
          const updated = [newBidObj as any, ...prev.filter((b) => b.id !== newBidObj.id)];
          return updated.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
        });

        if (res.data?.auction_closed || res.data?.is_closed) {
          setAuction((prev) => ({
            ...prev,
            status: 'closed',
            winner_confirmed: true,
            awarded_winner_type: 'H1',
            current_highest_bid: numAmount,
            end_time: res.data.new_end_time || new Date().toISOString(),
          }));
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isClosed: true });
          try {
            const currentStored = JSON.parse(localStorage.getItem('sr_auctions') || '[]');
            const updatedStored = currentStored.map((a: any) =>
              a.id === auction.id
                ? {
                    ...a,
                    status: 'closed',
                    winner_confirmed: true,
                    awarded_winner_type: 'H1',
                    current_highest_bid: numAmount,
                    end_time: res.data.new_end_time || new Date().toISOString(),
                  }
                : a
            );
            localStorage.setItem('sr_auctions', JSON.stringify(updatedStored));
            localStorage.setItem('sr_admin_auctions', JSON.stringify(updatedStored));
          } catch {}
          broadcastRealtimeEvent('auction_winner_awarded', { auctionId: auction.id, winnerType: 'H1' });
          broadcastRealtimeEvent('auction_updated', {
            id: auction.id,
            status: 'closed',
            winner_confirmed: true,
            awarded_winner_type: 'H1',
            current_highest_bid: numAmount,
          });
        } else if (res.data?.time_extended && res.data?.new_end_time) {
          setAuction((prev) => ({ ...prev, end_time: res.data.new_end_time, current_highest_bid: numAmount }));
          try {
            const currentStored = JSON.parse(localStorage.getItem('sr_auctions') || '[]');
            const updatedStored = currentStored.map((a: any) =>
              a.id === auction.id ? { ...a, end_time: res.data.new_end_time, current_highest_bid: numAmount } : a
            );
            localStorage.setItem('sr_auctions', JSON.stringify(updatedStored));
            localStorage.setItem('sr_admin_auctions', JSON.stringify(updatedStored));
          } catch {}
          broadcastRealtimeEvent('auction_updated', {
            id: auction.id,
            end_time: res.data.new_end_time,
            current_highest_bid: numAmount,
          });
          setSuccessMsg('⏱️ Anti-Sniping Protection: Bid placed in final minutes! Auction extended by +2:00 minutes.');
        } else {
          if (res.data?.new_end_time) {
            setAuction((prev) => ({ ...prev, end_time: res.data.new_end_time, current_highest_bid: numAmount }));
          }
          try {
            const currentStored = JSON.parse(localStorage.getItem('sr_auctions') || '[]');
            const updatedStored = currentStored.map((a: any) =>
              a.id === auction.id ? { ...a, current_highest_bid: Math.max(Number(a.current_highest_bid) || 0, numAmount) } : a
            );
            localStorage.setItem('sr_auctions', JSON.stringify(updatedStored));
            localStorage.setItem('sr_admin_auctions', JSON.stringify(updatedStored));
          } catch {}
          broadcastRealtimeEvent('auction_updated', {
            id: auction.id,
            current_highest_bid: numAmount,
          });
        }
      }

      // Save into sr_admin_bids so Admin console sees it immediately in moderation
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

  const isUserApprovedForLot = bids.some(
    (b: any) =>
      (b.user?.name === user?.name ||
        b.bidder_name === user?.name ||
        b.bidder_email === user?.email ||
        Number(b.user_id) === Number(user?.id)) &&
      b.status === 'approved'
  );

  const isUserPendingForLot = !isUserApprovedForLot && (!!userPendingBid || bids.some(
    (b: any) =>
      (b.user?.name === user?.name ||
        b.bidder_name === user?.name ||
        b.bidder_email === user?.email ||
        Number(b.user_id) === Number(user?.id)) &&
      b.status === 'pending'
  ));

  const isClosed = auction?.status === 'closed' || auction?.status === 'completed' || !!auction?.winner_confirmed || timeLeft.isClosed;
  const isUpcoming = auction?.status === 'upcoming';
  const isLive = auction?.status === 'live' && !isClosed;
  const isOwner = user?.id === auction?.created_by;

  // If auction is closed and viewer is not an admin, show ONLY the beautiful Thank You message with complete privacy
  if (isClosed && !isAdmin) {
    return (
      <div className="bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#0B192C] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-700/80 space-y-6 relative overflow-hidden">
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D48B1C]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Status Header */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            Auction Closed
          </span>
          <span className="text-slate-300 font-mono text-xs font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
            {auction?.lot_code || `LOT #${auction?.id}`}
          </span>
        </div>

        {/* Beautiful Icon & Warm Thanks Message */}
        <div className="text-center space-y-4 py-3 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-[#D48B1C] to-amber-300 text-slate-950 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 ring-4 ring-amber-400/20">
            <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Thank You for Your Participation!
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-md mx-auto">
              This auction lot has officially concluded. We sincerely thank all registered buyers and participants for their valuable bids and interest.
            </p>
            {isClosed && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs font-bold">
                  🏁 Auction Bidding Concluded & Lot Closed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Help & Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 relative z-10">
          <Link
            to="/auctions"
            className="flex-1 py-3.5 px-4 bg-[#D48B1C] hover:bg-[#B87514] text-white font-black rounded-xl text-xs text-center uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Gavel className="w-4 h-4" /> Explore Other Live Auctions
          </Link>
          <a
            href="https://wa.me/917304481166?text=Hello%20SalvageReef%2C%20I%20participated%20in%20Auction%20Lot%20and%20would%20like%20to%20inquire%20about%20the%20status."
            target="_blank"
            rel="noopener noreferrer"
            className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold rounded-xl text-xs text-center uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" /> Contact Desk
          </a>
        </div>
      </div>
    );
  }

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
            ₹{Number(effectiveHighest).toLocaleString('en-IN')}
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

        {/* Real-Time Total Bids & Activity Status */}
        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="flex h-2 w-2 relative">
              {!isClosed && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isClosed ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
            </span>
            <span className="font-semibold text-slate-300">Total Bids Placed:</span>
            <span className="font-bold text-amber-300 font-mono">
              {bids.length}
            </span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
            isClosed
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {isClosed ? 'Auction Concluded' : 'Open for Bidding'}
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
            <WhatsAppIcon className="w-4 h-4" /> Send WhatsApp Auction Completion Alert
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
        <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/80 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-md">
          <div className="w-11 h-11 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-5 h-5" />
          </div>

          <div className="space-y-2.5 text-left max-w-sm mx-auto">
            {/* Message 1: Bidding Access Restriction */}
            <div className="bg-white/90 border border-amber-200/80 rounded-2xl p-3.5 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider">
                <Gavel className="w-3.5 h-3.5 text-amber-600" /> Bidding Restricted to Verified Bidders
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Please sign in or complete the 3-stage business vendor registration to place bids.
              </p>
            </div>

            {/* Message 2: Top 3 Bidders Live Ranking Feed Restriction */}
            <div className="bg-white/90 border border-amber-200/80 rounded-2xl p-3.5 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-[#D48B1C]" /> Top 3 Bidders (H1 / H2 / H3)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Live H1, H2, H3 bidding ranks and activity are visible exclusively to logged-in members.
              </p>
            </div>
          </div>

          {/* Unified Action Buttons Shown Only ONCE */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              Sign In &rarr;
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
            >
              Register Account
            </Link>
          </div>
        </div>
      ) : user?.is_verified === -1 || user?.is_verified === '-1' ? (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 p-5 rounded-2xl text-center space-y-3 shadow-md">
          <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto shadow">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="bg-red-200 text-red-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-block mb-1 border border-red-300">
              Account Verification Rejected
            </span>
            <h4 className="font-extrabold text-slate-900 text-sm">Registration Declined by Admin</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Your registration application was reviewed and declined by the Admin Team. Please visit your Account Dashboard to update details and Register Again.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow"
            >
              Go to Dashboard & Register Again
            </Link>
          </div>
        </div>
      ) : !isVerified ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 p-5 rounded-2xl text-center space-y-3 shadow-md">
          <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="bg-amber-200 text-amber-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-block mb-1 border border-amber-300">
              Account Verification Pending Admin Approval
            </span>
            <h4 className="font-extrabold text-slate-900 text-sm">Bidding Disabled Until Admin Approves Account</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Your submitted company details and KYC documents (PAN, GST, Bank Cheque) are currently being reviewed by our Admin Team. Bidding authority will be unlocked as soon as your account is approved.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow"
            >
              View Account Status
            </Link>
            <a
              href="https://wa.me/917304481166?text=Hello%20SalvageReef%20Admin,%20please%20verify%20my%20KYC%20registration."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" /> Contact Admin Desk
            </a>
          </div>
        </div>
      ) : isOwner ? (
        <div className="bg-blue-50 border border-blue-200 py-3.5 px-3 sm:px-4 rounded-2xl text-center text-blue-900 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-blue-600 mx-auto mb-1.5 shrink-0" />
          <p className="text-[10.5px] sm:text-[11.5px] md:text-xs font-semibold text-blue-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            You are the creator of this auction lot. You cannot place bids on your own listing.
          </p>
        </div>
      ) : (
        <form onSubmit={handleOpenConfirmModal} className="space-y-4">
          <div className="border-b border-slate-200/80 pb-2 flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Gavel className="w-4 h-4 text-[#D48B1C]" />
              Place a Bid
            </h4>
            <span className="text-[11px] font-semibold text-slate-500 font-mono">
              Lot #{auction.id}
            </span>
          </div>

          {/* BIDDER LOT AUTHORIZATION BADGE */}
          {isUserApprovedForLot ? (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ Approved Bidder for this Lot — You can raise your bid directly!</span>
            </div>
          ) : isUserPendingForLot ? (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold shadow-sm">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="block">⏳ Initial Bid Pending Admin Acceptance</span>
                <p className="text-[11px] text-amber-700 font-normal mt-0.5">
                  Your initial bid is awaiting Admin Approval. Once accepted, you can freely increase your bids on this lot without waiting!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>First bid on this lot requires 1-time Admin approval. Subsequent bids are instant!</span>
            </div>
          )}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Bid Amount (multiples of ₹{incrementStep.toLocaleString('en-IN')})<span className="text-red-500 font-bold">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                Min: ₹{minAllowedBid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-base select-none">₹</span>
              <input
                type="number"
                step={incrementStep}
                min={minAllowedBid}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={submitting || isUserPendingForLot}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D48B1C] focus:bg-white text-lg font-mono shadow-inner transition-all disabled:opacity-60 disabled:bg-slate-100"
                placeholder={`e.g. ${minAllowedBid.toLocaleString('en-IN')}`}
                required
              />
            </div>

            {/* Quick Bid Increment Shortcut Buttons (Dynamically generated according to incrementStep: 1x, 2x, 5x, 10x) */}
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              {shortcutAmounts.map((stepVal, idx) => {
                const isActive = Number(bidAmount) === currentHighest + stepVal;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleShortcutClick(stepVal)}
                    disabled={submitting || isClosed || isUserPendingForLot}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-extrabold rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 ${
                      isActive
                        ? 'bg-amber-100 text-amber-950 border-[#D48B1C] ring-2 ring-[#D48B1C]/40 shadow-xs'
                        : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-300 hover:border-[#D48B1C]'
                    }`}
                    title={`Bid ₹${(currentHighest + stepVal).toLocaleString('en-IN')} (+₹${stepVal.toLocaleString('en-IN')} above current highest)`}
                  >
                    +₹{stepVal.toLocaleString('en-IN')}
                  </button>
                );
              })}

              {Number(bidAmount) > minAllowedBid && (
                <button
                  type="button"
                  onClick={() => setBidAmount(minAllowedBid)}
                  disabled={submitting || isUserPendingForLot}
                  className="text-[11px] text-slate-400 hover:text-red-500 font-semibold underline underline-offset-2 ml-auto cursor-pointer disabled:opacity-40"
                  title="Reset to minimum allowed bid"
                >
                  Reset to Min
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D48B1C]" />
              <span>Each bid must increase by at least ₹{incrementStep.toLocaleString('en-IN')}.</span>
            </p>
          </div>

          {/* MANDATORY 1-TIME TERMS & CONDITIONS CHECKBOX */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all ${
              termsAccepted
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 border-amber-400/90 shadow-sm ring-2 ring-amber-300/30'
            }`}
          >
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleTermsAcceptance();
                  } else {
                    setTermsAccepted(false);
                    try {
                      localStorage.removeItem(`sr_terms_accepted_auc_${auction?.id}_user_${user?.id || 'guest'}`);
                    } catch {}
                  }
                }}
                className="mt-0.5 w-4.5 h-4.5 rounded text-[#D48B1C] focus:ring-[#D48B1C] accent-[#D48B1C] cursor-pointer shrink-0"
              />
              <div className="text-xs text-slate-800 leading-snug">
                <span className="font-extrabold text-slate-900 block">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="text-[#D48B1C] font-black underline hover:text-[#B87514] inline-flex items-center gap-1"
                  >
                    Terms & Conditions – SalvageReef
                    <FileText className="w-3.5 h-3.5 inline text-[#D48B1C]" />
                  </button>{' '}
                  *
                </span>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Mandatory 1-time start agreement: Strictly “As Is Where Is” basis, EMD retention for H1/H2/H3, 3-day payment & 10-day lifting rule.
                </p>
              </div>
            </label>
            {termsAccepted && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold pl-7 mt-1.5 pt-1.5 border-t border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Terms & Conditions agreed for this auction session (1-Time Verified)</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || isUserPendingForLot}
            className={`w-full py-3.5 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider ${
              isUserPendingForLot
                ? 'bg-amber-100 text-amber-900 border-2 border-amber-300 cursor-not-allowed opacity-90'
                : 'bg-[#D48B1C] hover:bg-[#B87514] text-white hover:shadow-xl transform active:scale-98 disabled:opacity-50'
            }`}
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Processing Bid...
              </>
            ) : isUserPendingForLot ? (
              <>
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Initial Bid Awaiting Admin Acceptance...
              </>
            ) : (
              <>
                <Gavel className="w-4 h-4" /> Review & Place Bid
              </>
            )}
          </button>
        </form>
      )}

      {/* TOP 3 BIDDERS (H1, H2, H3) FEED - VISIBLE TO LOGGED IN USERS (MASKED) & ADMIN (FULL) */}
      {isAuthenticated && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#D48B1C]" /> Top 3 Bidders (H1 / H2 / H3)
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
              {isAdmin ? 'Admin View' : 'Live Feed'} • Total: {bids.length}
            </span>
          </h4>

          {bids.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No bids placed yet. Be the first bidder!
            </p>
          ) : (
            <div className="space-y-2">
              {bids.slice(0, 3).map((b, idx) => {
                let rankBadge = { label: 'H1 - Highest Bid', style: 'bg-amber-100 text-amber-900 border-amber-300' };
                if (idx === 1) rankBadge = { label: 'H2 - 2nd Highest', style: 'bg-slate-100 text-slate-700 border-slate-300' };
                if (idx === 2) rankBadge = { label: 'H3 - 3rd Highest', style: 'bg-[#D48B1C]/10 text-[#D48B1C] border-[#D48B1C]/30' };

                const rawName = b.user?.name || b.bidder_name || (b.id ? `Bidder #${b.id}` : 'Bidder');
                const displayName = formatBidderName(rawName, isAdmin);

                return (
                  <div
                    key={b.id || idx}
                    className={`flex justify-between items-center p-3 rounded-xl text-xs border transition-all ${
                      idx === 0
                        ? 'bg-amber-500/10 border-amber-500/40 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                        idx === 0
                          ? 'bg-amber-500 text-white'
                          : idx === 1
                          ? 'bg-slate-400 text-white'
                          : 'bg-amber-700 text-white'
                      }`}>
                        H{idx + 1}
                      </div>
                      <div>
                        {/* FIRST 2 LETTERS + *** + LAST 2 LETTERS FOR LOGGED-IN USERS, FULL NAME FOR ADMIN */}
                        <span className="font-bold text-slate-900 block font-mono">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {b.created_at ? formatTimeOnly(b.created_at) : 'Just now'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 text-sm font-mono block">
                        ₹{Number(b.amount).toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${rankBadge.style}`}>
                        {rankBadge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                <span className="font-bold text-slate-900">₹{Number(effectiveHighest).toLocaleString('en-IN')}</span>
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

            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Agreed to 20-Clause SalvageReef Terms & Conditions</span>
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

      {/* FULL 20-POINT TERMS & CONDITIONS MODAL */}
      <AuctionTermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAcceptance}
        isAccepted={termsAccepted}
        auctionTitle={auction.title}
        auctionLotCode={auction.lot_code || `LOT #${auction.id}`}
      />
    </div>
  );
}
