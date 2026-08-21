import React from 'react';
import LegalHeaderNav from '../components/LegalHeaderNav';
import { ShieldAlert, FileText, CheckCircle2, Building, Info } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import SEOHead from '../components/SEOHead';

export default function Disclaimer() {
  const { content } = useContentStore();

  const title = content.disclaimerTitle || 'Legal Disclaimer';
  const rawText = content.disclaimerText || '';

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 font-sans">
      <SEOHead
        title={`${title} — SalvageReef`}
        description="Official legal disclaimer for SalvageReef auction lots, tender bidding, asset valuations, and platform terms."
      />
      <LegalHeaderNav />

      {/* Top Hero Banner */}
      <section className="bg-[#0B192C] text-white py-12 px-4 border-b-4 border-[#D48B1C]">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D48B1C]/20 border border-[#D48B1C]/40 text-[#D48B1C] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Official Notice
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {title}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
            Important legal terms, asset inspection disclosures, and liability limitations for SalvageReef tender auctions.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 text-slate-900">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#D48B1C] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">{title}</h2>
              <span className="text-xs text-slate-400 font-medium">SalvageReef Operations & Tender Desk</span>
            </div>
          </div>

          {rawText.trim() === '' ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center space-y-3 text-slate-500">
              <Info className="w-8 h-8 text-[#D48B1C] mx-auto" />
              <h4 className="font-extrabold text-slate-800 text-sm">Disclaimer Content Available Soon</h4>
              <p className="text-xs max-w-md mx-auto leading-relaxed">
                The detailed disclaimer text will be published here. Admins can edit and update this disclaimer content at any time via the Admin Panel.
              </p>
            </div>
          ) : (
            <div className="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {rawText}
            </div>
          )}

          {/* STANDARD PLATFORM NOTICE */}
          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-2">
            <span className="font-extrabold block uppercase tracking-wider text-[10px] text-amber-800">
              ⚠️ General Notice on Salvage Assets
            </span>
            <p className="leading-relaxed">
              All salvage materials, distressed goods, machinery, and scrap lots auctioned on SalvageReef are sold on an <strong>"As-Is, Where-Is"</strong> basis without any representation or warranty, express or implied. Bidders are advised to perform physical inspection in Mumbai prior to bidding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
