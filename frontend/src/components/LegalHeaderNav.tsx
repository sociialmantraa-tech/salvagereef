import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Info, Scale, ShieldCheck, Copyright } from 'lucide-react';

export default function LegalHeaderNav() {
  const location = useLocation();

  const links = [
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'Terms & Conditions', path: '/terms', icon: Scale },
    { name: 'Privacy Policy', path: '/privacy-policy', icon: ShieldCheck },
    { name: 'Copyright Policy', path: '/copyright-policy', icon: Copyright },
  ];

  return (
    <div className="bg-[#0B192C] border-b-2 border-[#D48B1C] py-3.5 sticky top-16 z-40 shadow-xl">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-3 flex-wrap text-xs font-bold">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path === '/terms' && location.pathname === '/terms-and-conditions');

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all whitespace-nowrap shadow-sm ${
                isActive
                  ? 'bg-[#D48B1C] text-white font-black shadow-lg ring-2 ring-amber-400 scale-105'
                  : 'bg-slate-800 text-white font-bold border border-slate-700 hover:bg-slate-700 hover:text-amber-300 hover:border-amber-400'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#D48B1C]'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
