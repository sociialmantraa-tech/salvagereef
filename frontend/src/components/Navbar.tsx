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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand on Left */}
          <Link to="/" className="flex items-center group">
            <Logo className="w-10 h-10" showText={true} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700">
            <Link
              to="/"
              className={`transition-colors ${
                isActive('/') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navHomeText || 'Home'}
            </Link>
            <Link
              to="/auctions"
              className={`transition-colors ${
                isActive('/auctions') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navAuctionsText || 'Auction'}
            </Link>
            <Link
              to="/classifieds"
              className={`transition-colors ${
                isActive('/classifieds') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navClassifiedsText || 'Classifieds'}
            </Link>
            <Link
              to="/about"
              className={`transition-colors ${
                isActive('/about') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navAboutText || 'About Us'}
            </Link>
            <Link
              to="/contact"
              className={`transition-colors ${
                isActive('/contact') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              {content.navContactText || 'Contact Us'}
            </Link>

            {isAuthenticated && (user?.role === 'admin' || user?.role === 'agent') && (
              <Link
                to="/classifieds/post-listing"
                className="flex items-center gap-1 text-xs font-bold text-[#D48B1C] bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-[#D48B1C] hover:text-white transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" /> {(content.navPostListingButton || 'Post Listing').replace(/^\+\s*/, '')}
              </Link>
            )}
          </nav>

          {/* Right Controls: Login / Register / Logout */}
          <div className="hidden md:flex items-center gap-6 text-sm font-bold">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-1.5 text-slate-800 hover:text-[#1D70B8] transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#1D70B8]" />
                  {user?.role === 'admin' ? 'Admin Desk' : 'Dashboard'}
                </Link>
                
                {/* Logout Button with Confirmation Dialog */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 font-extrabold text-xs">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:border-[#1D70B8] text-slate-800 hover:text-[#1D70B8] transition-all flex items-center gap-1.5 shadow-sm bg-slate-50/50"
                >
                  {content.navSignInText || 'Sign In'}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-[#D48B1C] hover:bg-[#b87614] text-white transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg uppercase tracking-wider text-[11px]"
                >
                  {content.navRegisterText || 'Register Free'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Drawer Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 hover:text-slate-900 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 text-sm font-bold">
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
          {isAuthenticated ? (
            <>
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-800 py-2 border-b border-slate-100"
              >
                Dashboard ({user?.name})
              </Link>
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
                {content.navRegisterText || 'Register'}
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
