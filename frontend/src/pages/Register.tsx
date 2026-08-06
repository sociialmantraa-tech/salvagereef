import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Mail, Phone, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { loading, error: authError } = useAuthStore();

  // Step 1 vs Step 2 (Verification)
  const [step, setStep] = useState<number>(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'bidder',
    company_name: '',
    city: 'Thane',
    state: 'Maharashtra',
  });

  // Generated Demo OTPs state for Step 2
  const [generatedOtps, setGeneratedOtps] = useState<{ email_otp: string; phone_otp: string } | null>(null);

  // OTP Input Fields
  const [emailOtpInput, setEmailOtpInput] = useState<string>('');
  const [phoneOtpInput, setPhoneOtpInput] = useState<string>('');

  // Verification Statuses
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [verifyingEmail, setVerifyingEmail] = useState<boolean>(false);
  const [verifyingPhone, setVerifyingPhone] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit Registration Form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/register', formData);
      setGeneratedOtps({
        email_otp: res.data.email_otp,
        phone_otp: res.data.phone_otp,
      });
      // Pre-fill input boxes with generated demo OTPs for quick 1-click testing!
      setEmailOtpInput(res.data.email_otp);
      setPhoneOtpInput(res.data.phone_otp);
      setStep(2);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2A: Verify Email OTP
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setVerifyingEmail(true);

    try {
      const res = await api.post('/auth/verify-email-otp', {
        email: formData.email,
        otp: emailOtpInput,
      });

      setEmailVerified(true);

      // Check if both are now verified
      if (res.data.is_phone_verified || phoneVerified) {
        completeVerification(res.data);
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to verify email OTP');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Step 2B: Verify Phone OTP
  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setVerifyingPhone(true);

    try {
      const res = await api.post('/auth/verify-phone-otp', {
        email: formData.email,
        otp: phoneOtpInput,
      });

      setPhoneVerified(true);

      // Check if both are now verified
      if (res.data.is_email_verified || emailVerified) {
        completeVerification(res.data);
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to verify phone OTP');
    } finally {
      setVerifyingPhone(false);
    }
  };

  // Resend OTPs
  const handleResendOtps = async () => {
    setServerError(null);
    try {
      const res = await api.post('/auth/resend-otp', { email: formData.email });
      setGeneratedOtps({
        email_otp: res.data.email_otp,
        phone_otp: res.data.phone_otp,
      });
      setEmailOtpInput(res.data.email_otp);
      setPhoneOtpInput(res.data.phone_otp);
    } catch (err: any) {
      setServerError('Failed to resend OTPs');
    }
  };

  const completeVerification = (data: any) => {
    setVerificationSuccess(true);
    if (data.token && data.user) {
      localStorage.setItem('salvagereef_user', JSON.stringify(data.user));
      localStorage.setItem('salvagereef_token', data.token);
      useAuthStore.setState({ user: data.user, token: data.token, isAuthenticated: true });
    }
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="bg-[#D48B1C]/20 text-[#D48B1C] border border-[#D48B1C]/40 text-[10px] uppercase font-black px-3 py-1 rounded-full">
          {step === 1 ? 'Step 1 of 2: Buyer Registration' : 'Step 2 of 2: OTP Verification'}
        </span>
        <h1 className="text-2xl font-black text-slate-900">
          {step === 1 ? 'Register Verified Scrap Buyer' : 'Verify Email & Mobile Number'}
        </h1>
        <p className="text-xs text-slate-500">
          {step === 1
            ? 'Join SalvageReef tender desk for real-time auction access'
            : `Verification codes sent to ${formData.email} and +91 ${formData.phone}`}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {(serverError || authError) && (
          <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{serverError || authError}</span>
          </div>
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Neelkanth Sharma"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Firm Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Apex Metals Ltd"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="buyer@salvagereef.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone / Mobile *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="7304481166"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                >
                  <option value="bidder">Registered Buyer / Bidder</option>
                  <option value="agent">Disposal Seller / Agent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Thane"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Continue to OTP Verification
            </button>
          </form>
        )}

        {/* STEP 2: DUAL OTP VERIFICATION (EMAIL & PHONE) */}
        {step === 2 && (
          <div className="space-y-6 text-xs">
            {/* Generated Demo OTP Box */}
            {generatedOtps && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <KeyRound className="w-4 h-4 text-[#D48B1C]" /> Generated OTP Verification Codes
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Email OTP</span>
                    <span className="font-bold text-[#D48B1C] text-base">{generatedOtps.email_otp}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Phone OTP</span>
                    <span className="font-bold text-[#D48B1C] text-base">{generatedOtps.phone_otp}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Success Alert */}
            {verificationSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-center space-y-2 animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Account Fully Verified!</h4>
                <p className="text-xs text-emerald-700">Redirecting to your SalvageReef Dashboard...</p>
              </div>
            )}

            {/* SECTION 1: EMAIL OTP VERIFICATION */}
            <div className={`p-4 rounded-2xl border transition-all ${
              emailVerified ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[#D48B1C]" /> 1. Verify Email OTP ({formData.email})
                </span>
                {emailVerified ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold text-[11px]">Pending</span>
                )}
              </div>

              {!emailVerified && (
                <form onSubmit={handleVerifyEmail} className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={emailOtpInput}
                    onChange={(e) => setEmailOtpInput(e.target.value)}
                    placeholder="Enter 6-digit Email OTP"
                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                  />
                  <button
                    type="submit"
                    disabled={verifyingEmail}
                    className="px-4 py-2.5 bg-[#0B192C] hover:bg-[#D48B1C] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shrink-0"
                  >
                    {verifyingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Verify Email'}
                  </button>
                </form>
              )}
            </div>

            {/* SECTION 2: PHONE OTP VERIFICATION */}
            <div className={`p-4 rounded-2xl border transition-all ${
              phoneVerified ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[#D48B1C]" /> 2. Verify Mobile OTP (+91 {formData.phone})
                </span>
                {phoneVerified ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold text-[11px]">Pending</span>
                )}
              </div>

              {!phoneVerified && (
                <form onSubmit={handleVerifyPhone} className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={phoneOtpInput}
                    onChange={(e) => setPhoneOtpInput(e.target.value)}
                    placeholder="Enter 6-digit Mobile OTP"
                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                  />
                  <button
                    type="submit"
                    disabled={verifyingPhone}
                    className="px-4 py-2.5 bg-[#0B192C] hover:bg-[#D48B1C] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shrink-0"
                  >
                    {verifyingPhone ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Verify Mobile'}
                  </button>
                </form>
              )}
            </div>

            {/* Resend & Back controls */}
            <div className="pt-3 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-800 font-semibold"
              >
                &larr; Back to Details
              </button>

              <button
                type="button"
                onClick={handleResendOtps}
                className="text-[#D48B1C] hover:underline font-bold"
              >
                Resend OTP Codes
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-[#D48B1C] font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
