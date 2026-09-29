import React, { useState } from 'react';
import LegalHeaderNav from '../components/LegalHeaderNav';
import { 
  Search, 
  AlertTriangle, 
  FileText, 
  Gavel, 
  Printer, 
  ChevronRight,
  Info,
  HelpCircle,
  Scale,
  CheckCircle2
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { SALVAGREEF_TERMS_SECTIONS } from '../components/AuctionTermsModal';

export default function TermsAndConditions() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = searchQuery.trim()
    ? SALVAGREEF_TERMS_SECTIONS.filter(
        (sec) =>
          sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (sec.clauses && sec.clauses.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))) ||
          (sec.bullets && sec.bullets.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : SALVAGREEF_TERMS_SECTIONS;

  const scrollToClause = (number: string) => {
    const element = document.getElementById(`clause-${number}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      <SEOHead
        title="Terms & Conditions — SalvageReef B2B Marketplace Rules"
        description="Official terms of use, bidding rules, EMD deposits, and corporate auction buyer agreements for SalvageReef."
        keywords="salvage auction terms, scrap bidding rules, EMD deposit policy, tender terms India"
      />
      <LegalHeaderNav />

      {/* Top Banner Header */}
      <section className="bg-[#0B192C] text-white py-12 px-4 border-b-4 border-[#D48B1C]">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D48B1C]/20 border border-[#D48B1C]/40 text-[#D48B1C] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Gavel className="w-4 h-4" /> Official Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Terms & Conditions – <span className="text-[#D48B1C]">SalvageReef</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
            These Terms & Conditions govern the use of the SalvageReef website and its online auction marketplace.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        {/* Intro Alert Box */}
        <div className="bg-amber-500/10 border border-[#D48B1C]/40 rounded-2xl p-5 mb-8 flex items-start gap-4 text-slate-800 text-xs sm:text-sm shadow-xs">
          <Info className="w-6 h-6 text-[#D48B1C] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900">Important Notice for All Platform Users:</p>
            <p className="text-slate-700 leading-relaxed">
              These Terms & Conditions govern the use of the SalvageReef website and its online auction marketplace. By registering, listing materials, participating in auctions, placing bids, or purchasing materials through the website, all users, including Sellers, Buyers, Bidders, and Visitors, agree to comply with these Terms & Conditions.
            </p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search clauses (e.g. As Is, EMD, Payment, Mumbai)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D70B8] font-medium"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-300"
          >
            <Printer className="w-4 h-4" /> Print Document
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Quick Navigation Index */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-36 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1D70B8]" /> Clauses Index ({SALVAGREEF_TERMS_SECTIONS.length})
              </h3>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 text-xs">
                {SALVAGREEF_TERMS_SECTIONS.map((sec) => (
                  <button
                    key={sec.number}
                    onClick={() => scrollToClause(sec.number)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#1D70B8] transition-colors flex items-center justify-between font-medium"
                  >
                    <span className="truncate">{sec.number}. {sec.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Clauses Content */}
          <div className="lg:col-span-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3 text-slate-500">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-semibold text-sm">No clauses matching your search query "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#1D70B8] font-bold underline"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <div
                  key={sec.number}
                  id={`clause-${sec.number}`}
                  className={`bg-white rounded-2xl p-6 border shadow-sm transition-all ${
                    sec.highlight
                      ? 'border-[#D48B1C] ring-2 ring-[#D48B1C]/20 bg-amber-50/15'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-[#D48B1C] flex items-center justify-center font-black text-xs shrink-0">
                      {sec.number}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {sec.title}
                    </h3>
                  </div>

                  {sec.intro && (
                    <p className="mb-3 font-semibold text-slate-800 text-xs sm:text-sm">
                      {sec.intro}
                    </p>
                  )}

                  {sec.bullets && (
                    <ul className="space-y-1.5 my-3 pl-2">
                      {sec.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm font-bold text-slate-900">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D48B1C] mt-2 shrink-0"></span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.clauses && (
                    <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {sec.clauses.map((c, i) => (
                        <p
                          key={i}
                          className={
                            c.startsWith('Note:')
                              ? 'font-bold text-amber-900 mt-3 bg-amber-100/70 p-3 rounded-xl border border-amber-200'
                              : ''
                          }
                        >
                          {c}
                        </p>
                      ))}
                    </div>
                  )}

                  {sec.footer && (
                    <p className="mt-3 text-xs sm:text-sm font-bold text-slate-800 pt-3 border-t border-amber-200/60">
                      {sec.footer}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
