import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState<string>('bidder@salvagereef.com');
  const [password, setPassword] = useState<string>('bidder123');

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

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#0D1B2A] border-2 border-[#D48B1C] flex items-center justify-center text-[#D48B1C] font-extrabold text-xl mx-auto shadow-md">
          SR
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In to SalvageReef</h1>
        <p className="text-xs text-slate-500">Access real-time bidding & tender desk</p>
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
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
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
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-[#D48B1C] block uppercase tracking-wider">Quick Demo Credentials:</span>
            <div className="flex justify-between">
              <span>Bidder: <code className="bg-slate-200 px-1 py-0.5 rounded">bidder@salvagereef.com</code></span>
              <span>Pass: <code className="bg-slate-200 px-1 py-0.5 rounded">bidder123</code></span>
            </div>
            <div className="flex justify-between">
              <span>Admin: <code className="bg-slate-200 px-1 py-0.5 rounded">admin@salvagereef.com</code></span>
              <span>Pass: <code className="bg-slate-200 px-1 py-0.5 rounded">admin123</code></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D48B1C] hover:bg-[#B87514] text-white font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Sign In
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have a buyer account?{' '}
          <Link to="/register" className="text-[#D48B1C] font-bold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
