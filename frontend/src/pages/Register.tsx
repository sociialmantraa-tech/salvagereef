import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, Eye, EyeOff } from 'lucide-react';

import SEOHead from '../components/SEOHead';

export default function Register() {
  const navigate = useNavigate();
  const { error: authError } = useAuthStore();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  // Compact Country Code Selector
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'bidder',
    company_name: '',
    city: 'Mumbai',
    state: 'Maharashtra',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'phone') {
      setPhoneError(null);
    }
    if (e.target.name === 'email') {
      setEmailError(null);
    }
    if (e.target.name === 'password') {
      setPasswordError(null);
    }
  };

  // Validate Email onBlur
  const handleEmailBlur = () => {
    if (!formData.email) return;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Invalid email format (e.g. buyer@salvagereef.com)');
    } else {
      setEmailError(null);
    }
  };

  // Validate Mobile Phone onBlur
  const handlePhoneBlur = () => {
    if (!formData.phone) return;
    validatePhone(formData.phone, countryCode);
  };

  const validatePhone = (phone: string, code: string): boolean => {
    const clean = phone.replace(/\D/g, '');
    if (code === '+91') {
      if (!/^[6-9]\d{9}$/.test(clean)) {
        setPhoneError('Invalid mobile number. Must be 10 digits starting with 6-9.');
        return false;
      }
    } else {
      if (clean.length < 7 || clean.length > 14) {
        setPhoneError('Invalid phone number (7-14 digits required).');
        return false;
      }
    }
    setPhoneError(null);
    return true;
  };

  // Validate Password Rules (Min 6 chars, letters & numbers)
  const validatePassword = (pwd: string): boolean => {
    if (!pwd) return false;
    if (pwd.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return false;
    }
    if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      setPasswordError('Password must contain both letters and numbers.');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handlePasswordBlur = () => {
    if (!formData.password) return;
    validatePassword(formData.password);
  };

  // Submit Registration Form Directly
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Invalid email format. Please enter a valid email address.');
      return;
    }

    if (!validatePhone(formData.phone, countryCode)) {
      return;
    }

    if (!validatePassword(formData.password)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const fullPhone = `${countryCode} ${formData.phone}`;
      const payload = { ...formData, phone: fullPhone };
      const res = await api.post('/auth/register', payload);

      const userToSave = res.data?.user || { ...formData, phone: fullPhone, id: Date.now(), is_verified: true };
      const tokenToSave = res.data?.token || 'verified-user-token-' + Date.now();

      localStorage.setItem('salvagereef_user', JSON.stringify(userToSave));
      localStorage.setItem('salvagereef_token', tokenToSave);
      localStorage.setItem('salvagereef_token_exp', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());

      useAuthStore.setState({ user: userToSave, token: tokenToSave, isAuthenticated: true });
      setRegistrationSuccess(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        err.response?.data?.errors?.phone?.[0] ||
        err.message ||
        'Registration failed';

      if (backendMsg.toLowerCase().includes('already') || backendMsg.toLowerCase().includes('taken')) {
        setServerError('This email address is already registered. Please sign in with your account.');
      } else {
        setServerError(backendMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <SEOHead
        title="Register Verified Scrap Buyer Account — SalvageReef"
        description="Create your free SalvageReef buyer or seller account to participate in live salvage auctions and industrial asset liquidations across India."
      />
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="bg-[#D48B1C]/20 text-[#D48B1C] border border-[#D48B1C]/40 text-[10px] uppercase font-black px-3 py-1 rounded-full">
          Instant Registration
        </span>
        <h1 className="text-2xl font-black text-slate-900">
          Register Verified Scrap Buyer
        </h1>
        <p className="text-xs text-slate-500">
          Join SalvageReef tender desk for real-time auction access in Mumbai
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {(serverError || authError) && (
          <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs flex items-center justify-between gap-3 font-bold animate-shake">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{serverError || authError}</span>
            </div>
            {(serverError?.toLowerCase().includes('already') || serverError?.toLowerCase().includes('taken') || serverError?.toLowerCase().includes('sign in')) && (
              <Link to="/login" className="px-3 py-1.5 bg-[#D48B1C] text-white rounded-xl text-[10px] font-extrabold hover:bg-[#B87514] shrink-0 uppercase tracking-wider shadow">
                Sign In &rarr;
              </Link>
            )}
          </div>
        )}

        {registrationSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-center space-y-2 animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm">Account Registered Successfully!</h4>
            <p className="text-xs text-emerald-700">Redirecting to your SalvageReef Dashboard...</p>
          </div>
        )}

        {/* REGISTRATION FORM */}
        {!registrationSuccess && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Full Name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Company / Firm Name</label>
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
              {/* EMAIL WITH ONBLUR VALIDATION */}
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  placeholder="buyer@salvagereef.com"
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] ${
                    emailError ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  }`}
                />
                {emailError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* COMPACT NARROW COUNTRY SELECTOR */}
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Phone / Mobile *</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-[#D48B1C]">
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      if (formData.phone) validatePhone(formData.phone, e.target.value);
                    }}
                    className="w-[64px] shrink-0 px-1 py-2.5 bg-slate-100 border-r border-slate-300 text-[10px] font-extrabold text-slate-800 focus:outline-none cursor-pointer text-center"
                  >
                    <option value="+91">+91 IN</option>
                    <option value="+971">+971 AE</option>
                    <option value="+966">+966 SA</option>
                    <option value="+65">+65 SG</option>
                    <option value="+44">+44 UK</option>
                    <option value="+1">+1 US</option>
                  </select>

                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handlePhoneBlur}
                    placeholder="Enter mobile number"
                    className={`w-full px-3 py-2.5 bg-slate-50 focus:outline-none font-mono text-sm ${
                      phoneError ? 'bg-red-50/40 text-red-900' : 'text-slate-900'
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Account Role</label>
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

              {/* PASSWORD FIELD WITH SECURITY RULES */}
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handlePasswordBlur}
                    placeholder="Min 6 chars (e.g. Pass123)"
                    className={`w-full pr-10 pl-3 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] ${
                      passwordError ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword((prev) => !prev);
                    }}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">City (Mumbai Enforced)</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-extrabold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Create Account
            </button>
          </form>
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
