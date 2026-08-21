import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Leaf, Handshake, Globe } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import Logo from './Logo';

export default function Footer() {
  const { content } = useContentStore();

  return (
    <footer className="bg-[#0B192C] text-slate-300 border-t-4 border-[#D48B1C]">
      {/* Brand Value Pillars Ribbon */}
      <div className="bg-[#0D1B2A] py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 text-left">
          <div className="flex items-center gap-3 bg-slate-900/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D48B1C]/20 text-[#D48B1C] flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wide">{content.footerBadge1Title || 'Sustainable Practices'}</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug">{content.footerBadge1Desc || 'Responsible recycling & recovery'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D48B1C]/20 text-[#D48B1C] flex items-center justify-center shrink-0">
              <Handshake className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wide">{content.footerBadge2Title || 'Trusted Service'}</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug">{content.footerBadge2Desc || 'Verified buyers & transparent tender bidding'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D48B1C]/20 text-[#D48B1C] flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wide">{content.footerBadge3Title || 'Better Planet Better Future'}</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug">{content.footerBadge3Desc || 'Building a cleaner tomorrow'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand Logo & Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12" variant="light" showText={true} isFooter={true} />
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            {content.footerDescription || 'SalvageReef is a premier salvage auction and scrap marketplace platform connecting verified scrap metal buyers, industrial sellers, and fleet disposers across India.'}
          </p>

          <div className="pt-1">
            <span className="inline-block text-[#D48B1C] text-[10px] font-bold uppercase tracking-widest bg-[#D48B1C]/10 border border-[#D48B1C]/30 px-3 py-1 rounded-lg">
              {content.homeFooterCallout || 'RECOVER. REUSE. RECYCLE.'}
            </span>
          </div>
        </div>

        {/* Col 2: Business Card Contact Info */}
        <div>
          <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#D48B1C]/40 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D48B1C]" /> Contact Details
          </h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#D48B1C] shrink-0 mt-0.5" />
              <a href={`tel:${content.contactPhone}`} className="hover:text-[#D48B1C] transition-colors font-semibold">
                {content.contactPhone || '+91 7304481166'}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#D48B1C] shrink-0 mt-0.5" />
              <a href={`mailto:${content.contactEmail}`} className="hover:text-[#D48B1C] transition-colors">
                {content.contactEmail || 'salvagereef@gmail.com'}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#D48B1C] shrink-0 mt-0.5" />
              <span>{content.contactAddress || 'Mumbai, Maharashtra 401101'}</span>
            </li>
          </ul>
        </div>

        {/* Col 3 & 4: Side-by-side on mobile view */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 sm:gap-8">
          {/* Auction Platform Links */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#D48B1C]/40 pb-2">
              Auction Platform
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/auctions?auction_type=public" className="hover:text-[#D48B1C] transition-colors">Public Scrap Auctions</Link></li>
              <li><Link to="/auctions?auction_type=private" className="hover:text-[#D48B1C] transition-colors">Private Tenders & Lots</Link></li>
              <li><Link to="/auctions?auction_type=group" className="hover:text-[#D48B1C] transition-colors">Group Mill Auctions</Link></li>
              <li><Link to="/classifieds" className="hover:text-[#D48B1C] transition-colors">Scrap Machinery Classifieds</Link></li>
              <li><Link to="/register" className="hover:text-[#D48B1C] transition-colors">Register as Buyer</Link></li>
            </ul>
          </div>

          {/* Company & Legal Policies */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#D48B1C]/40 pb-2">
              Company & Policies
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" className="hover:text-[#D48B1C] transition-colors font-medium">About Us</Link></li>
              <li><Link to="/terms" className="hover:text-[#D48B1C] transition-colors font-medium">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#D48B1C] transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-[#D48B1C] transition-colors font-medium">Legal Disclaimer</Link></li>
              <li><Link to="/copyright-policy" className="hover:text-[#D48B1C] transition-colors font-medium">Copyright Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-[#081220] py-4 border-t border-slate-800 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>{content.footerCopyrightText || '© 2026 SalvageReef Auctions & Classifieds. All rights reserved.'}</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/terms" className="hover:text-[#D48B1C]">Terms</Link>
            <span>&bull;</span>
            <Link to="/privacy-policy" className="hover:text-[#D48B1C]">Privacy</Link>
            <span>&bull;</span>
            <Link to="/disclaimer" className="hover:text-[#D48B1C]">Disclaimer</Link>
            <span>&bull;</span>
            <Link to="/copyright-policy" className="hover:text-[#D48B1C]">Copyright</Link>
          </div>
          <span className="text-[#D48B1C] font-bold">BUILDING A CLEANER TOMORROW</span>
        </div>
      </div>
    </footer>
  );
}
