import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Info, Gavel, ShieldCheck, Copyright } from 'lucide-react';

export default function LegalSubNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/about', label: 'About Us', icon: Info },
    { path: '/terms', label: 'Terms & Conditions', icon: Gavel },
    { path: '/privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
    { path: '/copyright-policy', label: 'Copyright Policy', icon: Copyright },
  ];

  return (
    <div className="bg-[#0B192C] py-3.5 px-4 shadow-inner border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/terms' && currentPath === '/terms-and-conditions');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs transition-all shadow-sm font-black ${
                isActive
                  ? 'bg-[#D48B1C] text-white shadow-lg ring-2 ring-amber-400 scale-105'
                  : 'bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-slate-500'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#D48B1C]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
