import React from 'react';
import Logo from './Logo';

interface PageLoadingProps {
  message?: string;
}

export default function PageLoading({ message = 'Loading SalvageReef Operations Desk...' }: PageLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0B192C] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="relative w-20 h-20 flex items-center justify-center mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-[#D48B1C] animate-spin" />
        <Logo className="w-10 h-10" showText={false} />
      </div>

      <div className="text-xl font-extrabold text-white uppercase tracking-wider mb-1">
        Salvage<span className="text-[#D48B1C]">Reef</span>
      </div>

      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#D48B1C] animate-ping" />
        {message}
      </p>
    </div>
  );
}
