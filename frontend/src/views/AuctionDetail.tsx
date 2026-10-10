import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LiveBiddingWidget from '../components/LiveBiddingWidget';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Building, Layers, ShieldCheck, CheckCircle2, Send, ChevronRight, FileText, Download, ExternalLink, ClipboardCheck, Sparkles, Scale, Image as ImageIcon, Loader2, Share2 } from 'lucide-react';
import { Auction } from '../types';
import { INITIAL_AUCTIONS } from '../services/mockService';
import { isPdfDocument } from '../utils/imageCompressor';
import { downloadAuctionPdf } from '../utils/pdfGenerator';
import { downloadAllAuctionImages, downloadSingleImage } from '../utils/imageDownloader';

import SEOHead from '../components/SEOHead';
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../services/realtimeSync';
import AuthRequiredModal from '../components/AuthRequiredModal';

export default function AuctionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuthStore();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<number>(0);

  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [downloadingImages, setDownloadingImages] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  // Auth Gate Modal State
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalType, setAuthModalType] = useState<'pdf' | 'images' | 'document' | 'general'>('pdf');

  const [interestMsg, setInterestMsg] = useState<string>('');
  const [submittingInterest, setSubmittingInterest] = useState<boolean>(false);
  const [interestSubmitted, setInterestSubmitted] = useState<boolean>(false);

  const fetchAuctionDetail = async () => {
    try {
      const cleanParam = slug ? encodeURIComponent(slug) : '';
      const res = await api.get(`/auctions/${cleanParam}`);
      
      let fetchedAuction: Auction | null = null;
      if (res.data?.auction && !Array.isArray(res.data.auction)) {
        fetchedAuction = res.data.auction;
      } else if (res.data?.data && !Array.isArray(res.data.data)) {
        fetchedAuction = res.data.data;
      } else if (res.data && !Array.isArray(res.data) && (res.data as any).id) {
        fetchedAuction = res.data;
      } else if (Array.isArray(res.data?.data) || Array.isArray(res.data)) {
        const list: Auction[] = Array.isArray(res.data?.data) ? res.data.data : res.data;
        if (slug) {
          const raw = decodeURIComponent(slug).toLowerCase().trim();
          const norm = raw.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          fetchedAuction = list.find((a: any) => 
            String(a.id) === raw ||
            (a.slug && a.slug.toLowerCase() === raw) ||
            (a.slug && a.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') === norm) ||
            (a.lot_code && a.lot_code.toLowerCase() === raw) ||
            (a.title && a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(norm))
          ) || null;
        }
      }

      if (fetchedAuction) {
        setAuction(fetchedAuction);
        setIsUnlocked(res.data?.is_unlocked ?? true);
      }
    } catch (err) {
      console.error('Error loading auction detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionDetail();

    const unsubscribe = subscribeRealtimeEvents((event) => {
      if (event.type === 'auction_deleted' && (String(event.payload?.id) === String(slug) || (auction && String(event.payload?.id) === String(auction.id)))) {
        setAuction(null);
      } else if (event.type === 'auction_updated' && auction && String(event.payload?.id) === String(auction.id)) {
        setAuction((prev) => prev ? { ...prev, ...event.payload } : prev);
      } else if (event.type === 'auction_winner_awarded' && auction && String(event.payload?.auctionId) === String(auction.id)) {
        setAuction((prev) => prev ? { ...prev, winner_confirmed: true, awarded_winner_type: event.payload.winnerType } : prev);
      }
    });

    return () => unsubscribe();
  }, [slug, auction?.id]);

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !auction) return;

    setSubmittingInterest(true);
    try {
      const res = await api.post(`/auctions/${auction.id}/interest`, { message: interestMsg });
      
      const newInterestItem = res.data?.interest || {
        id: Date.now(),
        auction_id: auction.id,
        auction_title: auction.title,
        user_id: user?.id,
        user_name: user?.name || 'Interested Buyer',
        user_email: user?.email || '',
        company_name: user?.company_name || 'Buyer Enterprise',
        phone: user?.phone || '',
        message: interestMsg || 'Requesting tender access permission',
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      try {
        const currentInterests = JSON.parse(localStorage.getItem('sr_admin_interests') || '[]');
        const updated = [newInterestItem, ...currentInterests.filter((i: any) => String(i.id) !== String(newInterestItem.id))];
        localStorage.setItem('sr_admin_interests', JSON.stringify(updated));
        localStorage.setItem('sr_interests', JSON.stringify(updated));
      } catch {}

      broadcastRealtimeEvent('tender_request_submitted', newInterestItem);
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

  // Official Tender / Specification PDF Documents (Multiple supported)
  const attachedPdfUrls: string[] = (() => {
    const list: string[] = [];
    const add = (url?: string | null) => {
      if (!url) return;
      const clean = String(url).trim();
      if (clean && !list.includes(clean)) list.push(clean);
    };

    if (auction.pdf_urls && Array.isArray(auction.pdf_urls)) {
      auction.pdf_urls.forEach(add);
    }
    if (auction.pdf_url) {
      try {
        const parsed = JSON.parse(auction.pdf_url);
        if (Array.isArray(parsed)) parsed.forEach(add);
        else add(auction.pdf_url);
      } catch {
        add(auction.pdf_url);
      }
    }
    add(auction.pdf_document);
    add((auction as any).attachment_url);
    if (auction.images && Array.isArray(auction.images)) {
      auction.images.forEach((img) => {
        const path = typeof img === 'string' ? img : img.image_path;
        if (path && isPdfDocument(path)) add(path);
      });
    }
    if ((auction as any).image_url && isPdfDocument((auction as any).image_url)) {
      add((auction as any).image_url);
    }
    return list;
  })();

  const attachedPdfUrl = attachedPdfUrls[0] || null;
  const hasPdf = attachedPdfUrls.length > 0;

  // Gallery Photos (JPG, WebP, PNG only - PDF documents excluded from photo slider)
  const rawImagePaths = auction.images && auction.images.length > 0
    ? auction.images.map((img) => img.image_path)
    : [(auction as any).image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'];

  const nonPdfImages = rawImagePaths.filter((path) => path && !isPdfDocument(path));
  const images = nonPdfImages.length > 0
    ? nonPdfImages
    : ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'];

  const isVerified = isAuthenticated && user && (user.is_verified === true || user.is_verified === 1 || user.is_verified === '1');

  const handleDownloadPdf = async (specificUrl?: string, docIndex?: number) => {
    if (!auction) return;
    if (!isVerified) {
      setAuthModalType('pdf');
      setShowAuthModal(true);
      return;
    }
    setGeneratingPdf(true);
    setPdfSuccess(false);
    try {
      const lotCode = (auction as any).lot_code || `LOT-${auction.id}`;
      const targetUrl = specificUrl || attachedPdfUrl;
      if (targetUrl) {
        const suffix = typeof docIndex === 'number' ? `_doc_${docIndex + 1}` : '_tender_document';
        await downloadSingleImage(targetUrl, `${lotCode}${suffix}.pdf`);
      } else {
        await downloadAuctionPdf(auction);
      }
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Unable to download PDF document at this moment. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadImages = async () => {
    if (!auction || !images.length) return;
    if (!isVerified) {
      setAuthModalType('images');
      setShowAuthModal(true);
      return;
    }
    setDownloadingImages(true);
    try {
      const lotCode = (auction as any).lot_code || `LOT-${auction.id}`;
      await downloadAllAuctionImages(images, lotCode);
    } catch (err) {
      console.error('Failed to download images:', err);
    } finally {
      setDownloadingImages(false);
    }
  };

  const handleOpenAttachedPdf = (e: React.MouseEvent) => {
    if (!isVerified) {
      e.preventDefault();
      setAuthModalType('document');
      setShowAuthModal(true);
      return;
    }
    if (attachedPdfUrl) {
      window.open(attachedPdfUrl, '_blank');
    }
  };

  const handleDownloadSinglePhoto = (imgUrl: string, idx: number) => {
    if (!isVerified) {
      setAuthModalType('images');
      setShowAuthModal(true);
      return;
    }
    const lotCode = (auction as any).lot_code || `LOT-${auction?.id || 'SCRAP'}`;
    downloadSingleImage(imgUrl, `${lotCode}_photo_${idx + 1}.jpg`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
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

      {/* Top Breadcrumb & Document Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <nav className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link to="/" className="hover:text-[#D48B1C]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/auctions" className="hover:text-[#D48B1C]">Auctions</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{auction.title}</span>
        </nav>

        {/* Global Download Actions - Only shown when user is verified */}
        {isVerified && (
          <div className="flex items-center gap-2 flex-wrap">
            {hasPdf && (
              <button
                onClick={handleDownloadPdf}
                disabled={generatingPdf}
                className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                title="Download official uploaded tender PDF document"
              >
                {generatingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : pdfSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>{generatingPdf ? 'Downloading PDF...' : pdfSuccess ? 'PDF Downloaded!' : 'Download Tender PDF'}</span>
              </button>
            )}

            <button
              onClick={handleDownloadImages}
              disabled={downloadingImages}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 shadow-xs transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Download all high-resolution images for this auction lot"
            >
              {downloadingImages ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 text-[#D48B1C]" />
              )}
              <span>{downloadingImages ? 'Downloading...' : `Download Images (${images.length})`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
            {/* Main Featured Photo Viewer - Always JPG/WebP */}
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center group">
              <img
                src={images[activeImage]}
                alt={auction.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover transition-transform duration-300"
              />
              {/* Floating Action Controls on Image - Only when user is verified */}
              {isVerified && (
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownloadSinglePhoto(images[activeImage], activeImage)}
                    className="p-2 bg-black/70 hover:bg-black text-white rounded-xl backdrop-blur-md text-xs font-bold flex items-center gap-1 shadow-lg transition-all"
                    title="Download this photo"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save Photo</span>
                  </button>
                  {hasPdf && (
                    <button
                      onClick={handleDownloadPdf}
                      disabled={generatingPdf}
                      className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-xl backdrop-blur-md text-xs font-bold flex items-center gap-1 shadow-lg transition-all"
                      title="Download Official Uploaded Tender PDF"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tender PDF</span>
                    </button>
                  )}
                </div>
              )}
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

            {/* Thumbnail Row */}
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
                    <img 
                      src={img} 
                      alt="" 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dedicated Official Tender PDF Document Box (Shown ONLY when PDF is uploaded) */}
          {hasPdf && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-3xl border border-emerald-900/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
                      Official Tender PDF{attachedPdfUrls.length > 1 ? `s (${attachedPdfUrls.length})` : ''}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">Tender Document & Material Specifications</span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-white mt-1">
                    Official Inspection Report, Lot Sheet & Terms Document
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {attachedPdfUrls.length > 0 && (
                  <button
                    onClick={handleOpenAttachedPdf}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View {attachedPdfUrls.length > 1 ? `(${attachedPdfUrls.length})` : 'PDF'}
                  </button>
                )}
                {isVerified && (
                  <button
                    onClick={handleDownloadPdf}
                    disabled={generatingPdf}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    {generatingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>Download Dossier</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              {(() => {
                let displayCode = (auction as any).lot_code || `LOT-#${auction.id}`;
                let displayTitle = auction.title;
                if (auction.title && auction.title.includes('|')) {
                  const parts = auction.title.split('|');
                  if (parts[0] && parts[0].trim().length <= 25) {
                    displayCode = (auction as any).lot_code || parts[0].trim();
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Total Quantity</span>
                <span className="font-bold text-slate-900 text-sm">{auction.quantity} {auction.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Starting Price</span>
                <span className="font-bold text-slate-900 text-sm">₹{Number(auction.starting_price).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">EMD Deposit</span>
                <span className="font-bold text-amber-700 text-sm">
                  {auction.emd_amount && Number(auction.emd_amount) > 0
                    ? `₹${Number(auction.emd_amount).toLocaleString('en-IN')}`
                    : '₹50,000'}
                </span>
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

            {/* Condition Showcase Box */}
            <div className="bg-gradient-to-br from-emerald-50/80 via-slate-50 to-amber-50/50 border-2 border-emerald-300/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <ClipboardCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                      Lot Material Condition
                    </h3>
                    <p className="text-[10px] text-emerald-800 font-bold">Physical State & Quality Grading</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Condition Verified
                </span>
              </div>

              <div className="bg-white/95 border border-emerald-200 rounded-xl p-3.5 text-slate-800 text-xs sm:text-sm leading-relaxed font-semibold shadow-2xs">
                {auction.condition || 'As is where is basis - Grade A commercial scrap quality, verified and ready for immediate loading.'}
              </div>


              <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Scale className="w-3.5 h-3.5 text-[#D48B1C]" />
                  Governed by SalvageReef 20-Point Auction Terms
                </span>
                <Link
                  to="/terms"
                  className="text-[#D48B1C] font-extrabold hover:underline flex items-center gap-1"
                >
                  Read Policy <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* OFFICIAL LOT DOCUMENTS & MEDIA CENTER - Only shown when user is verified */}
            {isVerified && (
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#0B192C] text-white rounded-2xl p-5 space-y-4 border border-slate-700 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
                        Official Lot Documents & Media
                      </h3>
                      <p className="text-[11px] text-slate-300 font-medium">Download Specifications, Official Tender PDFs & Photos</p>
                    </div>
                  </div>
                  {attachedPdfUrls.length > 0 && (
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {attachedPdfUrls.length} Attached PDF{attachedPdfUrls.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* If multiple PDFs attached, list each distinct PDF document for 1-click download */}
                {attachedPdfUrls.length > 1 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      📄 Attached Tender & Inspection PDF Documents ({attachedPdfUrls.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {attachedPdfUrls.map((pdfPath, pIdx) => {
                        const rawName = pdfPath.split('/').pop() || `document_${pIdx + 1}.pdf`;
                        const displayName = rawName.length > 32 ? rawName.slice(0, 30) + '...' : rawName;
                        return (
                          <div
                            key={pIdx}
                            className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 transition-all shadow-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/40">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold text-white block truncate" title={rawName}>
                                  Document #{pIdx + 1}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {displayName}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(pdfPath, pIdx)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 active:scale-95 shadow-xs"
                            >
                              <Download className="w-3 h-3" /> Download
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Action 1: Download Complete PDF Dossier */}
                  <button
                    onClick={() => handleDownloadPdf()}
                    disabled={generatingPdf}
                    className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-between group active:scale-95 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      {generatingPdf ? (
                        <Loader2 className="w-5 h-5 animate-spin shrink-0 text-white" />
                      ) : pdfSuccess ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-emerald-200 shrink-0 group-hover:scale-110 transition-transform" />
                      )}
                      <div>
                        <span className="block text-white font-bold leading-tight">
                          {generatingPdf ? 'Generating PDF...' : pdfSuccess ? 'PDF Downloaded!' : (attachedPdfUrls.length === 1 ? 'Download Tender PDF Document' : 'Download Lot PDF Dossier')}
                        </span>
                        <span className="text-[10px] text-emerald-200 font-normal">Full Specs, Pricing & Photos</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-white/80 shrink-0 ml-2" />
                  </button>

                  {/* Action 2: Download All High-Res Images */}
                  <button
                    onClick={handleDownloadImages}
                    disabled={downloadingImages}
                    className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-bold text-xs border border-slate-600 shadow transition-all flex items-center justify-between group active:scale-95 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      {downloadingImages ? (
                        <Loader2 className="w-5 h-5 animate-spin shrink-0 text-amber-400" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[#D48B1C] shrink-0 group-hover:scale-110 transition-transform" />
                      )}
                      <div>
                        <span className="block text-slate-100 font-bold leading-tight">
                          {downloadingImages ? 'Downloading Photos...' : `Download All Photos (${images.length})`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Original Resolution JPEGs</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-300 shrink-0 ml-2" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-700/60">
                  📄 The official tender document and generated PDF contains complete commercial terms, reserve pricing, EMD requirements, physical yard location, and verified visual inspection photographs.
                </p>
              </div>
            )}

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
                      placeholder="Enter reason or message..."
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

      {/* Auth Gate Modal for Unauthenticated Guests */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type={authModalType}
      />
    </div>
  );
}
