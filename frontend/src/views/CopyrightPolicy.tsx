import React from 'react';
import LegalHeaderNav from '../components/LegalHeaderNav';
import { 
  Copyright, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldCheck, 
  FileCheck, 
  FileText, 
  Award,
  AlertTriangle
} from 'lucide-react';

export default function CopyrightPolicy() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      <LegalHeaderNav />

      {/* Top Hero Banner */}
      <section className="bg-[#0B192C] text-white py-12 px-4 border-b-4 border-[#D48B1C]">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D48B1C]/20 border border-[#D48B1C]/40 text-[#D48B1C] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Copyright className="w-4 h-4" /> Intellectual Property & Copyright
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Copyright Policy – <span className="text-[#D48B1C]">SalvageReef</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
            Guidelines and terms regarding reproduction, intellectual property rights, and brand assets of SalvageReef.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 space-y-8">
        {/* Core Permission Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Free Non-Commercial Reproduction</h2>
              <p className="text-slate-500 text-xs">Guidelines for sharing website materials</p>
            </div>
          </div>

          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
            Unless otherwise stated, the content available on the SalvageReef website, including text, graphics, logos, images, documents, and other materials, may be reproduced free of charge for personal, informational, or non-commercial purposes.
          </p>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs text-slate-700">
            <p className="font-bold text-slate-900 uppercase tracking-wide">Reproduction Requirements:</p>
            <ul className="space-y-1.5 list-disc pl-4">
              <li>Any reproduced material must be accurate and must not be used in a misleading, defamatory, or derogatory manner.</li>
              <li>Wherever the content is reproduced or shared, <strong>SalvageReef must be clearly acknowledged as the source</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Third Party & Trademarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Third Party Material */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D48B1C] flex items-center justify-center font-bold">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Third-Party Copyright</h3>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              This permission does not extend to any material on this website that is identified as the copyright of a third party.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Permission to reproduce such material must be obtained directly from the respective copyright owner.
            </p>
          </div>

          {/* Trademarks & Logos */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D70B8] flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Trademarks & Brand IP</h3>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              All trademarks, logos, brand names, and other intellectual property displayed on this website remain the property of their respective owners.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Unauthorized use of SalvageReef brand marks or logos without prior written consent is strictly prohibited.
            </p>
          </div>
        </div>

        {/* Legal Enforcement & Rights Reservation */}
        <div className="bg-amber-500/10 border border-[#D48B1C]/50 rounded-3xl p-6 sm:p-8 space-y-3 text-slate-900">
          <div className="flex items-center gap-2 text-[#D48B1C] font-black uppercase text-xs tracking-wider">
            <AlertTriangle className="w-5 h-5" /> Reservation of Rights & Legal Enforcement
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            SalvageReef reserves all rights not expressly granted in this Copyright Policy.
          </p>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
            Unauthorized use, modification, distribution, or commercial exploitation of the website content without prior written permission may result in legal action under applicable copyright and intellectual property laws.
          </p>
        </div>
      </div>
    </div>
  );
}
