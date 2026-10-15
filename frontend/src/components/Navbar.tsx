import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useContentStore } from '../store/useContentStore';
import { LogOut, LayoutDashboard, Menu, X, PlusCircle, AlertCircle, Home, Gavel, Tag, Info, Phone } from 'lucide-react';
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
      {/* TOP SEO KEYWORD & INDUSTRY STRIP */}
      <div className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[11px] py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
            <span className="font-black text-[#D48B1C] uppercase tracking-wider text-[10px] bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
              India B2B Portal
            </span>
            <div className="flex items-center gap-2.5 text-slate-300 font-medium whitespace-nowrap text-[11px]">
              <Link to="/auctions?search=Salvage+Auction" className="hover:text-amber-400 transition-colors font-semibold">
                Salvage Auctions India
              </Link>
              <span className="text-slate-600">&bull;</span>
              <Link to="/auctions?search=HMS+Scrap" className="hover:text-amber-400 transition-colors font-semibold">
                HMS Steel Scrap
              </Link>
              <span className="text-slate-600">&bull;</span>
              <Link to="/auctions?search=Accident+Vehicles" className="hover:text-amber-400 transition-colors font-semibold">
                Accident Fleet Salvage
              </Link>
              <span className="text-slate-600">&bull;</span>
              <Link to="/auctions?search=Plant+Machinery" className="hover:text-amber-400 transition-colors font-semibold">
                Plant Machinery Liquidation
              </Link>
              <span className="text-slate-600">&bull;</span>
              <Link to="/auctions?search=Copper+Scrap" className="hover:text-amber-400 transition-colors font-semibold">
                Copper & Metal Scrap
              </Link>
              <span className="text-slate-600">&bull;</span>
              <Link to="/auctions" className="hover:text-amber-400 transition-colors font-semibold">
                E-Tender Auctions
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-slate-400 font-medium text-[11px]">
            <span className="hidden lg:inline text-slate-400">Desk: <strong className="text-slate-200">+91 7304481166</strong></span>
            <span className="hidden lg:inline text-slate-700">|</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Verified B2B Network
            </span>
          </div>
        </div>
      </div>

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

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand on Left */}
          <Link to="/" className="flex items-center group shrink-0 min-w-0">
            <Logo className="w-8 h-8 sm:w-10 sm:h-10" showText={true} />
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

          {/* Mobile & Tablet Navbar Action Buttons & Drawer Toggle */}
          <div className="xl:hidden flex items-center gap-1.5 xs:gap-2 shrink-0">
            {/* Quick "+ Sell" Button in Mobile Navbar */}
            <Link
              to="/sell-scrap"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-xs transition-all shrink-0 whitespace-nowrap uppercase tracking-wider"
              title="Sell Your Scrap"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-black">Sell</span>
            </Link>

            {/* Quick Auth / Dashboard Button in Mobile Navbar */}
            {isAuthenticated ? (
              (() => {
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
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs shrink-0 whitespace-nowrap transition-colors border border-slate-200"
                    title={isAdmin ? 'Admin Desk' : 'Dashboard'}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#1D70B8] shrink-0" />
                    <span className="hidden xs:inline text-[11px] font-bold">{isAdmin ? 'Admin' : 'Desk'}</span>
                  </Link>
                );
              })()
            ) : (
              <Link
                to="/login"
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-[#1D70B8] text-slate-700 hover:text-[#1D70B8] font-bold text-[11px] shrink-0 whitespace-nowrap transition-colors bg-slate-50/50"
              >
                {content.navSignInText || 'Sign In'}
              </Link>
            )}

            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              aria-label="Toggle Navigation Sidebar"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Slide-over Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 xl:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile & Tablet Slide-over Sidebar (Takes Half Screen Width and Half Screen Height in Vertical Form) */}
      <aside
        className={`fixed top-0 right-0 w-1/2 h-1/2 landscape:h-full z-50 bg-white shadow-2xl xl:hidden flex flex-col justify-between overflow-y-auto overflow-x-hidden border-l border-b border-slate-200 rounded-bl-2xl transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-label="Mobile Navigation Sidebar"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Logo className="w-7 h-7 shrink-0" showText={false} />
            <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight truncate">
              Menu
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
            aria-label="Close Navigation Sidebar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </button>
        </div>

        {/* Nav Links Body */}
        <div className="p-3 space-y-1 overflow-y-auto overflow-x-hidden flex-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              isActive('/') ? 'bg-blue-50 text-[#1D70B8]' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate">{content.navHomeText || 'Home'}</span>
          </Link>
          <Link
            to="/auctions"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              isActive('/auctions') ? 'bg-blue-50 text-[#1D70B8]' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Gavel className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate">{content.navAuctionsText || 'Auction'}</span>
          </Link>
          <Link
            to="/classifieds"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              isActive('/classifieds') ? 'bg-blue-50 text-[#1D70B8]' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate">{content.navClassifiedsText || 'Classifieds'}</span>
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              isActive('/about') ? 'bg-blue-50 text-[#1D70B8]' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Info className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate">{content.navAboutText || 'About Us'}</span>
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              isActive('/contact') ? 'bg-blue-50 text-[#1D70B8]' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Phone className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate">{content.navContactText || 'Contact Us'}</span>
          </Link>

          {/* Mobile "Sell Your Scrap" Action Button */}
          <Link
            to="/sell-scrap"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-1.5 w-full mt-3 px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-xs hover:shadow transition-all uppercase tracking-wider"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {content.navPostListingButton && !content.navPostListingButton.includes('Post Listing')
                ? content.navPostListingButton.replace(/^\+\s*/, '')
                : 'Sell Your Scrap'}
            </span>
          </Link>
        </div>

        {/* Bottom Auth & Account Section */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-2">
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
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-200/60 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#1D70B8] shrink-0" />
                    <div className="min-w-0">
                      <span className="block truncate font-black">{isAdmin ? 'Admin Desk' : 'Dashboard'}</span>
                      {user?.name && <span className="block text-[10px] text-slate-400 font-medium truncate">{user.name}</span>}
                    </div>
                  </Link>
                );
              })()}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-1.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 px-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {content.navSignInText || 'Sign In'}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 px-2 rounded-xl bg-[#D48B1C] text-white text-xs font-bold shadow-xs hover:bg-[#b87614] transition-colors uppercase tracking-wider text-[10px]"
              >
                {content.navRegisterText && content.navRegisterText.trim() !== 'Register Free'
                  ? content.navRegisterText
                  : 'Register'}
              </Link>
            </div>
          )}
          <p className="text-[9px] text-slate-400 text-center truncate pt-1">
            SalvageReef &copy; 2026
          </p>
        </div>
      </aside>

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
