import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, AlertTriangle, ArrowRight, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading, error } = useAuthStore();
  const [email, setEmail] = useState<string>('admin@salvagereef.com');
  const [password, setPassword] = useState<string>('admin123');
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleQuickAdminLogin = async () => {
    setEmail('admin@salvagereef.com');
    setPassword('admin123');
    const res = await login('admin@salvagereef.com', 'admin123');
    if (res.success) {
      navigate('/admin');
    }
  };

  const handleQuickBidderLogin = async () => {
    setEmail('bidder@salvagereef.com');
    setPassword('bidder123');
    const res = await login('bidder@salvagereef.com', 'bidder123');
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-[#0D1B2A] border-2 border-[#D48B1C] flex items-center justify-center text-[#D48B1C] font-extrabold text-2xl mx-auto shadow-md">
          SR
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In to SalvageReef</h1>
        <p className="text-xs text-slate-500">Access real-time bidding, management console & tender desk</p>
      </div>

      {/* Official Google OAuth Sign In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-300 shadow-md transition-all flex items-center justify-center gap-3 text-xs"
      >
        {googleLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-[#D48B1C]" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Sign in with Google</span>
      </button>

      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-slate-200 w-full"></div>
        <span className="bg-[#F8FAFC] px-3 text-[10px] uppercase font-bold text-slate-400 shrink-0">Or password login</span>
        <div className="border-t border-slate-200 w-full"></div>
      </div>

      {/* Quick Demo Shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleQuickAdminLogin}
          className="p-3 bg-purple-900 hover:bg-purple-950 text-white rounded-2xl border border-purple-700 shadow-md text-left transition-all group"
        >
          <div className="flex items-center gap-1.5 text-[#D48B1C] text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> 1-Click Admin
          </div>
          <p className="font-bold text-xs text-white mt-1 group-hover:underline">Admin Desk Login &rarr;</p>
        </button>

        <button
          type="button"
          onClick={handleQuickBidderLogin}
          className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl border border-slate-700 shadow-md text-left transition-all group"
        >
          <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-black uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" /> 1-Click Bidder
          </div>
          <p className="font-bold text-xs text-white mt-1 group-hover:underline">Buyer Sign In &rarr;</p>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium"
                placeholder="name@company.com"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D48B1C] hover:bg-[#B87514] text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Sign In to Console
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#D48B1C] font-bold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
