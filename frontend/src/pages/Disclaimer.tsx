import React from 'react';
import LegalHeaderNav from '../components/LegalHeaderNav';
import { ShieldAlert, FileText } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import SEOHead from '../components/SEOHead';

const EXACT_DISCLAIMER_TEXT = `All the contents of this website are provided by Salvagereef for general information and informational purposes only. They do not constitute professional, financial, legal, commercial, or any other form of advice and should not be relied upon in making, or refraining from making, any decision.

Salvagereef makes reasonable efforts to ensure that the information provided on this website is accurate and up to date; however, Salvagereef makes no representation or warranty, express or implied, regarding the quality, accuracy, timeliness, correctness, completeness, reliability, performance, availability, or fitness for a particular purpose of the website or any of its contents, including but not limited to any information, prices, tools, listings, data, or other materials made available through the website.

Salvagereef shall not be liable for any direct, indirect, incidental, consequential, special, or other damages, including without limitation loss of business, loss of profits, loss of opportunities, loss of data, or any other losses or damages arising out of, or in connection with, the use of or inability to use this website or any of its contents, or from any action taken or refrained from being taken based on the information contained on the website.

Salvagereef does not warrant that the website or its contents will always be available, uninterrupted, secure, error-free, or free from viruses or other harmful, contaminating, or destructive components.

Users are advised to independently verify all information and, where appropriate, obtain professional advice before relying on any information available through this website.

By accessing and using this website, you acknowledge and agree to the terms of this Disclaimer.`;

export default function Disclaimer() {
  const { content } = useContentStore();

  const title = content.disclaimerTitle || 'Disclaimer';
  const rawText = (content.disclaimerText && content.disclaimerText.trim() !== '' && content.disclaimerText !== 'demo')
    ? content.disclaimerText
    : EXACT_DISCLAIMER_TEXT;

  const paragraphs = rawText.split('\n\n').filter(p => p.trim() !== '');

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 font-sans">
      <SEOHead
        title={`${title} — SalvageReef`}
        description="Official legal disclaimer for SalvageReef website content, general informational purposes, and liability limitations."
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
            General information and legal disclosures for visitors, bidders, buyers, and sellers on SalvageReef.
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
              <span className="text-xs text-slate-400 font-medium">SalvageReef Operations & Legal Disclosures</span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
