import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Phone, Mail, User, ShieldCheck, ChevronRight } from 'lucide-react';
import { Classified } from '../types';

export default function ClassifiedDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [classified, setClassified] = useState<Classified | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/classifieds/${slug}`);
        setClassified(res.data);
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

  const primaryImg = classified.primary_image?.image_path || classified.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
            <div className="h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900">
              <img src={primaryImg} alt={classified.title} className="w-full h-full object-cover" />
            </div>
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
    </div>
  );
}
