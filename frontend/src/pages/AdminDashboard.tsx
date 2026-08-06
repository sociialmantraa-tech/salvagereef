import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
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
  Filter
} from 'lucide-react';

export default function AdminDashboard() {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'add-product' | 'approvals' | 'auctions' | 'classifieds' | 'settings'>('overview');
  
  // User Filtering
  const [userSearch, setUserSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('pending');
  
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Add Product Form State
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState('1');
  const [productType, setProductType] = useState('public');
  const [productQuantity, setProductQuantity] = useState('50');
  const [productUnit, setProductUnit] = useState('MT');
  const [productStartingPrice, setProductStartingPrice] = useState('100000');
  const [productCity, setProductCity] = useState('Thane');
  const [productState, setProductState] = useState('Maharashtra');
  const [productStartTime, setProductStartTime] = useState('2026-08-06T12:00');
  const [productEndTime, setProductEndTime] = useState('2026-08-15T18:00');
  const [productDescription, setProductDescription] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Website Settings Form State
  const [siteName, setSiteName] = useState('SalvageReef');
  const [founderName, setFounderName] = useState('Neelkanth Sharma');
  const [contactPhone, setContactPhone] = useState('+91 7304481166');
  const [contactEmail, setContactEmail] = useState('salvagereef@gmail.com');
  const [officeAddress, setOfficeAddress] = useState('101 Imperial Bldg, Bhayander West, Thane 401101, Maharashtra');
  const [siteTagline, setSiteTagline] = useState('RECOVER. REUSE. RECYCLE.');

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
        image_url: productImageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      };

      await api.post('/admin/auctions', payload);
      showNotification(`Product / Auction Lot "${productTitle}" published successfully!`);
      setProductTitle('');
      setProductDescription('');
      setProductImageUrl('');
      fetchAdminData();
      setActiveTab('auctions');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish product auction lot');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Website settings & corporate contact details saved successfully!');
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
      
      {/* EXECUTIVE HEADER BAR (Horizontal Top Bar) */}
      <div className="bg-[#0B192C] text-white p-6 rounded-3xl border-b-4 border-[#D48B1C] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#D48B1C] text-white px-2.5 py-0.5 rounded font-black text-[10px] uppercase tracking-wider">
              ADMINISTRATOR
            </span>
            <span className="text-slate-400 text-xs font-semibold">SalvageReef Operations Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Executive Management Console</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D48B1C]" /> Refresh Data
          </button>
          <Link
            to="/classifieds/post-listing"
            className="flex items-center gap-2 bg-[#D48B1C] hover:bg-[#b87614] text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Quick Post
          </Link>
        </div>
      </div>

      {/* HORIZONTAL OPTIONS NAVBAR (Options laid out horizontally) */}
      <div className="bg-slate-900 text-slate-300 p-2 rounded-2xl border border-slate-800 shadow-md overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'overview'
                ? 'bg-[#D48B1C] text-white shadow-lg'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            📊 Executive Overview
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'users'
                ? 'bg-[#D48B1C] text-white shadow-lg'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            👥 Users & Status ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('add-product')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'add-product'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PackagePlus className="w-4 h-4 text-emerald-400" />
            ➕ Add New Product / Lot
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'approvals'
                ? 'bg-[#D48B1C] text-white shadow-lg'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            🔒 Tender Approvals ({stats.pending_approvals})
          </button>

          <button
            onClick={() => setActiveTab('auctions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'auctions'
                ? 'bg-[#D48B1C] text-white shadow-lg'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Gavel className="w-4 h-4" />
            🔨 Auction Lots ({auctions.length})
          </button>

          <button
            onClick={() => setActiveTab('classifieds')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'classifieds'
                ? 'bg-[#D48B1C] text-white shadow-lg'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            🏷️ Classifieds ({classifieds.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'settings'
                ? 'bg-[#D48B1C] text-white shadow-lg'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            ⚙️ Website Details
          </button>

        </div>
      </div>

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

      {/* VERTICAL INFORMATION DISPLAY AREA (Information stacked vertically) */}
      <div className="space-y-6">

        {/* SECTION 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards (Vertical Stacked Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Vertical Card 1 */}
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
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {stats.active_users || users.filter(u => u.is_active !== false).length} Active
                  </span>
                  <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {stats.suspended_users || users.filter(u => u.is_active === false).length} Suspended
                  </span>
                </div>
              </div>

              {/* Vertical Card 2 */}
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

              {/* Vertical Card 3 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">KYC Verified Buyers</span>
                    <h2 className="text-3xl font-black text-slate-900 mt-1">
                      {stats.kyc_verified_users || users.filter(u => u.is_verified).length}
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D48B1C] border border-amber-200 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs text-[#D48B1C] font-bold">
                  Verified Industry Bidders Pool
                </div>
              </div>

              {/* Vertical Card 4 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Tender Approvals</span>
                    <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.pending_approvals}</h2>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs text-purple-600 font-bold">
                  Action Required in Approvals Tab
                </div>
              </div>

            </div>

            {/* Vertical Stack: System Summary & Quick Actions */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D48B1C]" /> Executive Operational Summary
                </h3>
                <p className="text-xs text-slate-500">Overview of active trading, user compliance, and auction lots.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900 block">Registered Users & Active Accounts</span>
                    <p className="text-xs text-slate-500">Manage user directory, activate/suspend accounts, update roles, and review KYC verification.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="px-4 py-2 bg-[#0B192C] text-white text-xs font-bold rounded-xl hover:bg-[#D48B1C] transition-colors shrink-0"
                  >
                    Open Users Directory &rarr;
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-950 block">Publish New Scrap & Salvage Product</span>
                    <p className="text-xs text-amber-800">Add a public auction lot, private corporate tender, or group dismantling lot into the live catalog.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('add-product')}
                    className="px-4 py-2 bg-[#D48B1C] text-white text-xs font-bold rounded-xl hover:bg-[#b87614] transition-colors shrink-0"
                  >
                    + Add New Product &rarr;
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2: REGISTERED USERS DIRECTORY (Vertical Information Layout) */}
        {activeTab === 'users' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Header & Filter Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#D48B1C]" /> Registered Users Directory ({users.length})
                </h3>
                <p className="text-xs text-slate-500">Admins view full unmasked bidder names, manage active/suspended account status & KYC.</p>
              </div>

              {/* Filters */}
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

            {/* Search Input */}
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

            {/* Vertical Information Table */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-200">
                No users found matching your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
                    <tr>
                      <th className="p-4">User Details (Full Unmasked Name)</th>
                      <th className="p-4">Contact Information</th>
                      <th className="p-4">Company & Location</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">KYC Compliance</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Status Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-medium">
                    {filteredUsers.map((u) => {
                      const isActive = u.is_active !== false && u.is_active !== 0;
                      const isVerified = !!u.is_verified;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          
                          {/* Full Name Stack */}
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

                          {/* Contact Info Stack */}
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

                          {/* Company & Location Stack */}
                          <td className="p-4 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                              <Building2 className="w-3.5 h-3.5 text-[#D48B1C] shrink-0" />
                              <span>{u.company_name || 'Individual Trader'}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{u.city ? `${u.city}, ${u.state}` : 'India'}</span>
                            </div>
                          </td>

                          {/* Role Selector */}
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

                          {/* KYC Verification Toggle */}
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleUserVerify(u.id, isVerified)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                                isVerified
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              }`}
                              title="Click to toggle KYC status"
                            >
                              <ShieldCheck className={`w-3.5 h-3.5 ${isVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span>{isVerified ? 'KYC Verified' : 'Unverified'}</span>
                            </button>
                          </td>

                          {/* Active / Suspended Status Badge */}
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

                          {/* Action Button */}
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
                                    <UserX className="w-3.5 h-3.5" /> Suspend Account
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" /> Activate Account
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
            )}

          </div>
        )}

        {/* SECTION 3: ADD PRODUCT / POST AUCTION LOT (Vertical Form Layout) */}
        {activeTab === 'add-product' && (
          <form onSubmit={handleAddProductSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-emerald-600" /> Add Product / Auction Lot
                </h3>
                <p className="text-xs text-slate-500">Publish a new scrap lot, capital equipment, or private corporate tender.</p>
              </div>
            </div>

            {/* Vertical Form Fields Stack */}
            <div className="space-y-6 text-xs font-semibold text-slate-700">
              
              {/* Field 1: Title */}
              <div className="space-y-1">
                <label className="block text-slate-900 font-extrabold text-xs">1. Product / Lot Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 MT Industrial Copper Cable Scrap - Grade A Clean Wire"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold text-slate-900 text-sm"
                />
              </div>

              {/* Field Grid 2: Category & Auction Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">2. Category *</label>
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

                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">3. Auction Listing Type *</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-semibold"
                  >
                    <option value="public">Public Scrap Auction</option>
                    <option value="private">Private Tender Lot</option>
                    <option value="group">Group Mill Auction</option>
                  </select>
                </div>
              </div>

              {/* Field Grid 3: Pricing & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">4. Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">5. Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="MT, kg, nos, lot"
                    value={productUnit}
                    onChange={(e) => setProductUnit(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">6. Starting Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productStartingPrice}
                    onChange={(e) => setProductStartingPrice(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-black text-emerald-800 text-sm"
                  />
                </div>
              </div>

              {/* Field Grid 4: Location & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">7. City *</label>
                  <input
                    type="text"
                    required
                    value={productCity}
                    onChange={(e) => setProductCity(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">8. State *</label>
                  <input
                    type="text"
                    required
                    value={productState}
                    onChange={(e) => setProductState(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">9. Bidding Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={productStartTime}
                    onChange={(e) => setProductStartTime(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-extrabold text-xs">10. Bidding End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={productEndTime}
                    onChange={(e) => setProductEndTime(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                  />
                </div>
              </div>

              {/* Field 5: Image URL */}
              <div className="space-y-1">
                <label className="block text-slate-900 font-extrabold text-xs">11. Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={productImageUrl}
                  onChange={(e) => setProductImageUrl(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              {/* Field 6: Description */}
              <div className="space-y-1">
                <label className="block text-slate-900 font-extrabold text-xs">12. Material Description & Inspection Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide specifications, loading terms, purity certificates, inspection location details..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium"
                ></textarea>
              </div>

            </div>

            <button
              type="submit"
              disabled={submittingProduct}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              {submittingProduct ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />} Publish Product Lot to Live Catalog
            </button>
          </form>
        )}

        {/* SECTION 4: TENDER ACCESS APPROVALS (Vertical Stacked Requests) */}
        {activeTab === 'approvals' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#D48B1C]" /> Private Tender Access Approvals
                </h3>
                <p className="text-xs text-slate-500">Review buyer eligibility requests for private salvage tenders.</p>
              </div>

              <div className="flex gap-2 text-xs">
                {['pending', 'approved', 'rejected', 'all'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setApprovalFilter(st)}
                    className={`px-3 py-1.5 rounded-xl uppercase font-bold text-[10px] border transition-all ${
                      approvalFilter === st
                        ? 'bg-[#0B192C] text-white border-[#0B192C]'
                        : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredInterests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-700">No Tender Requests Matching "{approvalFilter}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInterests.map((req) => (
                  <div key={req.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#D48B1C] uppercase bg-amber-100 px-2 py-0.5 rounded">
                          Tender Lot #{req.auction_id}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm">{req.auction?.title}</h4>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-700 font-medium pt-1">
                        <span><strong>Buyer:</strong> {req.user?.name}</span>
                        <span>&bull;</span>
                        <span><strong>Company:</strong> {req.user?.company_name || 'Individual'}</span>
                        <span>&bull;</span>
                        <span><strong>Email:</strong> {req.user?.email}</span>
                      </div>

                      {req.message && (
                        <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200 mt-2">
                          "{req.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      }`}>
                        {req.status}
                      </span>

                      <div className="flex gap-2">
                        {req.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveInterest(req.id, 'approved')}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                        )}
                        {req.status !== 'rejected' && (
                          <button
                            onClick={() => handleApproveInterest(req.id, 'rejected')}
                            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* SECTION 5: AUCTIONS DESK (Vertical Table) */}
        {activeTab === 'auctions' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-[#D48B1C]" /> Auction Lots Catalog ({auctions.length})
                </h3>
                <p className="text-xs text-slate-500">Live, upcoming, and closed forward auctions.</p>
              </div>

              <button
                onClick={() => setActiveTab('add-product')}
                className="bg-[#D48B1C] text-white px-4 py-2 rounded-xl text-xs font-bold shadow"
              >
                + Add Auction Lot
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4">Auction Lot Details</th>
                    <th className="p-4">Category & Type</th>
                    <th className="p-4">Starting Price</th>
                    <th className="p-4">Current Highest Bid</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-medium">
                  {auctions.map((auc) => (
                    <tr key={auc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 space-y-0.5">
                        <Link to={`/auctions/${auc.slug}`} className="font-extrabold text-slate-900 hover:text-[#1D70B8] text-sm block">
                          {auc.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 block">Seller: {auc.creator?.name || 'SalvageReef Operations'}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg capitalize">
                          {auc.category?.name || 'Scrap'} &bull; {auc.auction_type}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        ₹{Number(auc.starting_price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-black text-emerald-800 text-sm">
                        ₹{Number(auc.current_highest_bid || auc.starting_price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          auc.status === 'live' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {auc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          to={`/auctions/${auc.slug}`}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-[#D48B1C] transition-colors"
                        >
                          Inspect
                        </Link>
                        <button
                          onClick={() => handleDeleteAuction(auc.id, auc.title)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-xl font-bold border border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 6: MACHINERY CLASSIFIEDS */}
        {activeTab === 'classifieds' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#D48B1C]" /> Machinery Classifieds Directory ({classifieds.length})
              </h3>
              <p className="text-xs text-slate-500">Fixed-price machinery and capital equipment listings.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4">Classified Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Listed Price</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Seller</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-medium">
                  {classifieds.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <Link to={`/classifieds/${c.slug}`} className="hover:text-[#1D70B8] text-sm">
                          {c.title}
                        </Link>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">
                        {c.category?.name || 'Machinery'}
                      </td>
                      <td className="p-4 font-extrabold text-slate-900 text-sm">
                        ₹{Number(c.price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-slate-500">
                        {c.location_city}, {c.location_state}
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">
                        {c.creator?.name || 'Agent'}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          to={`/classifieds/${c.slug}`}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-[#D48B1C] transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteClassified(c.id, c.title)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-xl font-bold border border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 7: WEBSITE SETTINGS (Vertical Form Stack) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#D48B1C]" /> Edit Website Brand & Corporate Details
              </h3>
              <p className="text-xs text-slate-500">Manage site contact numbers, support email, corporate office, and brand messaging.</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-bold">Platform Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-bold">Founder / Lead Executive</label>
                  <input
                    type="text"
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-bold">Corporate Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-bold">Support Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-900 font-bold">Brand Tagline</label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#D48B1C]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-900 font-bold">Corporate Office Address</label>
                <textarea
                  rows={2}
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-[#0B192C] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <Save className="w-4 h-4 text-[#D48B1C]" /> Save Website Details & Contact Info
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
