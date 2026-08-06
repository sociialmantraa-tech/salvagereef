import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({
  className = "w-11 h-11",
  size,
  showText = true,
  variant = 'dark',
}: LogoProps) {
  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-3 shrink-0 select-none">
      {/* Clean White Circular Badge Container behind logo emblem for 100% visibility */}
      <div className={`rounded-full bg-white flex items-center justify-center p-1.5 shadow-md shrink-0 border border-slate-200/80 ${className}`} style={size ? { width: size, height: size } : undefined}>
        <img
          src="./logo.png"
          alt="SalvageReef SR Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight shrink-0 justify-center">
          <span className={`text-xl font-black tracking-tight ${isLight ? 'text-white' : 'text-[#0B192C]'}`}>
            Salvage<span className="text-[#D48B1C]">Reef</span>
          </span>
          <span className={`text-[9px] tracking-widest font-bold uppercase ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>
            AUCTIONS & CLASSIFIEDS
          </span>
        </div>
      )}
    </div>
  );
}
