import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Phone, Mail, User, ShieldCheck, ChevronRight, FileText, Download, ExternalLink } from 'lucide-react';
import { Classified } from '../types';
import { INITIAL_CLASSIFIEDS } from '../services/mockService';
import { isPdfDocument } from '../utils/imageCompressor';
import { useAuthStore } from '../store/useAuthStore';
import AuthRequiredModal from '../components/AuthRequiredModal';

import SEOHead from '../components/SEOHead';

export default function ClassifiedDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalType, setAuthModalType] = useState<'pdf' | 'images' | 'document'>('pdf');

  const initialMatch = INITIAL_CLASSIFIEDS.find((c) => c.slug === slug || c.id.toString() === slug) || INITIAL_CLASSIFIEDS[0];
  const [classified, setClassified] = useState<Classified | null>(initialMatch);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!classified) {
        setLoading(true);
      }
      try {
        const res = await api.get(`/classifieds/${slug}`);
        if (res.data) {
          setClassified(res.data);
        }
      } catch (err) {
        console.error('Error fetching classified:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#D48B1C] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!classified) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Classified Item Not Found</h2>
        <Link to="/classifieds" className="inline-block px-4 py-2 bg-[#D48B1C] text-white font-bold rounded-xl text-xs">
          Return to Classifieds
        </Link>
      </div>
    );
  }

  const images = classified.images && classified.images.length > 0
    ? classified.images.map((img: any) => typeof img === 'string' ? img : img.image_path)
    : classified.primary_image?.image_path
    ? [classified.primary_image.image_path]
    : [classified.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'];

  const [activeImage, setActiveImage] = useState(0);
  const currentImg = images[activeImage] || images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEOHead
        title={`${classified.title} (₹${Number(classified.price).toLocaleString('en-IN')})`}
        description={`Direct scrap classified listing #${classified.id}: ${classified.title} located in ${classified.location_city}, ${classified.location_state}. Price: ₹${Number(classified.price).toLocaleString('en-IN')}.`}
        keywords={`${classified.title}, ${classified.location_city} scrap sale, ${classified.category?.name || 'classified'}, buy industrial scrap`}
        ogImage={currentImg}
        ogType="product"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: classified.title,
          description: classified.description,
          image: currentImg,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: classified.price,
            availability: 'https://schema.org/InStock'
          }
        }}
      />
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-[#D48B1C]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/classifieds" className="hover:text-[#D48B1C]">Classifieds</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{classified.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Images & Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {isPdfDocument(currentImg) ? (
                <div className="w-full h-full bg-[#0B192C] flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-xl border border-red-400">
                    <FileText className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <span className="bg-red-600 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-wider inline-block">
                      PDF Document Attached
                    </span>
                    <h3 className="text-white font-extrabold text-base pt-1">
                      {classified.title} - Asset Technical Specifications
                    </h3>
                    <p className="text-slate-400 text-xs max-w-sm">
                      Inspect or download the official verification document for this listing.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        if (!isAuthenticated || !user) {
                          setAuthModalType('document');
                          setShowAuthModal(true);
                          return;
                        }
                        window.open(currentImg, '_blank');
                      }}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Full PDF Document
                    </button>
                    {isAuthenticated && user && (
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = currentImg;
                          link.download = `Classified-${classified.id}-Document.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <img 
                  src={currentImg} 
                  alt={classified.title} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover" 
                />
              )}
            </div>

            {/* Multi-Image Thumbnail Selector */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === idx ? 'border-purple-600 scale-105 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {isPdfDocument(img) ? (
                      <div className="w-full h-full bg-red-950 text-red-400 flex flex-col items-center justify-center p-1">
                        <FileText className="w-4 h-4" />
                        <span className="text-[9px] font-bold mt-0.5">PDF</span>
                      </div>
                    ) : (
                      <img 
                        src={img} 
                        alt={`Thumb ${idx + 1}`} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <span className="text-xs font-bold text-[#D48B1C] uppercase tracking-wider block">
              {classified.category?.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{classified.title}</h1>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Asking Price</span>
                <span className="text-2xl font-black text-slate-900">₹{Number(classified.price).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Quantity</span>
                <span className="text-base font-bold text-slate-900">{classified.quantity} {classified.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="text-base font-bold text-slate-900">{classified.location_city}, {classified.location_state}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Item Details</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {classified.description}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Seller Box */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-full bg-[#0B192C] text-[#D48B1C] flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{classified.creator?.name || 'Verified Seller'}</h3>
              <p className="text-xs text-slate-500">{classified.creator?.company_name || 'Scrap Seller'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`tel:${classified.creator?.phone || '7304481166'}`}
              className="w-full py-3 bg-[#D48B1C] hover:bg-[#B87514] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
            >
              <Phone className="w-4 h-4" /> Call Seller ({classified.creator?.phone || '7304481166'})
            </a>
            <a
              href={`mailto:${classified.creator?.email || 'salvagereef@gmail.com'}`}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700"
            >
              <Mail className="w-4 h-4 text-[#D48B1C]" /> Email Direct Inquiry
            </a>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>SalvageReef Verified Listing - Buyer protection guaranteed</span>
          </div>
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
