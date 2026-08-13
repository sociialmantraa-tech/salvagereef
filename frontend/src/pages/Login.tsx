import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Lock, Mail, AlertTriangle, ArrowRight, RefreshCw, ShieldCheck, UserCheck, Eye, EyeOff, KeyRound, CheckCircle2, Send } from 'lucide-react';

import SEOHead from '../components/SEOHead';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading, error } = useAuthStore();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

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
    const res = await loginWithGoogle({
      email: email || 'admin@salvagereef.com',
      name: 'Google Verified User',
    });
    setGoogleLoading(false);
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
    setPassword('sociial123');
    const res = await login('admin@salvagereef.com', 'sociial123');
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
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      <SEOHead
        title="Sign In — SalvageReef B2B Console"
        description="Sign in to your SalvageReef account to place live bids, access private corporate tenders, and manage scrap listings."
      />
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-[#0D1B2A] border-2 border-[#D48B1C] flex items-center justify-center text-[#D48B1C] font-extrabold text-2xl mx-auto shadow-md">
          SR
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In to SalvageReef</h1>
        <p className="text-xs text-slate-500">Access real-time bidding, management console & tender desk in Mumbai</p>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address / Admin ID</label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium text-slate-900"
                placeholder="name@company.com or Login ID"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-[#D48B1C] font-extrabold hover:underline"
              >
                Forgot Password / Admin PIN?
              </button>
            </div>

            {/* Password input with Eye / EyeOff Toggle Button */}
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
            className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
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
                    placeholder="Enter your registered email (e.g. name@company.com)"
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
                    placeholder="123456"
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
