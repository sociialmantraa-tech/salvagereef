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
  Sliders,
  Type,
  Code,
  FileEdit,
  Send,
  Smartphone,
  ShieldElbow
} from 'lucide-react';

export default function AdminDashboard() {
  // Global Content Store
  const { content, updateContent } = useContentStore();

  // Admin Security Password State (Updated to sociial123)
  const [adminPassword, setAdminPassword] = useState<string>('sociial123');
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Password Change via OTP State
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>('phone');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'add-product' | 'approvals' | 'auctions' | 'classifieds' | 'pages-editor' | 'seo' | 'theme' | 'settings'>('overview');
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

  // Page Content Form State
  const [pageContentForm, setPageContentForm] = useState(content);

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === adminPassword) {
      setAdminAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Security Alert: Invalid Admin Password! Access Denied.');
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
      alert('Failed to update user active status');
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
      alert('Failed to update user verification status');
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
      alert('Failed to update user role');
    }
  };

  const handleApproveInterest = async (interestId: number, newStatus: string) => {
    try {
      await api.put(`/admin/interests/${interestId}/approve`, { status: newStatus });
      showNotification(`Tender access request ${newStatus} successfully!`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update interest status');
    }
  };

  const handleDeleteAuction = async (auctionId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete auction "${title}"?`)) return;
    try {
      await api.delete(`/admin/auctions/${auctionId}`);
      setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
      showNotification(`Auction lot "${title}" deleted`);
    } catch (err) {
      alert('Failed to delete auction');
    }
  };

  const handleDeleteClassified = async (classifiedId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete classified "${title}"?`)) return;
    try {
      await api.delete(`/admin/classifieds/${classifiedId}`);
      setClassifieds((prev) => prev.filter((c) => c.id !== classifiedId));
      showNotification(`Classified listing "${title}" deleted`);
    } catch (err) {
      alert('Failed to delete classified');
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
      alert(err.response?.data?.message || 'Failed to publish product auction lot');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleSavePageContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateContent(pageContentForm);
    showNotification('Website Page Content & Copy updated successfully across all pages!');
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

  // ADMIN SECURITY VERIFICATION LOCK SCREEN (Password: sociial123)
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
              <label className="block text-xs font-bold text-slate-700">Admin Password *</label>
              <button
                type="button"
                onClick={() => setShowOtpModal(true)}
                className="text-[11px] text-[#D48B1C] font-extrabold hover:underline"
              >
                Forgot Admin Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showAdminPassword ? 'text' : 'password'}
                required
                placeholder="Enter admin password (sociial123)"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-mono text-sm text-slate-900"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
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

      {/* ADMIN PASSWORD RESET VIA OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#D48B1C]" /> Reset Admin Password via OTP
              </h3>
              <button onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-slate-700 font-black text-lg">
                &times;
              </button>
            </div>

            {otpSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold">
                {otpSuccess}
              </div>
            )}

            {otpError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
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
              <form onSubmit={handleVerifyOtpAndChangePassword} className="space-y-3 text-xs font-semibold text-slate-700">
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

      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT: VERTICAL SIDEBAR MENU (LEFT) + WORKSPACE (RIGHT) */}
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

            {/* NEW TAB: PAGES CONTENT EDITOR (EDIT EVERY SINGLE WORD & PAGE CONTENT) */}
            <button
              onClick={() => setActiveTab('pages-editor')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'pages-editor'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileEdit className="w-4 h-4 text-amber-300" />
                <span>Pages Content Editor</span>
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
              onClick={() => setActiveTab('theme')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                activeTab === 'theme'
                  ? 'bg-[#D48B1C] text-white shadow-lg font-black'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-[#D48B1C]" />
                <span>Page Content & Colors</span>
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

        {/* RIGHT COLUMN: VERTICAL WORKSPACE INFORMATION AREA */}
        <div className="lg:col-span-9 space-y-6">

          {/* SECTION 1: EXECUTIVE OVERVIEW */}
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
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {stats.active_users || users.filter(u => u.is_active !== false).length} Active Accounts
                    </span>
                    <span className="text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded border border-red-200">
                      {stats.suspended_users || users.filter(u => u.is_active === false).length} Suspended
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Auctions Desk</span>
                      <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.total_auctions_live}</h2>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                      <Gavel className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Total Lots: {auctions.length}</span>
                    <span className="text-[#D48B1C] font-bold">{stats.total_bids_today} Bids Today</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PAGES CONTENT EDITOR (EDIT EVERY SINGLE WORD & PAGE CONTENT) */}
          {activeTab === 'pages-editor' && (
            <form onSubmit={handleSavePageContent} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <FileEdit className="w-5 h-5 text-[#D48B1C]" /> Pages Content & Copy Editor
                  </h3>
                  <p className="text-xs text-slate-500">Edit every single word, title, narrative, and clause across all pages on your website.</p>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D48B1C] hover:bg-[#b87614] text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5 shrink-0"
                >
                  <Save className="w-4 h-4" /> Save All Pages Copy
                </button>
              </div>

              {/* Sub-Tabs for selecting specific page to edit */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActivePageEditorTab('home')}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    activePageEditorTab === 'home' ? 'bg-[#0B192C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🏠 Home Page
                </button>

                <button
                  type="button"
                  onClick={() => setActivePageEditorTab('about')}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    activePageEditorTab === 'about' ? 'bg-[#0B192C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🏢 About Us Page
                </button>

                <button
                  type="button"
                  onClick={() => setActivePageEditorTab('terms')}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    activePageEditorTab === 'terms' ? 'bg-[#0B192C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📜 Terms & Conditions
                </button>

                <button
                  type="button"
                  onClick={() => setActivePageEditorTab('privacy')}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    activePageEditorTab === 'privacy' ? 'bg-[#0B192C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔒 Privacy Policy
                </button>

                <button
                  type="button"
                  onClick={() => setActivePageEditorTab('copyright')}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    activePageEditorTab === 'copyright' ? 'bg-[#0B192C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ©️ Copyright Policy
                </button>

                <button
                  type="button"
                  onClick={() => setActivePageEditorTab('contact')}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    activePageEditorTab === 'contact' ? 'bg-[#0B192C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📍 Contact & Location
                </button>
              </div>

              {/* HOME PAGE FIELDS */}
              {activePageEditorTab === 'home' && (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Hero Main Heading *</label>
                    <input
                      type="text"
                      value={pageContentForm.homeHeroTitle}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, homeHeroTitle: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Hero Subtitle Text *</label>
                    <textarea
                      rows={2}
                      value={pageContentForm.homeHeroSubtitle}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, homeHeroSubtitle: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-900 font-bold">Auctions Section Heading</label>
                      <input
                        type="text"
                        value={pageContentForm.homeAuctionsHeading}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, homeAuctionsHeading: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-900 font-bold">Classifieds Section Heading</label>
                      <input
                        type="text"
                        value={pageContentForm.homeClassifiedsHeading}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, homeClassifiedsHeading: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ABOUT US PAGE FIELDS */}
              {activePageEditorTab === 'about' && (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">About Page Title</label>
                    <input
                      type="text"
                      value={pageContentForm.aboutTitle}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, aboutTitle: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Primary Narrative Paragraph 1</label>
                    <textarea
                      rows={4}
                      value={pageContentForm.aboutParagraph1}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, aboutParagraph1: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">KYC & Transparency Narrative Paragraph 2</label>
                    <textarea
                      rows={4}
                      value={pageContentForm.aboutParagraph2}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, aboutParagraph2: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* TERMS & CONDITIONS FIELDS */}
              {activePageEditorTab === 'terms' && (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Terms Page Title</label>
                    <input
                      type="text"
                      value={pageContentForm.termsTitle}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, termsTitle: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Clause 1: Registration & KYC Norms</label>
                    <textarea
                      rows={2}
                      value={pageContentForm.termsClause1}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, termsClause1: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Clause 2: Forward Bidding Rules</label>
                    <textarea
                      rows={2}
                      value={pageContentForm.termsClause2}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, termsClause2: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* PRIVACY POLICY FIELDS */}
              {activePageEditorTab === 'privacy' && (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Privacy Policy Title</label>
                    <input
                      type="text"
                      value={pageContentForm.privacyTitle}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, privacyTitle: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Privacy Policy Content</label>
                    <textarea
                      rows={5}
                      value={pageContentForm.privacyText}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, privacyText: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* COPYRIGHT POLICY FIELDS */}
              {activePageEditorTab === 'copyright' && (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Copyright Policy Title</label>
                    <input
                      type="text"
                      value={pageContentForm.copyrightTitle}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, copyrightTitle: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Copyright Statement Text</label>
                    <textarea
                      rows={5}
                      value={pageContentForm.copyrightText}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, copyrightText: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* CONTACT & LOCATION FIELDS */}
              {activePageEditorTab === 'contact' && (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-900 font-bold">Contact Phone Number</label>
                      <input
                        type="text"
                        value={pageContentForm.contactPhone}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, contactPhone: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-900 font-bold">Support Email Address</label>
                      <input
                        type="email"
                        value={pageContentForm.contactEmail}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, contactEmail: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-900 font-bold">Default City (Enforced: Mumbai)</label>
                      <input
                        type="text"
                        readOnly
                        value="Mumbai"
                        className="w-full p-3 bg-slate-200 border border-slate-300 rounded-xl font-extrabold text-slate-900 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-900 font-bold">Default State (Enforced: Maharashtra)</label>
                      <input
                        type="text"
                        readOnly
                        value="Maharashtra"
                        className="w-full p-3 bg-slate-200 border border-slate-300 rounded-xl font-extrabold text-slate-900 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-900 font-bold">Corporate Office Address</label>
                    <textarea
                      rows={2}
                      value={pageContentForm.contactAddress}
                      onChange={(e) => setPageContentForm({ ...pageContentForm, contactAddress: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    ></textarea>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" /> Save Page Content Changes Across Entire Website
              </button>
            </form>
          )}

          {/* OTHER TABS */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-base">Users Directory ({users.length})</h3>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
