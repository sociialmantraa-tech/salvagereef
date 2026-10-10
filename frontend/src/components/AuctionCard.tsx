import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Auction } from '../types';
import { Calendar, Clock, FileText } from 'lucide-react';
import { isPdfDocument } from '../utils/imageCompressor';
import { useAuthStore } from '../store/useAuthStore';
import { formatDateTime, parseIstDate } from '../utils/dateUtils';
import AuthRequiredModal from './AuthRequiredModal';

interface AuctionCardProps {
  auction: Auction;
}

const FALLBACK_AUCTION_IMG = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';

export default function AuctionCard({ auction }: AuctionCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const isPrivate = auction.auction_type === 'private';
  const isGroup = auction.auction_type === 'group';

  // Resolve valid non-PDF image for the front thumbnail (JPG, WebP, PNG)
  const resolveFrontImage = () => {
    if (auction.primary_image?.image_path && !isPdfDocument(auction.primary_image.image_path)) {
      return auction.primary_image.image_path;
    }
    if (auction.images && auction.images.length > 0) {
      const nonPdf = auction.images.find((img) => img.image_path && !isPdfDocument(img.image_path));
      if (nonPdf?.image_path) return nonPdf.image_path;
    }
    if ((auction as any).image_url && !isPdfDocument((auction as any).image_url)) {
      return (auction as any).image_url;
    }
    return FALLBACK_AUCTION_IMG;
  };

  const [imgSrc, setImgSrc] = useState<string>(resolveFrontImage());

  useEffect(() => {
    setImgSrc(resolveFrontImage());
  }, [auction]);

  // Check if official PDF Tender / Document is uploaded
  const attachedPdfUrl =
    auction.pdf_url ||
    auction.pdf_document ||
    (auction as any).attachment_url ||
    auction.images?.find((img) => isPdfDocument(img.image_path))?.image_path ||
    (isPdfDocument((auction as any).image_url) ? (auction as any).image_url : null);

  const hasPdf = Boolean(attachedPdfUrl);

  // Timer values for "3D 1H 12M 44S" cyan blocks
  const [days, setDays] = useState<string>('3D');
  const [hours, setHours] = useState<string>('1H');
  const [mins, setMins] = useState<string>('12M');
  const [secs, setSecs] = useState<string>('44S');

  useEffect(() => {
    if (!auction?.end_time) return;

    const updateTimer = () => {
      const target = parseIstDate(auction.end_time).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setDays('0D');
        setHours('0H');
        setMins('0M');
        setSecs('0S');
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setDays(`${d}D`);
      setHours(`${h}H`);
      setMins(`${m}M`);
      setSecs(`${s}S`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction?.end_time]);

  // Extract or format Lot Code & Main Title
  let displayCode = (auction as any).lot_code || (isGroup ? `GR-${auction.id}` : isPrivate ? `PR-${auction.id}` : `PL-${auction.id}`);
  let displayTitle = auction.title;

  if (auction.title && auction.title.includes('|')) {
    const parts = auction.title.split('|');
    if (parts[0] && parts[0].trim().length <= 25) {
      displayCode = (auction as any).lot_code || parts[0].trim();
      displayTitle = parts.slice(1).join('|').trim();
    }
  }

  // Safe normalized URL slug for links
  const targetSlug = (
    auction.slug
      ? String(auction.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : (auction.title ? String(auction.title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : String(auction.id))
  ) || String(auction.id);

  return (
    <div className="bg-[#f0f7ff]/90 rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
      {/* Top Section: Thumbnail Image + Right Specs Table + Badge */}
      <div className="flex gap-4 items-start">
        {/* Left Thumbnail Image - Always high-fidelity JPG/WebP photo */}
        <div className="w-36 sm:w-40 h-28 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm flex items-center justify-center">
          <img
            src={imgSrc}
            alt={displayTitle}
            onError={() => setImgSrc(FALLBACK_AUCTION_IMG)}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Right Specs Table & Badge */}
        <div className="flex-1 space-y-1.5 text-xs text-slate-700 font-medium">
          {/* Auction Type Badge on top right */}
          <div className="flex justify-end mb-1">
            <span className={`px-3 py-1 rounded-md text-xs font-bold text-white uppercase ${
              isPrivate ? 'bg-[#0077B6]' : isGroup ? 'bg-slate-500' : 'bg-emerald-600'
            }`}>
              {isGroup ? 'Group Auction' : isPrivate ? 'Private Auction' : 'Public Auction'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#D48B1C] shrink-0" /> Start Time
            </span>
            <span className="font-bold text-slate-900">{formatDateTime(auction.start_time)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> End Time
            </span>
            <span className="font-bold text-slate-900">{formatDateTime(auction.end_time)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-semibold">
              {isGroup ? 'No Of Auctions' : 'Quantity'}
            </span>
            <span className="font-bold text-slate-900">
              {isGroup ? auction.quantity || 3 : `${auction.quantity || 40600} ${auction.unit || 'Kg'}`}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-semibold">EMD Deposit</span>
            <span className="font-bold text-amber-700">
              {auction.emd_amount && Number(auction.emd_amount) > 0
                ? `₹${Number(auction.emd_amount).toLocaleString('en-IN')}`
                : '₹50,000'}
            </span>
          </div>
        </div>
      </div>

      {/* Title & Lot Code Section - Lot Code smaller with distinct color */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="bg-[#0077B6]/15 text-[#0077B6] border border-[#0077B6]/30 font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs shrink-0">
            {displayCode}
          </span>
          <span className="text-slate-300 font-normal text-xs">|</span>
        </div>
        <Link
          to={`/auctions/${targetSlug}`}
          className="font-extrabold text-slate-900 hover:text-[#0096C7] text-xs sm:text-sm leading-snug line-clamp-1 block transition-colors tracking-tight"
          title={displayTitle}
        >
          {displayTitle}
        </Link>
        {auction.condition && (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold bg-emerald-50/90 border border-emerald-200/90 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">{auction.condition}</span>
          </div>
        )}
      </div>

      {/* Card Footer: Starts In : 3D 1H 12M 44S Cyan Blocks + Action Buttons */}
      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
        {/* Countdown Timer with Cyan Square Blocks */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 flex-wrap sm:flex-nowrap">
          <span className="shrink-0">Starts In :</span>
          <div className="flex items-center gap-1 font-mono font-black text-xs">
            <span className="bg-[#0096C7] text-white px-2 py-0.5 rounded">{days}</span>
            <span className="bg-[#0096C7] text-white px-2 py-0.5 rounded">{hours}</span>
            <span className="bg-[#0096C7] text-white px-2 py-0.5 rounded">{mins}</span>
            <span className="bg-[#0096C7] text-white px-2 py-0.5 rounded">{secs}</span>
          </div>
        </div>

        {/* Buttons: View, PDF Dossier & Show Interest */}
        <div className="flex flex-col items-stretch gap-1.5 shrink-0 min-w-[95px]">
          <div className="flex items-center gap-1">
            <Link
              to={`/auctions/${targetSlug}`}
              className="flex-1 bg-[#0096C7] hover:bg-[#0077B6] text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center"
            >
              View
            </Link>
            {hasPdf && (
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const isVerified = isAuthenticated && user && (user.is_verified === true || user.is_verified === 1 || user.is_verified === '1');
                  if (!isVerified) {
                    setShowAuthModal(true);
                    return;
                  }
                  try {
                    const safeCode = displayCode || `LOT-${auction.id}`;
                    if (attachedPdfUrl) {
                      const { downloadSingleImage } = await import('../utils/imageDownloader');
                      await downloadSingleImage(attachedPdfUrl, `${safeCode}_tender_document.pdf`);
                    } else {
                      const { downloadAuctionPdf } = await import('../utils/pdfGenerator');
                      await downloadAuctionPdf(auction);
                    }
                  } catch (err) {
                    console.error('Failed to download PDF:', err);
                  }
                }}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center justify-center"
                title="Download Official Uploaded Tender PDF"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isPrivate && (
            <Link
              to={`/auctions/${targetSlug}`}
              className="bg-[#52B788] hover:bg-[#40916C] text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center whitespace-nowrap"
            >
              Show Interest
            </Link>
          )}
        </div>
      </div>

      {/* Auth Gate Modal for Unauthenticated Guests */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="pdf"
      />
    </div>
  );
}
