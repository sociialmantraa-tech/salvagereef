'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { initGlobalErrorLogging } from '../services/errorService';

export default function NextAppShell() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initGlobalErrorLogging();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B192C] flex flex-col items-center justify-center font-sans text-white">
        <div className="relative w-20 h-20 flex items-center justify-center mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-[#D48B1C] animate-spin" />
          <svg className="w-10 h-10 text-[#D48B1C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14.5 12.5-8 8a2.12 2.12 0 0 1-3-3l8-8"/>
            <path d="m16 16 6-6"/>
            <path d="m8 8 6-6"/>
            <path d="m9 7 8 8"/>
            <path d="m21 11-8-8"/>
          </svg>
        </div>
        <div className="text-2xl font-black tracking-wider uppercase text-white">
          Salvage<span className="text-[#D48B1C]">Reef</span>
        </div>
        <div className="text-xs font-bold text-slate-400 mt-2 tracking-widest uppercase">
          Initializing Next.js B2B Auctions & Scrap Desk...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
