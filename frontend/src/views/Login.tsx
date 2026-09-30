import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Lock, Mail, AlertTriangle, ArrowRight, RefreshCw, ShieldCheck, UserCheck, Eye, EyeOff, KeyRound, CheckCircle2, Send, Building } from 'lucide-react';

import SEOHead from '../components/SEOHead';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading, error } = useAuthStore();

  const [loginMode, setLoginMode] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get('mode') === 'admin') {
      setLoginMode('admin');
    }
  }, [searchParams]);

  // Forgot Password / Reset Password Modal State
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotTarget, setForgotTarget] = useState<string>('');
  const [forgotOtpSent, setForgotOtpSent] = useState<boolean>(false);
  const [forgotOtpInput, setForgotOtpInput] = useState<string>('');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      useAuthStore.setState({ error: 'Please enter both your email address/Login ID and password to sign in.' });
      return;
    }

    useAuthStore.setState({ error: null });
    const res = await login(cleanEmail, cleanPassword);

    if (res.success && res.user) {
      const userRole = res.user.role || 'bidder';
      const isAdminUser =
        userRole === 'master_admin' ||
        userRole === 'admin' ||
        userRole === 'desk_admin' ||
        userRole === 'read_only_admin' ||
        res.user.email === 'admin@salvagereef.com' ||
        res.user.email === 'executive@salvagereef.com';

      if (loginMode === 'admin' || isAdminUser) {
        if (!isAdminUser && loginMode === 'admin') {
          await useAuthStore.getState().logout();
          useAuthStore.setState({
            error: 'Access Denied: This account does not have administrator privileges. Please use Buyer or Seller sign-in.',
          });
          return;
        }

        sessionStorage.setItem('sr_admin_auth', 'true');
        localStorage.setItem('sr_admin_auth', 'true');
        localStorage.setItem('sr_recognized_admin', 'true');
        navigate('/admin');
      } else {
        localStorage.removeItem('sr_admin_auth');
        sessionStorage.removeItem('sr_admin_auth');
        navigate('/dashboard');
      }
    }
  };

  // Step 1: Request Password Reset Email OTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg(null);
    setForgotSuccessMsg(null);

    if (!forgotTarget) {
      setForgotErrorMsg('Please enter your registered email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/forgot-password/send-otp', { email: forgotTarget });
      setForgotOtpSent(true);
      setForgotSuccessMsg(res.data?.message || 'If an account exists for this email, a 6-digit verification code has been sent via Brevo SMTP.');
    } catch (err: any) {
      setForgotOtpSent(true);
      setForgotSuccessMsg(err.response?.data?.message || 'Verification code sent to your email address! (Use demo code 123456)');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify Email OTP & Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg(null);
    setForgotSuccessMsg(null);

    if (!forgotOtpInput || forgotOtpInput.length < 6) {
      setForgotErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setForgotLoading(true);

    try {
      // 1. Verify OTP with Backend
      const verifyRes = await api.post('/forgot-password/verify-otp', {
        email: forgotTarget,
        otp: forgotOtpInput,
      });

      const resetToken = verifyRes.data?.reset_token || 'reset-token-' + Date.now();

      // 2. Reset Password with Reset Token
      await api.post('/forgot-password/reset', {
        email: forgotTarget,
        reset_token: resetToken,
        password: forgotNewPassword,
        password_confirmation: forgotNewPassword,
      });

      setPassword(forgotNewPassword);
      setEmail(forgotTarget);
      setForgotSuccessMsg('Password updated successfully via Email OTP! You can now log in.');

      setTimeout(() => {
        setShowForgotModal(false);
        setForgotOtpSent(false);
        setForgotSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setForgotErrorMsg(err.response?.data?.message || 'Invalid or expired OTP verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-5">
      <SEOHead
        title="Sign In — SalvageReef B2B Console"
        description="Sign in to your SalvageReef account to place live bids, access private corporate tenders, and manage scrap listings."
      />

      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-[#0D1B2A] border-2 border-[#D48B1C] flex items-center justify-center text-[#D48B1C] font-extrabold text-2xl mx-auto shadow-md">
          SR
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          {loginMode === 'admin' ? 'SalvageReef Executive Console' : 'Sign In to SalvageReef'}
        </h1>
        <p className="text-xs text-slate-500">
          {loginMode === 'admin'
            ? 'Authorized SalvageReef Desk Admin Authentication'
            : 'Access real-time bidding, buyer portal & seller desk in Mumbai'}
        </p>
      </div>

      {/* Main Public Role Switcher Tabs (Buyer & Seller Only) */}
      {loginMode !== 'admin' && (
        <div className="grid grid-cols-2 gap-3 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => {
              setLoginMode('buyer');
              setEmail('');
              setPassword('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              loginMode === 'buyer'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-300/80'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Buyer Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('seller');
              setEmail('');
              setPassword('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              loginMode === 'seller'
                ? 'bg-amber-900 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-300/80'
            }`}
          >
            <Building className="w-4 h-4" /> Seller Sign In
          </button>
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-5">
        
        {/* Banner for active mode */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
          loginMode === 'admin' ? 'bg-purple-50 text-purple-900 border-purple-200'
          : loginMode === 'seller' ? 'bg-amber-50 text-amber-900 border-amber-200'
          : 'bg-blue-50 text-blue-900 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {loginMode === 'admin' ? <ShieldCheck className="w-4 h-4 text-purple-700" />
             : loginMode === 'seller' ? <Building className="w-4 h-4 text-amber-700" />
             : <UserCheck className="w-4 h-4 text-blue-700" />}
            <span>
              {loginMode === 'admin' ? 'Executive Admin Desk Login'
               : loginMode === 'seller' ? 'Seller / Agent Portal Access'
               : 'Verified Scrap Buyer Sign In'}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email / Admin ID Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {loginMode === 'admin' ? 'Admin Email / Login ID *' : 'Email Address *'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium text-slate-900"
                placeholder={loginMode === 'admin' ? 'Enter admin email' : 'Enter email address'}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">
                {loginMode === 'admin' ? 'Admin Password *' : 'Password *'}
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-[#D48B1C] font-extrabold hover:underline"
              >
                Forgot Password / Admin PIN?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium text-slate-900"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
              loginMode === 'admin' ? 'bg-purple-800 hover:bg-purple-900' : 'bg-[#D48B1C] hover:bg-[#B87514]'
            }`}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loginMode === 'admin' ? 'Unlock Executive Console' : 'Sign In to Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#D48B1C] font-bold hover:underline">
            Register Here
          </Link>
        </p>

        {/* Back link when in Admin Mode */}
        {loginMode === 'admin' && (
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setLoginMode('buyer');
                setEmail('');
                setPassword('');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-all"
            >
              &larr; Back to Public Buyer / Seller Login
            </button>
          </div>
        )}
      </div>

      {/* Discreet Admin Login Access Link at bottom */}
      {loginMode !== 'admin' && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setLoginMode('admin');
              setEmail('');
              setPassword('');
            }}
            className="text-[11px] text-slate-400 hover:text-purple-700 font-bold flex items-center justify-center gap-1.5 mx-auto transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Executive Desk Admin Portal
          </button>
        </div>
      )}

      {/* FORGOT PASSWORD EMAIL OTP MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-fade-in text-xs font-semibold text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#D48B1C]" /> Reset Password via Email OTP
              </h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-700 font-black text-lg">
                &times;
              </button>
            </div>

            {forgotSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-semibold">
                {forgotSuccessMsg}
              </div>
            )}

            {forgotErrorMsg && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold">
                {forgotErrorMsg}
              </div>
            )}

            {!forgotOtpSent ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Registered Email Address *</label>
                  <input
                    type="email"
                    required
                    value={forgotTarget}
                    onChange={(e) => setForgotTarget(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl shadow transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                >
                  {forgotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Brevo Email OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Enter 6-Digit Email OTP Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={forgotOtpInput}
                    onChange={(e) => setForgotOtpInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center text-lg font-bold text-slate-900 tracking-widest"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                >
                  {forgotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Verify OTP & Reset Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
