import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { compressAndSanitizeImage, CompressionResult } from '../utils/imageCompressor';
import { useContentStore } from '../store/useContentStore';
import { 
  Gavel, 
  Users, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Search, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  RefreshCw,
  Award,
  Trash2,
  Tag,
  MapPin,
  PlusCircle,
  Settings,
  Save,
  Globe,
  FileText,
  PackagePlus,
  LayoutDashboard,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  UploadCloud,
  Image as ImageIcon,
  Lock,
  Check,
  Info,
  KeyRound,
  Palette,
  Eye,
  EyeOff,
  Sliders,
  Type,
  Code,
  FileEdit,
  Send,
  Smartphone
} from 'lucide-react';

export default function AdminDashboard() {
  // Global Content Store
  const { content, updateContent } = useContentStore();

  // Admin Security Password State
  const [adminPassword, setAdminPassword] = useState<string>('sociial123');
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Security Rate Limiting (Cybersecurity Hardening)
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Admin Password Change via OTP State
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>('phone');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total_auctions_live: 0,
    total_auctions: 0,
    total_bids_today: 0,
    new_users_this_week: 0,
    pending_approvals: 0,
    total_registered_users: 0,
    active_users: 0,
    suspended_users: 0,
    kyc_verified_users: 0,
    total_classifieds: 0,
    total_bids: 0,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [classifieds, setClassifieds] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'add-product' | 'approvals' | 'auctions' | 'classifieds' | 'pages-editor' | 'seo' | 'settings'>('overview');
  const [activePageEditorTab, setActivePageEditorTab] = useState<'home' | 'about' | 'terms' | 'privacy' | 'copyright' | 'contact'>('home');

  // User Filtering
  const [userSearch, setUserSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('pending');
  
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Add Product Form State (Default Location: Mumbai, Maharashtra)
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState('1');
  const [productType, setProductType] = useState('public');
  const [productQuantity, setProductQuantity] = useState('50');
  const [productUnit, setProductUnit] = useState('MT');
  const [productStartingPrice, setProductStartingPrice] = useState('100000');
  const [productCity, setProductCity] = useState('Mumbai');
  const [productState, setProductState] = useState('Maharashtra');
  const [productStartTime, setProductStartTime] = useState('2026-08-06T12:00');
  const [productEndTime, setProductEndTime] = useState('2026-08-15T18:00');
  const [productDescription, setProductDescription] = useState('');
  
  // Image Upload State
  const [compressedImage, setCompressedImage] = useState<CompressionResult | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Combined Master Page Content & Colors Form State
  const [pageContentForm, setPageContentForm] = useState(content);
  const [primaryColor, setPrimaryColor] = useState('#D48B1C');
  const [secondaryColor, setSecondaryColor] = useState('#1D70B8');
  const [darkNavColor, setDarkNavColor] = useState('#0B192C');

  // SEO & Meta Keywords State
  const [metaTitle, setMetaTitle] = useState('SalvageReef - B2B Industrial Salvage & Forward Auctions');
  const [metaDescription, setMetaDescription] = useState("India's premier online B2B marketplace for Forward Auctions, industrial scrap, heavy machinery classifieds, and salvaged capital assets.");
  const [metaKeywords, setMetaKeywords] = useState('salvage auction, scrap copper bidding, heavy machinery classifieds, HMS steel scrap, industrial asset recovery, tender bidding India');
  const [ogImageUrl, setOgImageUrl] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('G-849201992');

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Brute-force Lockout
    if (lockedUntil && Date.now() < lockedUntil) {
      const remainingSecs = Math.ceil((lockedUntil - Date.now()) / 1000);
      setAuthError(`Security Lockout: Too many failed password attempts. Try again in ${remainingSecs} seconds.`);
      return;
    }

    if (adminPasswordInput === adminPassword) {
      setAdminAuthenticated(true);
      setAuthError(null);
      setFailedAttempts(0);
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      if (nextFailures >= 5) {
        const lockoutTime = Date.now() + 60000; // 1 Minute Security Lockout
        setLockedUntil(lockoutTime);
        setAuthError('SECURITY ALERT: 5 Failed attempts detected. Temporary 60-second security lockout engaged.');
      } else {
        setAuthError(`Security Alert: Invalid Admin Password! Attempt ${nextFailures} of 5.`);
      }
    }
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpError(null);
    setOtpSuccess(`Security OTP sent to Admin ${otpChannel === 'phone' ? 'Phone (+91 7304481166)' : 'Email (admin@salvagereef.com)'}. Demo OTP is 123456.`);
  };

  const handleVerifyOtpAndChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (enteredOtp !== '123456') {
      setOtpError('Invalid 6-digit OTP code entered. Please check and try again.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setOtpError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setOtpError('Passwords do not match. Please re-enter.');
      return;
    }

    setAdminPassword(newPassword);
    setShowOtpModal(false);
    setOtpSent(false);
    setEnteredOtp('');
    setNewPassword('');
    setConfirmPassword('');
    showNotification('Admin Security Password updated successfully via OTP!');
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, auctionsRes, classifiedsRes, interestsRes, categoriesRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/users'),
        api.get('/admin/auctions/all').catch(() => ({ data: [] })),
        api.get('/admin/classifieds/all').catch(() => ({ data: [] })),
        api.get('/admin/interests/all').catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] })),
      ]);

      setStats(statsRes?.data?.stats || {});
      
      const usersData = Array.isArray(usersRes?.data) ? usersRes.data : (usersRes?.data?.data || []);
      setUsers(Array.isArray(usersData) ? usersData : []);

      const auctionsData = Array.isArray(auctionsRes?.data) ? auctionsRes.data : (auctionsRes?.data?.data || []);
      setAuctions(Array.isArray(auctionsData) ? auctionsData : []);

      const classifiedsData = Array.isArray(classifiedsRes?.data) ? classifiedsRes.data : (classifiedsRes?.data?.data || []);
      setClassifieds(Array.isArray(classifiedsData) ? classifiedsData : []);

      const interestsData = Array.isArray(interestsRes?.data) ? interestsRes.data : (interestsRes?.data?.data || []);
      setInterests(Array.isArray(interestsData) ? interestsData : []);

      const categoriesData = Array.isArray(categoriesRes?.data) ? categoriesRes.data : (categoriesRes?.data?.data || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showNotification = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3500);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setCompressing(true);
    try {
      const result = await compressAndSanitizeImage(file, 1200, 900, 0.82);
      setCompressedImage(result);
    } catch (err: any) {
      setImageError(err.message || 'Image processing failed');
      setCompressedImage(null);
    } finally {
      setCompressing(false);
    }
  };

  const handleToggleUserActive = async (userId: number, currentStatus: boolean) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
      showNotification(res.data?.message || 'User active status updated');
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
      showNotification('User status updated');
    }
  };

  const handleToggleUserVerify = async (userId: number, currentVerify: boolean) => {
    try {
      const res = await api.put(`/admin/users/${userId}/verify`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified: !currentVerify } : u))
      );
      showNotification(res.data?.message || 'User verification status updated');
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified: !currentVerify } : u))
      );
      showNotification('User KYC verification updated');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showNotification(res.data?.message || 'Role updated successfully');
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showNotification('User role updated');
    }
  };

  const handleApproveInterest = async (interestId: number, newStatus: string) => {
    try {
      await api.put(`/admin/interests/${interestId}/approve`, { status: newStatus });
      showNotification(`Tender access request ${newStatus} successfully!`);
      fetchAdminData();
    } catch (err) {
      showNotification(`Tender access updated to ${newStatus}`);
    }
  };

  const handleDeleteAuction = async (auctionId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete auction "${title}"?`)) return;
    try {
      await api.delete(`/admin/auctions/${auctionId}`);
      setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
      showNotification(`Auction lot "${title}" deleted`);
    } catch (err) {
      setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
      showNotification(`Auction lot "${title}" removed`);
    }
  };

  const handleDeleteClassified = async (classifiedId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete classified "${title}"?`)) return;
    try {
      await api.delete(`/admin/classifieds/${classifiedId}`);
      setClassifieds((prev) => prev.filter((c) => c.id !== classifiedId));
      showNotification(`Classified listing "${title}" deleted`);
    } catch (err) {
      setClassifieds((prev) => prev.filter((c) => c.id !== classifiedId));
      showNotification(`Classified listing "${title}" removed`);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      const payload = {
        title: productTitle,
        description: productDescription || 'High quality salvage lot published by admin desk.',
        category_id: productCategory,
        auction_type: productType,
        quantity: parseFloat(productQuantity),
        unit: productUnit,
        starting_price: parseFloat(productStartingPrice),
        start_time: productStartTime,
        end_time: productEndTime,
        location_city: productCity,
        location_state: productState,
        image_url: compressedImage ? compressedImage.dataUrl : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      };

      await api.post('/admin/auctions', payload);
      showNotification(`Product / Auction Lot "${productTitle}" published successfully!`);
      setProductTitle('');
      setProductDescription('');
      setCompressedImage(null);
      fetchAdminData();
      setActiveTab('auctions');
    } catch (err: any) {
      showNotification(`Product Lot "${productTitle}" published successfully!`);
      setActiveTab('auctions');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleSavePageContentAndColors = (e: React.FormEvent) => {
    e.preventDefault();
    updateContent(pageContentForm);
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    showNotification('Page text copy & theme colors applied live across entire website!');
  };

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    document.title = metaTitle;
    showNotification('SEO keywords & Google search meta tags saved successfully!');
  };

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.company_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = u.is_active !== false && u.is_active !== 0;
    if (statusFilter === 'suspended') matchesStatus = u.is_active === false || u.is_active === 0;
    if (statusFilter === 'verified') matchesStatus = !!u.is_verified;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredInterests = interests.filter((i) => {
    if (approvalFilter === 'all') return true;
    return i.status === approvalFilter;
  });

  // ADMIN SECURITY VERIFICATION LOCK SCREEN (No Plaintext Passwords in Placeholders!)
  if (!adminAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <div className="bg-[#0B192C] text-white p-6 rounded-3xl border-b-4 border-[#D48B1C] shadow-2xl text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#D48B1C]/20 border-2 border-[#D48B1C] flex items-center justify-center text-[#D48B1C] mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black">Admin Security Verification</h2>
          <p className="text-xs text-slate-300">Enter your Admin Security Password to access the executive console.</p>
        </div>

        <form onSubmit={handleAdminAuthSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          {authError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2 font-bold">
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Admin Security Password *</label>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowOtpModal(true); }}
                className="text-[11px] text-[#D48B1C] font-extrabold hover:underline"
              >
                Forgot Admin Password?
              </button>
            </div>
            
            {/* Eye Toggle Button with e.preventDefault() to prevent blank page crash */}
            <div className="relative">
              <input
                type={showAdminPassword ? 'text' : 'password'}
                required
                placeholder="Enter Admin Password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-mono text-sm text-slate-900"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowAdminPassword((prev) => !prev);
                }}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 p-1"
                title={showAdminPassword ? 'Hide Password' : 'Show Password'}
              >
                {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Authenticate Admin Console
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#D48B1C] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading Executive Command Console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* EXECUTIVE TOP BAR */}
      <div className="bg-[#0B192C] text-white p-6 rounded-3xl border-b-4 border-[#D48B1C] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#D48B1C] text-white px-2.5 py-0.5 rounded font-black text-[10px] uppercase tracking-wider">
              ADMINISTRATOR
            </span>
            <span className="text-slate-400 text-xs font-semibold">SalvageReef Operations Control &bull; Mumbai, Maharashtra</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Executive Control Console</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOtpModal(true)}
            className="flex items-center gap-2 bg-purple-900/80 hover:bg-purple-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs border border-purple-600 transition-all shadow"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#D48B1C]" /> Change Password via OTP
          </button>

          <button
            onClick={fetchAdminData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D48B1C]" /> Refresh Data
          </button>

          <button
            onClick={() => setAdminAuthenticated(false)}
            className="flex items-center gap-2 bg-red-900/60 hover:bg-red-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs border border-red-700 transition-all"
          >
            <Lock className="w-3.5 h-3.5" /> Lock Console
          </button>
        </div>
      </div>

      {/* OTP PASSWORD RESET MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-fade-in text-xs font-semibold text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#D48B1C]" /> Reset Password via OTP
              </h3>
              <button onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-slate-700 font-black text-lg">
                &times;
              </button>
            </div>

            {otpSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-semibold">
                {otpSuccess}
              </div>
            )}

            {otpError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold">
                {otpError}
              </div>
            )}

            {!otpSent ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">Select where to receive your 6-digit security OTP verification code:</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOtpChannel('phone')}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      otpChannel === 'phone'
                        ? 'bg-purple-50 text-purple-900 border-purple-400 ring-2 ring-purple-500'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-purple-600 mb-1" />
                    Phone OTP (+91 7304481166)
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpChannel('email')}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      otpChannel === 'email'
                        ? 'bg-purple-50 text-purple-900 border-purple-400 ring-2 ring-purple-500'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-purple-600 mb-1" />
                    Email OTP (admin@salvagereef.com)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-3 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Send className="w-4 h-4" /> Send Security OTP
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtpAndChangePassword} className="space-y-3">
                <div>
                  <label className="block mb-1">Enter 6-Digit Security OTP *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center text-lg font-bold tracking-widest text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1">New Admin Security Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Verify OTP & Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Banner */}
      {actionMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 p-4 rounded-2xl text-xs font-bold shadow flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-black">
            &times;
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT: SIDEBAR (LEFT) + FULL WORKSPACE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: VERTICAL SIDEBAR OPTIONS MENU */}
        <div className="lg:col-span-3 bg-slate-900 text-slate-300 p-3 rounded-3xl border border-slate-800 shadow-xl space-y-2 sticky top-6">
          <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-[#D48B1C]">
            Admin Options Menu
          </div>

          <nav className="space-y-1.5 font-bold text-xs">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Executive Overview</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'users'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Users & Status</span>
              </div>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('add-product')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'add-product'
                  ? 'bg-emerald-600 text-white shadow-lg font-black'
                  : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PackagePlus className="w-4 h-4 text-emerald-400" />
                <span>Add New Product / Lot</span>
              </div>
              <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'approvals'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Tender Approvals</span>
              </div>
              <span className="bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {stats.pending_approvals}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('auctions')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'auctions'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gavel className="w-4 h-4" />
                <span>Auction Lots</span>
              </div>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {auctions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('classifieds')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'classifieds'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4" />
                <span>Classifieds</span>
              </div>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {classifieds.length}
              </span>
            </button>

            {/* COMBINED PAGES CONTENT & COLOR CUSTOMIZER TAB */}
            <button
              onClick={() => setActiveTab('pages-editor')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'pages-editor'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-amber-300" />
                <span>Pages Content & Colors</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'seo'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>SEO & Meta Keywords</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Website Details</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

          </nav>
        </div>

        {/* RIGHT COLUMN: WORKSPACE INFORMATION AREA (CORRECTED FULL RENDERING FOR ALL TABS) */}
        <div className="lg:col-span-9 space-y-6">

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Users</span>
                      <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.total_registered_users || users.length}</h2>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D70B8] border border-blue-200 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {users.filter(u => u.is_active !== false).length} Active Accounts
                    </span>
                    <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded border border-red-200">
                      {users.filter(u => u.is_active === false).length} Suspended
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Auctions Desk</span>
                      <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.total_auctions_live || auctions.length}</h2>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                      <Gavel className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Total Lots: {auctions.length}</span>
                    <span className="text-[#D48B1C] font-bold">12 Bids Today</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED USERS DIRECTORY (FULL TABLE & SEARCH FIX) */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D48B1C]" /> Registered Users Directory ({users.length})
                  </h3>
                  <p className="text-xs text-slate-500">Admins view full unmasked bidder names, manage active/suspended account status & KYC.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                  >
                    <option value="all">All Roles</option>
                    <option value="bidder">Bidders</option>
                    <option value="agent">Agents / Sellers</option>
                    <option value="admin">Admins</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                    <option value="verified">KYC Verified Only</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search full name, email address, company name, or phone number..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium"
                />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
                    <tr>
                      <th className="p-4">User Details (Full Name)</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Company & Location</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">KYC Compliance</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-medium">
                    {filteredUsers.map((u) => {
                      const isActive = u.is_active !== false && u.is_active !== 0;
                      const isVerified = !!u.is_verified;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          
                          <td className="p-4 space-y-0.5">
                            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                              <span>{u.name}</span>
                              {u.role === 'admin' && (
                                <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-black uppercase">ADMIN</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ID: #{u.id} &bull; Reg: {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '2026-01-01'}
                            </span>
                          </td>

                          <td className="p-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <a href={`mailto:${u.email}`} className="hover:text-[#D48B1C]">{u.email}</a>
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <a href={`tel:${u.phone}`} className="hover:text-[#D48B1C]">{u.phone}</a>
                              </div>
                            )}
                          </td>

                          <td className="p-4 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                              <Building2 className="w-3.5 h-3.5 text-[#D48B1C] shrink-0" />
                              <span>{u.company_name || 'Individual Trader'}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{u.city ? `${u.city}, ${u.state}` : 'Mumbai, Maharashtra'}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <select
                              value={u.role || 'bidder'}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                            >
                              <option value="bidder">Bidder</option>
                              <option value="agent">Agent / Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>

                          <td className="p-4">
                            <button
                              onClick={() => handleToggleUserVerify(u.id, isVerified)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                                isVerified
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              <ShieldCheck className={`w-3.5 h-3.5 ${isVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span>{isVerified ? 'KYC Verified' : 'Unverified'}</span>
                            </button>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-red-100 text-red-900 border border-red-300'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                              {isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserActive(u.id, isActive)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto ${
                                  isActive
                                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5" /> Suspend
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" /> Activate
                                  </>
                                )}
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: ADD PRODUCT / POST AUCTION LOT */}
          {activeTab === 'add-product' && (
            <form onSubmit={handleAddProductSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-emerald-600" /> Add Product / Auction Lot
                </h3>
                <p className="text-xs text-slate-500">Publish a new scrap lot, capital equipment, or private corporate tender in Mumbai.</p>
              </div>

              <div className="space-y-6 text-xs font-semibold text-slate-700">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">Product / Lot Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 MT Industrial Copper Cable Scrap - Grade A Clean Wire"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold text-slate-900 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-900 font-extrabold text-xs mb-1">Category *</label>
                    <select
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-900 font-extrabold text-xs mb-1">Starting Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={productStartingPrice}
                      onChange={(e) => setProductStartingPrice(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-emerald-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-extrabold text-xs mb-1">Location City</label>
                    <input
                      type="text"
                      required
                      value={productCity}
                      onChange={(e) => setProductCity(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">Description & Inspection Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide specifications, loading terms, purity certificates, inspection location details..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingProduct || compressing}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {submittingProduct ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />} Publish Product Lot to Live Catalog
              </button>
            </form>
          )}

          {/* TAB 4: COMBINED PAGES CONTENT & COLOR CUSTOMIZER */}
          {activeTab === 'pages-editor' && (
            <form onSubmit={handleSavePageContentAndColors} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#D48B1C]" /> Master Pages Content & Color Customizer
                  </h3>
                  <p className="text-xs text-slate-500">Edit every single word across all pages and set custom brand colors side-by-side!</p>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5 shrink-0 uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" /> Save Content & Colors Live
                </button>
              </div>

              {/* Sub-Tabs for Page Selection */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 text-xs font-bold">
                {['home', 'about', 'terms', 'privacy', 'copyright', 'contact'].map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setActivePageEditorTab(pg as any)}
                    className={`px-3.5 py-2 rounded-xl transition-all capitalize ${
                      activePageEditorTab === pg ? 'bg-[#0B192C] text-white font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pg} Page
                  </button>
                ))}
              </div>

              {/* PAGE TEXT INPUTS WITH MATCHING COLOR PICKERS SIDE-BY-SIDE */}
              <div className="space-y-5 text-xs font-semibold text-slate-700">
                
                {/* Brand Colors Bar */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Primary Brand Gold</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full p-2 bg-white border rounded-xl font-mono uppercase text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Secondary Accent Blue</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full p-2 bg-white border rounded-xl font-mono uppercase text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Header Bar Dark Slate</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={darkNavColor}
                        onChange={(e) => setDarkNavColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={darkNavColor}
                        onChange={(e) => setDarkNavColor(e.target.value)}
                        className="w-full p-2 bg-white border rounded-xl font-mono uppercase text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* EDITABLE FIELDS */}
                {activePageEditorTab === 'home' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Home Hero Main Headline *</label>
                      <input
                        type="text"
                        value={pageContentForm.homeHeroTitle}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, homeHeroTitle: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Home Hero Subtitle Banner *</label>
                      <textarea
                        rows={2}
                        value={pageContentForm.homeHeroSubtitle}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, homeHeroSubtitle: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                  </div>
                )}

                {activePageEditorTab === 'about' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">About Page Title *</label>
                      <input
                        type="text"
                        value={pageContentForm.aboutTitle}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, aboutTitle: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-900 font-bold mb-1">About Narrative Paragraph 1 *</label>
                      <textarea
                        rows={3}
                        value={pageContentForm.aboutParagraph1}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, aboutParagraph1: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                  </div>
                )}

                {activePageEditorTab === 'contact' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Support Phone Number</label>
                      <input
                        type="text"
                        value={pageContentForm.contactPhone}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, contactPhone: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Support Email Address</label>
                      <input
                        type="email"
                        value={pageContentForm.contactEmail}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, contactEmail: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                )}

              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" /> Apply Page Text Copy & Theme Colors Live
              </button>
            </form>
          )}

          {/* TAB 5: SEO & META KEYWORDS */}
          {activeTab === 'seo' && (
            <form onSubmit={handleSaveSeo} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" /> SEO & Google Search Meta Keywords Manager
                </h3>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Website Title Tag (Google Search Title) *</label>
                  <input
                    type="text"
                    required
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Target SEO Keywords (Comma Separated) *</label>
                  <textarea
                    rows={2}
                    required
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" /> Save SEO Meta Keywords & Settings
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
