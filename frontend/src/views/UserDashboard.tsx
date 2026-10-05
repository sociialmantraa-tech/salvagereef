import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Gavel, 
  Trophy, 
  Eye, 
  Tag, 
  ArrowUpRight, 
  Clock, 
  XCircle, 
  RotateCcw, 
  UploadCloud, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Building,
  Phone,
  User as UserIcon,
  MapPin
} from 'lucide-react';
import { Classified } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { processUploadFile } from '../utils/imageCompressor';

export default function UserDashboard() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dashboardData, setDashboardData] = useState<{
    stats: { active_bids: number; auctions_won: number; watchlist_count: number };
    recent_bids: any[];
    my_listings: Classified[];
  }>({
    stats: { active_bids: 0, auctions_won: 0, watchlist_count: 0 },
    recent_bids: [],
    my_listings: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Resubmit Verification & KYC Modal State
  const [showResubmitModal, setShowResubmitModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resubmitSuccess, setResubmitSuccess] = useState<string | null>(null);
  const [resubmitError, setResubmitError] = useState<string | null>(null);

  const [resubmitForm, setResubmitForm] = useState({
    name: user?.name || '',
    company_name: user?.company_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    cheque_file: '',
    pan_file: '',
    gst_file: '',
  });

  useEffect(() => {
    if (user) {
      setResubmitForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        company_name: user.company_name || prev.company_name,
        phone: user.phone || prev.phone,
        city: user.city || prev.city,
        state: user.state || prev.state,
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/user/dashboard');
        setDashboardData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'cheque_file' | 'pan_file' | 'gst_file') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processUploadFile(file);
      setResubmitForm((prev) => ({ ...prev, [fieldName]: dataUrl }));
    } catch (err) {
      console.error(`Failed to process ${fieldName}:`, err);
    }
  };

  const handleResubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResubmitError(null);
    setResubmitSuccess(null);

    try {
      const res = await api.post('/user/resubmit-kyc', resubmitForm);
      if (res.data?.success) {
        updateUser({
          name: resubmitForm.name,
          company_name: resubmitForm.company_name,
          phone: resubmitForm.phone,
          city: resubmitForm.city,
          state: resubmitForm.state,
          is_verified: 0,
          is_active: true,
        });
        setResubmitSuccess('Verification details resubmitted successfully! Your account status is now Pending Admin Review.');
        setTimeout(() => {
          setShowResubmitModal(false);
          setResubmitSuccess(null);
        }, 2200);
      }
    } catch (err: any) {
      setResubmitError(err.response?.data?.message || 'Failed to resubmit verification details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#D48B1C] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const { stats, recent_bids, my_listings } = dashboardData;

  const isRejected = user?.is_verified === -1 || user?.is_verified === '-1' || (user as any)?.is_verified === -1;
  const isPending = !isRejected && (user?.is_verified === 0 || user?.is_verified === '0' || !user?.is_verified);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Verification Status Banners */}
      {isRejected ? (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-red-900 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                Account Verification Rejected by Admin
                <span className="px-2.5 py-0.5 bg-red-200 text-red-950 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-red-300">
                  Application Declined
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                Your vendor registration application was reviewed and declined by the SalvageReef Admin Team. You can review your business details or re-upload updated KYC documents (PAN, GST, Bank Cheque) below and click <strong>Register Again / Resubmit Verification</strong> to submit your account for admin re-evaluation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setShowResubmitModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow transition-all flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Register Again / Resubmit Verification
            </button>
            <a
              href="https://wa.me/917304481166?text=Hello%20SalvageReef%2C%20my%20registration%20application%20was%20declined%20and%20I%20would%20like%20to%20inquire%20about%20re-verification."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
            >
              Chat with Admin Desk
            </a>
          </div>
        </div>
      ) : isPending ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                Account Verification Pending Admin Approval
                <span className="px-2.5 py-0.5 bg-amber-200/80 text-amber-900 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                  Under Review
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                Thank you for registering on SalvageReef! Your submitted profile details and KYC documents (PAN, GST, Bank Cheque) are currently being reviewed by our Admin Team. You will receive bidding and listing privileges as soon as your account is approved.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/917304481166?text=Hello%20SalvageReef%2C%20I%20registered%20my%20vendor%20account%20and%20would%20like%20to%20inquire%20about%20admin%20verification."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5"
          >
            Chat with Admin Desk
          </a>
        </div>
      ) : null}

      {/* Header Banner */}
      <div className="bg-[#0B192C] text-white p-6 sm:p-8 rounded-3xl border-b-4 border-[#D48B1C] shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[#D48B1C] text-xs font-bold uppercase tracking-wider block mb-1">
            {user?.role === 'agent' ? 'SalvageReef Verified Seller Dashboard' : 'SalvageReef Buyer Dashboard'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <span>{user?.company_name || (user?.role === 'agent' ? 'Scrap Vendor' : 'Independent Buyer')}</span>
            <span>&bull;</span>
            <span className="text-[#D48B1C] font-semibold">{user?.city}, {user?.state}</span>
          </p>
        </div>

        {/* Action Button & Tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/sell-scrap"
            className="px-4 py-2 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" /> + Sell Your Scrap
          </Link>

          {/* Top Tab Bar */}
          <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'overview' ? 'bg-[#D48B1C] text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'bids' ? 'bg-[#D48B1C] text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              My Bids
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'listings' ? 'bg-[#D48B1C] text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              My Products ({my_listings.length})
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Interactive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <button
          onClick={() => setActiveTab('bids')}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between text-left hover:border-[#D48B1C] hover:shadow-md transition-all group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#D48B1C] transition-colors block">
              Active Bids
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.active_bids}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D48B1C] border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Gavel className="w-6 h-6" />
          </div>
        </button>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Auctions Won
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.auctions_won}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <button
          onClick={() => setActiveTab('listings')}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between text-left hover:border-[#D48B1C] hover:shadow-md transition-all group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#D48B1C] transition-colors block">
              My Scrap Listings
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{my_listings.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Tag className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* "My Bids" Section */}
      {(activeTab === 'overview' || activeTab === 'bids') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[#D48B1C]" /> Recent Bid History
            </h3>
            <Link to="/auctions" className="text-xs font-bold text-[#D48B1C] hover:underline flex items-center gap-1">
              Browse Live Auctions <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recent_bids.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-slate-500 text-xs font-medium">No active or past bids placed yet.</p>
              <Link
                to="/auctions"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D48B1C] hover:bg-[#b87614] text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                <Gavel className="w-3.5 h-3.5" /> Explore Live Auctions
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-2">Auction Lot</th>
                    <th className="py-3 px-2 text-right">My Bid Amount</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recent_bids.map((bid: any, idx: number) => (
                    <tr key={bid.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-900">
                        {bid.auction?.title ? (
                          <Link to={`/auctions/${bid.auction.slug}`} className="hover:text-[#D48B1C] transition-colors">
                            {bid.auction.title}
                          </Link>
                        ) : (
                          `Auction Lot #${bid.auction_id}`
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-black text-slate-900">
                        ₹{Number(bid.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {bid.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-400 text-[11px]">
                        {formatDateTime(bid.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* "My Products / Classified Listings" Section */}
      {(activeTab === 'overview' || activeTab === 'listings') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#D48B1C]" /> My Scrap Listings
            </h3>
            <Link to="/sell-scrap" className="text-xs font-bold text-[#D48B1C] hover:underline flex items-center gap-1">
              + Post New Listing
            </Link>
          </div>

          {my_listings.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-slate-500 text-xs font-medium">You have not posted any scrap listings yet.</p>
              <Link
                to="/sell-scrap"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D48B1C] hover:bg-[#b87614] text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                <Tag className="w-3.5 h-3.5" /> + Sell Your Scrap
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {my_listings.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-[#D48B1C]">₹{Number(item.price).toLocaleString('en-IN')}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resubmit Verification & KYC Modal */}
      {showResubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#0B192C] text-white p-6 relative shrink-0">
              <button
                onClick={() => setShowResubmitModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-600 text-white rounded">
                    Re-Application Portal
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    Register Again / Resubmit Verification Details
                  </h3>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleResubmitVerification} className="p-6 space-y-4 overflow-y-auto">
              {resubmitError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{resubmitError}</span>
                </div>
              )}

              {resubmitSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resubmitSuccess}</span>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                Update your contact details or re-upload clear copies of your KYC documents (PAN, GST Certificate, Cancelled Cheque) below to resubmit your profile to the Admin Desk for review.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-[#D48B1C]" /> Applicant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={resubmitForm.name}
                    onChange={(e) => setResubmitForm({ ...resubmitForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#D48B1C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#D48B1C]" /> Company / Firm Name
                  </label>
                  <input
                    type="text"
                    value={resubmitForm.company_name}
                    onChange={(e) => setResubmitForm({ ...resubmitForm, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#D48B1C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#D48B1C]" /> Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={resubmitForm.phone}
                    onChange={(e) => setResubmitForm({ ...resubmitForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#D48B1C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D48B1C]" /> City & State
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="City"
                      value={resubmitForm.city}
                      onChange={(e) => setResubmitForm({ ...resubmitForm, city: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#D48B1C]"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={resubmitForm.state}
                      onChange={(e) => setResubmitForm({ ...resubmitForm, state: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#D48B1C]"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-[#D48B1C]" /> Update KYC Verification Documents
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Cheque File */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 block text-[11px]">Bank Cheque / Passbook</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'cheque_file')}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#D48B1C] file:text-white hover:file:bg-[#b87614]"
                    />
                    {resubmitForm.cheque_file && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Attached
                      </span>
                    )}
                  </div>

                  {/* PAN File */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 block text-[11px]">PAN Card Proof</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'pan_file')}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#D48B1C] file:text-white hover:file:bg-[#b87614]"
                    />
                    {resubmitForm.pan_file && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Attached
                      </span>
                    )}
                  </div>

                  {/* GST File */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 block text-[11px]">GST Certificate</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'gst_file')}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#D48B1C] file:text-white hover:file:bg-[#b87614]"
                    />
                    {resubmitForm.gst_file && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResubmitModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" /> Submit Application For Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
