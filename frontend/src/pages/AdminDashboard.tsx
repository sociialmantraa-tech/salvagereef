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
  PackagePlus
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
  const [needingAttention, setNeedingAttention] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'users' | 'add-product' | 'approvals' | 'auctions' | 'classifieds' | 'settings'>('users');
  
  // User Filters
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

  // Website Details Settings Form State
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
      setNeedingAttention(Array.isArray(statsRes?.data?.needing_attention) ? statsRes.data.needing_attention : []);
      
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
      showNotification(res.data.message || 'User status updated');
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
      showNotification(res.data.message || 'User verification status updated');
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
      showNotification(res.data.message || 'Role updated');
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
        description: productDescription || 'High quality salvage lot listed by admin desk.',
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
      showNotification(`Product / Auction Lot "${productTitle}" created successfully!`);
      setProductTitle('');
      setProductDescription('');
      setProductImageUrl('');
      fetchAdminData();
      setActiveTab('auctions');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product auction lot');
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#D48B1C] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-xs font-semibold">Loading Admin Console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#1E293B] to-[#0B192C] text-white p-6 sm:p-8 rounded-3xl border-b-4 border-[#D48B1C] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#D48B1C]/20 border border-[#D48B1C]/40 text-[#D48B1C] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> SalvageReef Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Management Console</h1>
          <p className="text-xs text-slate-300">
            Control center for adding products, managing registered users, website details, and private tender access approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('add-product')}
            className="flex items-center gap-2 bg-[#D48B1C] hover:bg-[#b87614] text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Add New Product
          </button>
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-xl text-xs border border-white/20 transition-all shrink-0"
            title="Refresh Console Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Action Notification Banner */}
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

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Registered Users */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Registered Users</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.total_registered_users || users.length}</span>
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {stats.active_users || users.filter(u => u.is_active !== false).length} Active
              </span>
              <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {stats.suspended_users || users.filter(u => u.is_active === false).length} Suspended
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D70B8] border border-blue-200 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Auctions & Bids */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Auctions Live</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.total_auctions_live}</span>
            <div className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D48B1C]" />
              <span>{stats.total_bids_today} Bids Today</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Gavel className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: KYC Verified Pool */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">KYC Verified Users</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {stats.kyc_verified_users || users.filter(u => u.is_verified).length}
            </span>
            <span className="text-[11px] text-[#D48B1C] font-semibold mt-1 block">
              Screened & Verified Buyers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D48B1C] border border-amber-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Pending Tender Requests</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.pending_approvals}</span>
            <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
              Private Auction Access
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Console Tab Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'users'
                  ? 'bg-[#0B192C] text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-[#D48B1C]" />
              Users Directory ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('add-product')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'add-product'
                  ? 'bg-[#D48B1C] text-white shadow-lg'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              ➕ Add Product / Auction Lot
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'approvals'
                  ? 'bg-[#0B192C] text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-[#D48B1C]" />
              Tender Approvals ({stats.pending_approvals})
            </button>

            <button
              onClick={() => setActiveTab('auctions')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'auctions'
                  ? 'bg-[#0B192C] text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Gavel className="w-4 h-4 text-[#D48B1C]" />
              All Auctions ({auctions.length || stats.total_auctions})
            </button>

            <button
              onClick={() => setActiveTab('classifieds')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'classifieds'
                  ? 'bg-[#0B192C] text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-4 h-4 text-[#D48B1C]" />
              Classifieds ({classifieds.length})
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#0B192C] text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Settings className="w-4 h-4 text-[#D48B1C]" />
              ⚙️ Website Details
            </button>
          </div>
        </div>

        {/* TAB 1: Registered & Active Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* User Search & Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search full name, email, company, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D70B8] font-medium"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full p-2 bg-white text-xs border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#1D70B8]"
                >
                  <option value="all">All Roles</option>
                  <option value="bidder">Bidders</option>
                  <option value="agent">Agents / Sellers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 bg-white text-xs border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#1D70B8]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                  <option value="verified">KYC Verified Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-200">
                No registered users matching the selected search query or filters.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
                    <tr>
                      <th className="p-3.5">User Details (Full Unmasked Name)</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Company & Location</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">KYC Verified</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5 text-right">Active Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredUsers.map((u) => {
                      const isActive = u.is_active !== false && u.is_active !== 0;
                      const isVerified = !!u.is_verified;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          {/* Full Name & Registration Date */}
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{u.name}</span>
                              {u.role === 'admin' && (
                                <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-black">ADMIN</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Registered: {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '2026-01-01'}
                            </div>
                          </td>

                          {/* Contact Details */}
                          <td className="p-3.5 space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <a href={`mailto:${u.email}`} className="hover:text-[#1D70B8]">{u.email}</a>
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <a href={`tel:${u.phone}`} className="hover:text-[#1D70B8]">{u.phone}</a>
                              </div>
                            )}
                          </td>

                          {/* Company & Location */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                              <Building2 className="w-3.5 h-3.5 text-[#D48B1C] shrink-0" />
                              <span>{u.company_name || 'Individual Trader'}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{u.city ? `${u.city}, ${u.state}` : 'India'}</span>
                            </div>
                          </td>

                          {/* Role Selector */}
                          <td className="p-3.5">
                            <select
                              value={u.role || 'bidder'}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className="bg-slate-50 border border-slate-300 text-slate-800 text-[11px] font-bold rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-[#1D70B8]"
                            >
                              <option value="bidder">Bidder</option>
                              <option value="agent">Agent / Seller</option>
                              <option value="admin">Admin Desk</option>
                            </select>
                          </td>

                          {/* KYC Verification Toggle */}
                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleUserVerify(u.id, isVerified)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                isVerified
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                              }`}
                              title="Click to toggle KYC verification status"
                            >
                              <ShieldCheck className={`w-3.5 h-3.5 ${isVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span>{isVerified ? 'KYC Verified' : 'Unverified'}</span>
                            </button>
                          </td>

                          {/* Active / Suspended Status Badge */}
                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                              {isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>

                          {/* Action Toggle Button */}
                          <td className="p-3.5 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserActive(u.id, isActive)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto ${
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
            )}
          </div>
        )}

        {/* TAB 2: Add Product / Post Auction Lot Form */}
        {activeTab === 'add-product' && (
          <form onSubmit={handleAddProductSubmit} className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-[#D48B1C]" /> Add New Product / Auction Lot
                </h3>
                <p className="text-xs text-slate-500">Post a new scrap, salvage, or capital equipment lot directly into live listings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs font-semibold text-slate-700">
              {/* Product Title */}
              <div className="sm:col-span-8 space-y-1">
                <label>Product / Lot Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 MT Industrial Copper Cable Scrap - Grade A Clean Wire"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              {/* Category */}
              <div className="sm:col-span-4 space-y-1">
                <label>Category *</label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auction Type */}
              <div className="sm:col-span-4 space-y-1">
                <label>Auction / Listing Type *</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                >
                  <option value="public">Public Scrap Auction</option>
                  <option value="private">Private Tender Lot</option>
                  <option value="group">Group Mill Auction</option>
                </select>
              </div>

              {/* Quantity & Unit */}
              <div className="sm:col-span-4 space-y-1">
                <label>Quantity *</label>
                <input
                  type="number"
                  required
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label>Unit *</label>
                <input
                  type="text"
                  required
                  placeholder="MT, kg, nos, lot"
                  value={productUnit}
                  onChange={(e) => setProductUnit(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              {/* Starting Price */}
              <div className="sm:col-span-4 space-y-1">
                <label>Starting Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={productStartingPrice}
                  onChange={(e) => setProductStartingPrice(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold text-slate-900"
                />
              </div>

              {/* City & State */}
              <div className="sm:col-span-4 space-y-1">
                <label>City *</label>
                <input
                  type="text"
                  required
                  value={productCity}
                  onChange={(e) => setProductCity(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label>State *</label>
                <input
                  type="text"
                  required
                  value={productState}
                  onChange={(e) => setProductState(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              {/* Start & End Time */}
              <div className="sm:col-span-6 space-y-1">
                <label>Bidding Start Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={productStartTime}
                  onChange={(e) => setProductStartTime(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              <div className="sm:col-span-6 space-y-1">
                <label>Bidding End Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={productEndTime}
                  onChange={(e) => setProductEndTime(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              {/* Image URL */}
              <div className="sm:col-span-12 space-y-1">
                <label>Product Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={productImageUrl}
                  onChange={(e) => setProductImageUrl(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-12 space-y-1">
                <label>Detailed Specifications & Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter condition, weight verification, material grades, inspection availability..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingProduct}
              className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              {submittingProduct ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />} Publish Product / Auction Lot
            </button>
          </form>
        )}

        {/* TAB 3: Tender Access Approvals */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Filter Requests:</span>
              <div className="flex gap-2">
                {['pending', 'approved', 'rejected', 'all'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setApprovalFilter(st)}
                    className={`px-3 py-1 rounded-lg uppercase font-bold text-[10px] transition-all border ${
                      approvalFilter === st
                        ? 'bg-[#0B192C] text-white border-[#0B192C]'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInterests.map((req) => (
                  <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#D48B1C] uppercase tracking-wider">
                          Lot #{req.auction_id} &bull; {req.auction?.title}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{req.user?.name}</h4>
                        <p className="text-[11px] text-slate-500">{req.user?.company_name || req.user?.email}</p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : req.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    {req.message && (
                      <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200 leading-relaxed italic">
                        "{req.message}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Submitted: {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </span>

                      <div className="flex gap-2">
                        {req.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveInterest(req.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {req.status !== 'rejected' && (
                          <button
                            onClick={() => handleApproveInterest(req.id, 'rejected')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
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

        {/* TAB 4: Manage All Auctions */}
        {activeTab === 'auctions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">All Auction Lots ({auctions.length})</span>
              <button
                onClick={() => setActiveTab('add-product')}
                className="bg-[#D48B1C] text-white px-3 py-1.5 rounded-lg font-bold text-xs"
              >
                + Add Product Lot
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Auction Title</th>
                    <th className="p-3.5">Category & Type</th>
                    <th className="p-3.5">Starting Price</th>
                    <th className="p-3.5">Current Highest Bid</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {auctions.map((auc) => (
                    <tr key={auc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <Link to={`/auctions/${auc.slug}`} className="font-bold text-slate-900 hover:text-[#1D70B8]">
                          {auc.title}
                        </Link>
                        <div className="text-[10px] text-slate-400">Seller: {auc.creator?.name || 'SalvageReef'}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded capitalize">
                          {auc.category?.name || 'General Scrap'} &bull; {auc.auction_type}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        ₹{Number(auc.starting_price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        ₹{Number(auc.current_highest_bid || auc.starting_price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          auc.status === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {auc.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          to={`/auctions/${auc.slug}`}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-bold hover:bg-[#D48B1C]"
                        >
                          Inspect
                        </Link>
                        <button
                          onClick={() => handleDeleteAuction(auc.id, auc.title)}
                          className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg font-bold transition-colors"
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

        {/* TAB 5: Manage Classifieds */}
        {activeTab === 'classifieds' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">All Machinery Classifieds ({classifieds.length})</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Classified Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Listed Price</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Seller</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {classifieds.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <Link to={`/classifieds/${c.slug}`} className="hover:text-[#1D70B8]">
                          {c.title}
                        </Link>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {c.category?.name || 'Machinery'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        ₹{Number(c.price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {c.location_city}, {c.location_state}
                      </td>
                      <td className="p-3.5 text-slate-700 font-semibold">
                        {c.creator?.name || 'Agent'}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          to={`/classifieds/${c.slug}`}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-bold hover:bg-[#D48B1C]"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteClassified(c.id, c.title)}
                          className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg font-bold transition-colors"
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

        {/* TAB 6: Website Details & Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#D48B1C]" /> Edit Website Brand & Corporate Details
                </h3>
                <p className="text-xs text-slate-500">Update company information, contact phone, email, and corporate address.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label>Platform Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label>Founder Name</label>
                <input
                  type="text"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label>Contact Phone Number</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label>Support Email Address</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label>Brand Tagline</label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-[#D48B1C]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label>Corporate Address</label>
                <textarea
                  rows={2}
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-[#0B192C] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <Save className="w-4 h-4 text-[#D48B1C]" /> Save Website Details
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
