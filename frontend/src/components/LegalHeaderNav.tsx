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
    <div className="bg-slate-900 border-b border-slate-800 py-3 sticky top-16 z-40 shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-center sm:justify-start gap-2 overflow-x-auto no-scrollbar text-xs font-semibold">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#D48B1C] text-white font-bold shadow-lg shadow-[#D48B1C]/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
