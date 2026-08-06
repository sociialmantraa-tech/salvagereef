import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, AlertTriangle, ArrowRight, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState<string>('admin@salvagereef.com');
  const [password, setPassword] = useState<string>('admin123');

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

      {/* Quick 1-Click Login Shortcuts */}
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
