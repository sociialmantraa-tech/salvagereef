import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, LayoutDashboard, Menu, X, PlusCircle } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
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
              Home
            </Link>
            <Link
              to="/auctions"
              className={`transition-colors ${
                isActive('/auctions') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              Auction
            </Link>
            <Link
              to="/classifieds"
              className={`transition-colors ${
                isActive('/classifieds') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              Classifieds
            </Link>
            <Link
              to="/about"
              className={`transition-colors ${
                isActive('/about') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`transition-colors ${
                isActive('/contact') ? 'text-[#1D70B8]' : 'hover:text-[#1D70B8]'
              }`}
            >
              Contact Us
            </Link>

            {isAuthenticated && (user?.role === 'admin' || user?.role === 'agent') && (
              <Link
                to="/classifieds/post-listing"
                className="flex items-center gap-1 text-xs font-bold text-[#D48B1C] bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-[#D48B1C] hover:text-white transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Post Listing
              </Link>
            )}
          </nav>

          {/* Right Controls: Login / Register */}
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
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-5 text-slate-700">
                <Link
                  to="/login"
                  className="hover:text-[#1D70B8] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hover:text-[#1D70B8] transition-colors"
                >
                  Register
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
            Home
          </Link>
          <Link
            to="/auctions"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 py-2 border-b border-slate-100"
          >
            Auction
          </Link>
          <Link
            to="/classifieds"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 py-2 border-b border-slate-100"
          >
            Classifieds
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 py-2 border-b border-slate-100"
          >
            About Us
          </Link>

          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 py-2 border-b border-slate-100 text-[#1D70B8]"
          >
            Contact Us
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
                  handleLogout();
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
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#1D70B8] font-bold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
