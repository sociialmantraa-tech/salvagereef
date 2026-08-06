import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Classified } from '../types';
import { MapPin, Phone } from 'lucide-react';

interface ClassifiedCardProps {
  classified: Classified;
}

const FALLBACK_CLASSIFIED_IMG = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80';

export default function ClassifiedCard({ classified }: ClassifiedCardProps) {
  const primaryImg =
    classified.primary_image?.image_path ||
    classified.images?.[0]?.image_path ||
    FALLBACK_CLASSIFIED_IMG;

  const [imgSrc, setImgSrc] = useState<string>(primaryImg);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
      {/* Image Banner */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={classified.title}
          onError={() => setImgSrc(FALLBACK_CLASSIFIED_IMG)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-2.5 left-2.5">
          <span className="bg-[#D48B1C] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
            CLASSIFIED
          </span>
        </div>

        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-900/75 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-lg">
          <MapPin className="w-3 h-3 text-[#D48B1C]" />
          <span>{classified.location_city}, {classified.location_state}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#D48B1C] uppercase tracking-wider block">
            {classified.category?.name || 'INDUSTRIAL ASSET'}
          </span>

          <Link
            to={`/classifieds/${classified.slug}`}
            className="font-extrabold text-slate-900 hover:text-[#0096C7] text-sm leading-snug line-clamp-2 block transition-colors"
          >
            {classified.title}
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {classified.description || 'Verified industrial machinery available for direct purchase.'}
          </p>
        </div>

        {/* Price & Contact Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Asking Price</span>
            <span className="text-base font-black text-slate-900">
              ₹{Number(classified.price).toLocaleString('en-IN')}
              <span className="text-xs text-slate-500 font-normal"> / {classified.unit || 'nos'}</span>
            </span>
          </div>

          <Link
            to={`/classifieds/${classified.slug}`}
            className="bg-[#0B192C] hover:bg-[#D48B1C] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition-colors flex items-center gap-1"
          >
            <Phone className="w-3 h-3" /> Details
          </Link>
        </div>
      </div>
    </div>
  );
}
