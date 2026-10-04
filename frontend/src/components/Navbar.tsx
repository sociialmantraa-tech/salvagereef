import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useContentStore } from '../store/useContentStore';
import { LogOut, LayoutDashboard, Menu, X, PlusCircle, AlertCircle } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { content } = useContentStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* TOP ANNOUNCEMENT / OFFER BANNER (ABOVE HEADER) */}
      {content.offerBannerEnabled && content.offerBannerText && (
        <div
          style={{
            backgroundColor: content.offerBannerBgColor || '#0B192C',
            color: content.offerBannerTextColor || '#ffffff',
          }}
          className="py-2 px-4 text-xs font-bold border-b border-amber-500/30 transition-all shadow-inner"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center sm:text-left flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 mx-auto sm:mx-0 flex-wrap justify-center">
              {content.offerBannerBadgeText && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#D48B1C] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  {content.offerBannerBadgeText}
                </span>
              )}
              <span className="leading-snug">{content.offerBannerText}</span>
            </div>
            {content.offerBannerLinkText && (
              <Link
                to={content.offerBannerLinkUrl || '/auctions'}
                className="text-[#D48B1C] hover:text-amber-300 font-extrabold underline underline-offset-2 text-[11px] shrink-0 mx-auto sm:mx-0 transition-colors"
              >
                {content.offerBannerLinkText}
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand on Left */}
          <Link to="/" className="flex items-center group">
            <Logo className="w-10 h-10" showText={true} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 lg:gap-7 xl:gap-8 text-sm font-bold text-slate-700 whitespace-nowrap shrink-0">
            <Link
              to="/"
              className={`whitespace-nowrap shrink-0 transition-colors ${
                isActive('/') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navHomeText || 'Home'}
            </Link>
            <Link
              to="/auctions"
              className={`whitespace-nowrap shrink-0 transition-colors ${
                isActive('/auctions') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navAuctionsText || 'Auction'}
            </Link>
            <Link
              to="/classifieds"
              className={`whitespace-nowrap shrink-0 transition-colors ${
                isActive('/classifieds') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navClassifiedsText || 'Classifieds'}
            </Link>
            <Link
              to="/about"
              className={`whitespace-nowrap shrink-0 transition-colors ${
                isActive('/about') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navAboutText || 'About Us'}
            </Link>
            <Link
              to="/contact"
              className={`whitespace-nowrap shrink-0 transition-colors ${
                isActive('/contact') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navContactText || 'Contact Us'}
            </Link>

            {/* Sell Your Scrap Button - Open for Everyone */}
            <Link
              to="/sell-scrap"
              className="flex items-center gap-1.5 text-xs font-extrabold text-[#D48B1C] bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-xl hover:bg-[#D48B1C] hover:text-white transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">
                {content.navPostListingButton && !content.navPostListingButton.includes('Post Listing')
                  ? content.navPostListingButton.replace(/^\+\s*/, '')
                  : 'Sell Your Scrap'}
              </span>
            </Link>
          </nav>

          {/* Right Controls: Login / Register / Logout */}
          <div className="hidden xl:flex items-center gap-4 lg:gap-6 text-sm font-bold shrink-0 whitespace-nowrap">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 shrink-0 whitespace-nowrap">
                {(() => {
                  const isAdmin =
                    user?.role === 'admin' ||
                    user?.role === 'master_admin' ||
                    user?.role === 'desk_admin' ||
                    user?.role === 'read_only_admin' ||
                    user?.email === 'admin@salvagereef.com' ||
                    user?.email === 'executive@salvagereef.com';
                  return (
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      className="flex items-center gap-1.5 text-slate-800 hover:text-[#1D70B8] transition-colors whitespace-nowrap shrink-0"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#1D70B8]" />
                      {isAdmin ? 'Admin Desk' : 'Dashboard'}
                    </Link>
                  );
                })()}
                
                {/* Logout Button with Confirmation Dialog */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1 shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 font-extrabold text-xs shrink-0 whitespace-nowrap">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:border-[#1D70B8] text-slate-800 hover:text-[#1D70B8] transition-all flex items-center gap-1.5 shadow-sm bg-slate-50/50 whitespace-nowrap shrink-0"
                >
                  {content.navSignInText || 'Sign In'}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-xl bg-[#D48B1C] hover:bg-[#b87614] text-white transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg uppercase tracking-wider text-[11px] whitespace-nowrap shrink-0"
                >
                  {content.navRegisterText && content.navRegisterText.trim() !== 'Register Free'
                    ? content.navRegisterText
                    : 'Register'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Drawer Toggle */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 hover:text-slate-900 p-2"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 text-sm font-bold shadow-lg animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 py-2 border-b border-slate-100"
          >
            {content.navHomeText || 'Home'}
          </Link>
          <Link
            to="/auctions"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 py-2 border-b border-slate-100"
          >
            {content.navAuctionsText || 'Auction'}
          </Link>
          <Link
            to="/classifieds"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 py-2 border-b border-slate-100"
          >
            {content.navClassifiedsText || 'Classifieds'}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 py-2 border-b border-slate-100"
          >
            {content.navAboutText || 'About Us'}
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 py-2 border-b border-slate-100 text-[#1D70B8]"
          >
            {content.navContactText || 'Contact Us'}
          </Link>

          {/* Mobile "Sell Your Scrap" Button */}
          <Link
            to="/sell-scrap"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-1.5 text-amber-700 py-2 border-b border-slate-100 font-bold"
          >
            <PlusCircle className="w-4 h-4 text-[#D48B1C]" />
            <span>
              {content.navPostListingButton && !content.navPostListingButton.includes('Post Listing')
                ? content.navPostListingButton.replace(/^\+\s*/, '')
                : 'Sell Your Scrap'}
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              {(() => {
                const isAdmin =
                  user?.role === 'admin' ||
                  user?.role === 'master_admin' ||
                  user?.role === 'desk_admin' ||
                  user?.role === 'read_only_admin' ||
                  user?.email === 'admin@salvagereef.com' ||
                  user?.email === 'executive@salvagereef.com';
                return (
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-800 py-2 border-b border-slate-100 font-bold"
                  >
                    {isAdmin ? 'Admin Desk' : 'Dashboard'} ({user?.name})
                  </Link>
                );
              })()}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="block text-red-600 py-2 w-full text-left font-bold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex gap-4 text-slate-700">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#1D70B8] font-bold"
              >
                {content.navSignInText || 'Login'}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#1D70B8] font-bold"
              >
                {content.navRegisterText && content.navRegisterText.trim() !== 'Register Free'
                  ? content.navRegisterText
                  : 'Register'}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Sign Out Confirmation</h3>
              <p className="text-xs text-slate-500 font-medium">Are you sure you want to sign out of your SalvageReef account?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md transition-colors uppercase tracking-wider"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
