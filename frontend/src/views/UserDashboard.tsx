import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Gavel, 
  Trophy, 
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
  MapPin,
  ShieldCheck,
  Lock,
  Key,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Edit,
  Mail,
  Flame,
  Check,
  Calendar,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  CheckCheck,
  CreditCard,
  Upload
} from 'lucide-react';
import { Classified } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { processUploadFile } from '../utils/imageCompressor';
import { subscribeRealtimeEvents } from '../services/realtimeSync';
import { getUserEffectiveDocuments, getUserPendingDocuments } from '../utils/kycDocuments';
import WhatsAppIcon from '../components/WhatsAppIcon';

const FALLBACK_AUCTION_IMG = 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80';

export const resolveAuctionImg = (path?: string): string => {
  if (!path || typeof path !== 'string') return FALLBACK_AUCTION_IMG;
  const trimmed = path.trim();
  if (trimmed.startsWith('data:image/') && trimmed.length <= 350) return FALLBACK_AUCTION_IMG;
  if (trimmed.toLowerCase().endsWith('.pdf') || trimmed.includes('.pdf?')) return FALLBACK_AUCTION_IMG;
  return trimmed;
};

interface DashboardStats {
  total_bids: number;
  active_bids: number;
  winning_bids: number;
  outbid_bids: number;
  pending_bids: number;
  auctions_won: number;
  tender_requests_count: number;
  scrap_requests_count: number;
  listings_count: number;
  watchlist_count?: number;
}

interface BidRecord {
  id: number;
  auction_id: number;
  amount: number;
  bid_amount?: number;
  status: string;
  my_status: 'winning' | 'outbid' | 'pending_approval' | 'won' | 'lost' | 'rejected' | string;
  created_at: string;
  auction?: {
    id: number;
    title: string;
    slug: string;
    status: string;
    starting_price: number;
    current_highest_bid: number;
    bid_increment: number;
    end_time: string;
    location_city: string;
    location_state: string;
    category_name?: string;
    primary_image_url?: string;
  };
}

interface WonAuction {
  id: number;
  title: string;
  slug: string;
  winning_amount: number;
  emd_amount: number;
  end_time: string;
  location_city: string;
  location_state: string;
  primary_image_url?: string;
  pdf_url?: string;
  awarded_rank?: string;
}

interface TenderRequest {
  id: number;
  auction_id: number;
  auction_title?: string;
  auction_slug?: string;
  starting_price?: number;
  emd_amount?: number;
  end_time?: string;
  auction_status?: string;
  message?: string;
  status: string;
  created_at: string;
}

interface ScrapRequest {
  id: number;
  title: string;
  category_name?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  location_city?: string;
  location_state?: string;
  status: string;
  created_at: string;
}

export default function UserDashboard() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'bids' | 'won' | 'tenders' | 'scrap' | 'profile'>('overview');
  const [bidFilter, setBidFilter] = useState<'all' | 'winning' | 'outbid' | 'pending' | 'won'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    recent_bids: BidRecord[];
    won_auctions: WonAuction[];
    tender_requests: TenderRequest[];
    scrap_requests: ScrapRequest[];
    my_listings: Classified[];
  }>({
    stats: {
      total_bids: 0,
      active_bids: 0,
      winning_bids: 0,
      outbid_bids: 0,
      pending_bids: 0,
      auctions_won: 0,
      tender_requests_count: 0,
      scrap_requests_count: 0,
      listings_count: 0,
    },
    recent_bids: [],
    won_auctions: [],
    tender_requests: [],
    scrap_requests: [],
    my_listings: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals
  const [showResubmitModal, setShowResubmitModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  // Resubmit KYC State
  const [submittingKyc, setSubmittingKyc] = useState<boolean>(false);
  const [kycSuccess, setKycSuccess] = useState<string | null>(null);
  const [kycError, setKycError] = useState<string | null>(null);
  const [resubmitForm, setResubmitForm] = useState({
    name: user?.name || '',
    company_name: user?.company_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    registered_address: (user as any)?.registered_address || '',
    pan_number: (user as any)?.pan_number || '',
    gst_number: (user as any)?.gst_number || '',
    cheque_file: '',
    pan_file: '',
    gst_file: '',
  });

  // Edit Profile State
  const [submittingProfile, setSubmittingProfile] = useState<boolean>(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    company_name: user?.company_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    registered_address: (user as any)?.registered_address || '',
    pincode: (user as any)?.pincode || '',
  });

  // Password State
  const [submittingPassword, setSubmittingPassword] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Selected replacement files metadata for live preview
  const [selectedFilesMeta, setSelectedFilesMeta] = useState<Record<string, { name: string; size: string; preview: string }>>({});

  const openKycModal = () => {
    setResubmitForm({
      name: user?.name || '',
      company_name: user?.company_name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      state: user?.state || '',
      registered_address: (user as any)?.registered_address || (user as any)?.address || '',
      pan_number: (user as any)?.pan_number || '',
      gst_number: (user as any)?.gst_number || '',
      cheque_file: '',
      pan_file: '',
      gst_file: '',
    });
    setSelectedFilesMeta({});
    setKycError(null);
    setKycSuccess(null);
    setShowResubmitModal(true);
  };

  const clearSelectedFile = (field: 'cheque_file' | 'pan_file' | 'gst_file') => {
    setResubmitForm((prev) => ({ ...prev, [field]: '' }));
    setSelectedFilesMeta((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const openProfileModal = () => {
    setProfileForm({
      name: user?.name || '',
      company_name: user?.company_name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      state: user?.state || '',
      registered_address: (user as any)?.registered_address || (user as any)?.address || '',
      pincode: (user as any)?.pincode || '',
    });
    setProfileError(null);
    setProfileSuccess(null);
    setShowProfileModal(true);
  };

  const openPasswordModal = () => {
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordError(null);
    setPasswordSuccess(null);
    setShowPasswordModal(true);
  };

  const fetchDashboard = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get('/user/dashboard');
      if (res.data) {
        setDashboardData({
          stats: res.data.stats || {
            total_bids: 0,
            active_bids: 0,
            winning_bids: 0,
            outbid_bids: 0,
            pending_bids: 0,
            auctions_won: 0,
            tender_requests_count: 0,
            scrap_requests_count: 0,
            listings_count: 0,
          },
          recent_bids: res.data.recent_bids || [],
          won_auctions: res.data.won_auctions || [],
          tender_requests: res.data.tender_requests || [],
          scrap_requests: res.data.scrap_requests || [],
          my_listings: res.data.my_listings || [],
        });

        if (res.data.user) {
          updateUser(res.data.user);
        }
      }
    } catch (err) {
      console.error('Error fetching buyer dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const unsubscribe = subscribeRealtimeEvents((event) => {
      if (
        event.type === 'bid_status_updated' ||
        event.type === 'bid_submitted' ||
        event.type === 'auction_updated' ||
        event.type === 'auction_winner_awarded'
      ) {
        fetchDashboard(true);
      }
    });

    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 20000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cheque_file' | 'pan_file' | 'gst_file') => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const res = await processUploadFile(file);
        setResubmitForm((prev) => ({ ...prev, [field]: res.dataUrl }));
        setSelectedFilesMeta((prev) => ({
          ...prev,
          [field]: {
            name: file.name,
            size: `${(file.size / 1024).toFixed(0)} KB`,
            preview: res.dataUrl,
          }
        }));
      } catch (err) {
        console.error('Error processing upload:', err);
      }
    }
  };

  const handleResubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingKyc(true);
    setKycError(null);
    setKycSuccess(null);

    try {
      const res = await api.post('/user/resubmit-kyc', resubmitForm);
      if (res.data.success) {
        setKycSuccess('Document update request submitted successfully! Your request has been sent to the Admin Desk for verification.');
        if (res.data.user) {
          updateUser(res.data.user);
        }
        setTimeout(() => {
          setShowResubmitModal(false);
          setKycSuccess(null);
          setSelectedFilesMeta({});
          fetchDashboard(true);
        }, 2200);
      } else {
        setKycError(res.data.message || 'Failed to submit KYC.');
      }
    } catch (err: any) {
      setKycError(err.response?.data?.message || 'Error connecting to server. Please try again.');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await api.put('/user/profile', profileForm);
      if (res.data.success) {
        setProfileSuccess('Profile updated successfully!');
        if (res.data.user) {
          updateUser(res.data.user);
        }
        setTimeout(() => {
          setShowProfileModal(false);
          setProfileSuccess(null);
          fetchDashboard(true);
        }, 1500);
      } else {
        setProfileError(res.data.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await api.put('/user/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      if (res.data.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 1500);
      } else {
        setPasswordError(res.data.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Error updating password.');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const isRejected = user?.is_verified === -1 || user?.is_verified === '-1' || (user as any)?.is_verified === -1;
  const isPending = !isRejected && (user?.is_verified === 0 || user?.is_verified === '0' || !user?.is_verified);
  const isVerified = !isRejected && !isPending && (user?.is_verified === 1 || user?.is_verified === '1' || user?.is_verified === true);

  const { stats, recent_bids, won_auctions, tender_requests, scrap_requests, my_listings } = dashboardData;

  // Filtered Bids
  const filteredBids = recent_bids.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (b.auction?.title || '').toLowerCase().includes(q);
      const matchCity = (b.auction?.location_city || '').toLowerCase().includes(q);
      const matchCategory = (b.auction?.category_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCity && !matchCategory) return false;
    }
    if (bidFilter === 'all') return true;
    if (bidFilter === 'winning') return b.my_status === 'winning';
    if (bidFilter === 'outbid') return b.my_status === 'outbid';
    if (bidFilter === 'pending') return b.my_status === 'pending_approval' || b.status === 'pending';
    if (bidFilter === 'won') return b.my_status === 'won';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4 text-slate-800">
        <div className="w-14 h-14 border-4 border-[#D48B1C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600 tracking-wide">Loading your Buyer Command Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 relative overflow-hidden">
      {/* ── TOP HERO HEADER & BUYER IDENTITY BANNER (CLEAN WHITE EXECUTIVE CARD) ── */}
      <div className="bg-white border-b border-slate-200 text-slate-900 shadow-xs relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 sm:gap-6 min-w-0 max-w-full">
            {/* User Profile Identity */}
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 max-w-full flex-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#D48B1C] to-amber-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-2 border-amber-300/60 shrink-0">
                {user?.company_name ? user.company_name.charAt(0).toUpperCase() : (user?.name?.charAt(0).toUpperCase() || 'B')}
              </div>
              <div className="space-y-1.5 min-w-0 max-w-full flex-1">
                {/* Badges / Status Tags (Wrap to next line if needed so everything is visible) */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-full">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#D48B1C] bg-amber-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-[#D48B1C] shrink-0" /> B2B Commercial Buyer
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 sm:px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    ID: {(user as any)?.login_id || `SR-BIDDER-${user?.id}`}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    Live Connected
                  </span>
                </div>

                {/* Company / User Title */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 break-words max-w-full py-0.5">
                  {user?.company_name || user?.name}
                </h1>

                {/* All Contact Details (Wrap cleanly to next line on mobile) */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 flex-wrap font-medium pt-0.5 max-w-full">
                  <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                    <UserIcon className="w-3 h-3 text-[#D48B1C] shrink-0" /> {user?.name}
                  </span>
                  {user?.email && (
                    <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 break-all sm:break-normal">
                      <Mail className="w-3 h-3 text-blue-600 shrink-0" /> {user?.email}
                    </span>
                  )}
                  {user?.phone && (
                    <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" /> {user.phone}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-amber-800 font-semibold">
                    <MapPin className="w-3 h-3 text-[#D48B1C] shrink-0" /> {user?.city || 'Mumbai'}, {user?.state || 'Maharashtra'}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Badge & Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {isVerified ? (
                <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-emerald-900">KYC Verified Enterprise</span>
                    <span className="text-[11px] text-emerald-700 block">Unlimited B2B bidding enabled</span>
                  </div>
                </div>
              ) : isPending ? (
                <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-xs">
                  <Clock className="w-6 h-6 text-amber-600 shrink-0 animate-pulse" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-amber-900">KYC Under Review</span>
                    <span className="text-[11px] text-amber-700 block">Admin approval in progress</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 shadow-xs">
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-rose-900">Verification Required</span>
                    <span className="text-[11px] text-rose-700 block">Action required to unlock bidding</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Link
                  to="/auctions"
                  className="flex-1 sm:flex-none px-4 py-3 bg-[#D48B1C] hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Gavel className="w-4 h-4 text-slate-950" /> Browse Live Auctions
                </Link>
                <button
                  onClick={() => fetchDashboard(true)}
                  disabled={refreshing}
                  className="p-3 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition-colors shadow-xs cursor-pointer"
                  title="Refresh Dashboard Data"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#D48B1C]' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6 relative z-10">
        {/* ── CONDITIONAL KYC ALERTS (CLEAN MODERN PALETTE) ── */}
        {isRejected && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 sm:p-6 text-rose-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-rose-950 flex items-center gap-2">
                  Account Verification Declined by Admin
                  <span className="px-2 py-0.5 bg-rose-200/60 text-rose-800 font-extrabold text-[10px] rounded-full uppercase border border-rose-300">
                    Action Required
                  </span>
                </h3>
                <p className="text-xs text-rose-800/90 mt-1 leading-relaxed max-w-2xl">
                  Your submitted vendor registration details or KYC documents were declined by the Admin Desk. Please review your company name, GST/PAN numbers, and re-upload clear photos of your Cancelled Cheque and documents to reactivate your bidding privileges.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={openKycModal}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Re-Upload KYC Documents
              </button>
              <a
                href="https://wa.me/917304481166?text=Hello%20SalvageReef%20Desk%2C%20my%20KYC%20verification%20was%20declined%20and%20I%20would%20like%20assistance%20to%20get%20approved."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Support
              </a>
            </div>
          </div>
        )}

        {isPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 text-amber-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-sm text-amber-950 flex items-center gap-2">
                  KYC Verification Pending Admin Review
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-extrabold text-[10px] rounded-full uppercase border border-amber-300">
                    Under Review
                  </span>
                </h3>
                <p className="text-xs text-amber-800/90 mt-1 leading-relaxed max-w-2xl">
                  Your submitted profile and KYC documents are currently in the Admin verification queue. Once approved, full bidding privileges across all public and private auction lots will unlock automatically.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={openKycModal}
                className="px-4 py-2.5 bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4 text-amber-600" /> View Submitted Documents
              </button>
              <a
                href="https://wa.me/917304481166?text=Hello%20SalvageReef%20Desk%2C%20I%20am%20following%20up%20on%20my%20KYC%20verification."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" /> Fast-Track on WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* ── 6 KEY EXECUTIVE KPI METRIC CARDS (CLEAN WHITE CARDS WITH VIBRANT COLOR ACCENTS) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Active Bids (Blue) */}
          <div
            onClick={() => { setActiveTab('bids'); setBidFilter('all'); }}
            className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase font-bold text-slate-500 group-hover:text-blue-600 transition-colors">Active Bids</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Gavel className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block font-mono group-hover:text-blue-600 transition-colors">
              {stats.active_bids}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Ongoing lot bids</span>
          </div>

          {/* 2. Winning Bids (Emerald) */}
          <div
            onClick={() => { setActiveTab('bids'); setBidFilter('winning'); }}
            className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">Winning (H1)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block font-mono transition-colors">
              {stats.winning_bids}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Highest Bidder
            </span>
          </div>

          {/* 3. Outbid Bids (Rose) */}
          <div
            onClick={() => { setActiveTab('bids'); setBidFilter('outbid'); }}
            className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-rose-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase font-bold text-slate-500 group-hover:text-rose-600 transition-colors">Outbid</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 block font-mono transition-colors">
              {stats.outbid_bids}
            </span>
            <span className="text-[10px] text-rose-500 font-medium">Click to counter-bid</span>
          </div>

          {/* 4. Pending Verification (Amber) */}
          <div
            onClick={() => { setActiveTab('bids'); setBidFilter('pending'); }}
            className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase font-bold text-slate-500 group-hover:text-amber-600 transition-colors">Pending</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 block font-mono transition-colors">
              {stats.pending_bids}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">1-time approval</span>
          </div>

          {/* 5. Won Auctions (Gold/Amber) */}
          <div
            onClick={() => setActiveTab('won')}
            className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-yellow-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase font-bold text-slate-500 group-hover:text-[#D48B1C] transition-colors">Won Lots</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-50 text-[#D48B1C] flex items-center justify-center border border-yellow-200 group-hover:scale-105 transition-transform">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#D48B1C] block font-mono transition-colors">
              {stats.auctions_won}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Commercial dossiers</span>
          </div>

          {/* 6. Tender Clearances & Scrap (Teal) */}
          <div
            onClick={() => setActiveTab('tenders')}
            className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase font-bold text-slate-500 group-hover:text-teal-600 transition-colors">Tenders</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-teal-700 block font-mono transition-colors">
              {stats.tender_requests_count}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Private clearances</span>
          </div>
        </div>

        {/* ── MOBILE SELECTION DROPDOWN (sm:hidden) ── */}
        <div className="sm:hidden bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 px-1">
            Dashboard View Selection
          </label>
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-[#D48B1C] cursor-pointer"
            >
              <option value="overview">🏢 Overview (Executive Summary)</option>
              <option value="bids">🔨 My Bids ({recent_bids.length} Lots)</option>
              <option value="won">🏆 Won Auctions ({won_auctions.length} Lots)</option>
              <option value="tenders">🔑 Tender Requests ({tender_requests.length})</option>
              <option value="scrap">🏷️ Sell Scrap & Listings ({scrap_requests.length + my_listings.length})</option>
              <option value="profile">🛡️ KYC & Profile (Verification)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#D48B1C]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ── RESPONSIVE GRID FORM TABS (2 Cols on Mobile, 3 Cols on Tablet, 6 Cols on Desktop) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#D48B1C] text-slate-950 font-black shadow-sm ring-1 ring-[#D48B1C]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50/60'
            }`}
          >
            <Building className="w-4 h-4 shrink-0 text-[#D48B1C]" />
            <span className="truncate">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('bids')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'bids'
                ? 'bg-[#D48B1C] text-slate-950 font-black shadow-sm ring-1 ring-[#D48B1C]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50/60'
            }`}
          >
            <Gavel className="w-4 h-4 shrink-0 text-blue-600" />
            <span className="truncate">My Bids</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
              activeTab === 'bids' ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {recent_bids.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('won')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'won'
                ? 'bg-[#D48B1C] text-slate-950 font-black shadow-sm ring-1 ring-[#D48B1C]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50/60'
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0 text-yellow-600" />
            <span className="truncate">Won Lots</span>
            {won_auctions.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-emerald-500 text-white font-black animate-pulse shrink-0">
                {won_auctions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tenders')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tenders'
                ? 'bg-[#D48B1C] text-slate-950 font-black shadow-sm ring-1 ring-[#D48B1C]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50/60'
            }`}
          >
            <Key className="w-4 h-4 shrink-0 text-teal-600" />
            <span className="truncate">Tenders</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
              activeTab === 'tenders' ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {tender_requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('scrap')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'scrap'
                ? 'bg-[#D48B1C] text-slate-950 font-black shadow-sm ring-1 ring-[#D48B1C]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50/60'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="truncate">Sell Scrap</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
              activeTab === 'scrap' ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {scrap_requests.length + my_listings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#D48B1C] text-slate-950 font-black shadow-sm ring-1 ring-[#D48B1C]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#D48B1C]" />
            <span className="truncate">KYC & Profile</span>
          </button>
        </div>

        {/* ── TAB 1: EXECUTIVE OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Live Bidding Activity */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="flex justify-between items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D48B1C] flex items-center justify-center border border-amber-200 shrink-0">
                        <Gavel className="w-4 h-4" />
                      </div>
                      <span className="truncate">Live Bidding Activity</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate sm:text-clip">Real-time status of your active lots and ongoing bids</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bids')}
                    className="text-xs font-bold text-[#D48B1C] hover:text-amber-600 inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                    style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    <span className="whitespace-nowrap" style={{ whiteSpace: 'nowrap' }}>
                      View All ({recent_bids.length})
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>

                {recent_bids.length === 0 ? (
                  <div className="py-14 text-center space-y-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                      <Gavel className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">No bids placed yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Explore our live scrap lots, inspect technical specifications, and start placing bids to grow your salvage portfolio.
                    </p>
                    <Link
                      to="/auctions"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D48B1C] hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-sm transition-all"
                    >
                      <Gavel className="w-4 h-4 text-slate-950" /> Browse Live Auctions
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {recent_bids.slice(0, 5).map((bid) => {
                      const isWinning = bid.my_status === 'winning';
                      const isOutbid = bid.my_status === 'outbid';
                      const isPendingApp = bid.my_status === 'pending_approval' || bid.status === 'pending';
                      const isWon = bid.my_status === 'won';

                      return (
                        <div
                          key={bid.id}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-white hover:bg-slate-50/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group shadow-xs"
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Lot Thumbnail */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center shadow-inner">
                              <img
                                src={resolveAuctionImg(bid.auction?.primary_image_url)}
                                alt={bid.auction?.title || "Lot Thumbnail"}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = FALLBACK_AUCTION_IMG;
                                }}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>

                            <div>
                              <Link
                                to={`/auctions/${bid.auction?.slug || bid.auction_id}`}
                                className="font-extrabold text-slate-900 text-sm group-hover:text-[#D48B1C] transition-colors line-clamp-1"
                              >
                                {bid.auction?.title || `Auction Lot #${bid.auction_id}`}
                              </Link>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                                <span className="font-mono text-slate-600">
                                  {formatDateTime(bid.created_at)}
                                </span>
                                {bid.auction?.location_city && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="text-amber-700 font-semibold">{bid.auction.location_city}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Bid</span>
                              <span className="font-black text-slate-900 text-base font-mono">
                                ₹{Number(bid.amount || bid.bid_amount).toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div>
                              {isWinning ? (
                                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 border border-emerald-200 shadow-xs">
                                  <Flame className="w-4 h-4 text-emerald-600" /> Leading (H1)
                                </span>
                              ) : isOutbid ? (
                                <Link
                                  to={`/auctions/${bid.auction?.slug || bid.auction_id}`}
                                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                                  title="Raise your bid now"
                                >
                                  <AlertCircle className="w-4 h-4" /> Outbid &rarr;
                                </Link>
                              ) : isPendingApp ? (
                                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-1.5 border border-purple-200">
                                  <Clock className="w-4 h-4 text-purple-600 animate-pulse" /> Pending
                                </span>
                              ) : isWon ? (
                                <span className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                                  <Trophy className="w-4 h-4 text-slate-950" /> Won Lot
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl uppercase border border-slate-200">
                                  Ended
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Col: Quick Profile & Support Desk */}
              <div className="space-y-6">
                {/* Account Credentials Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#D48B1C]" /> Vendor Credentials
                    </h3>
                    <button
                      onClick={openProfileModal}
                      className="text-xs font-bold text-[#D48B1C] hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Company Name:</span>
                      <span className="font-bold text-slate-900 text-right">{user?.company_name || 'Individual'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">GSTIN:</span>
                      <span className="font-mono font-bold text-amber-700">
                        {(user as any)?.gst_number || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">PAN Number:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {(user as any)?.pan_number || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Account Status:</span>
                      <span className={`font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${
                        isVerified 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : isPending 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isVerified ? 'KYC Verified' : isPending ? 'Pending Review' : 'Declined'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2.5">
                    <button
                      onClick={openKycModal}
                      className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <UploadCloud className="w-4 h-4 text-[#D48B1C]" /> Manage KYC Documents
                    </button>
                    <button
                      onClick={openPasswordModal}
                      className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-500" /> Change Password
                    </button>
                  </div>
                </div>

                {/* 24/7 Operations Desk Help */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shadow-xs">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">Operations Desk Helpline</h4>
                      <p className="text-[11px] text-slate-500">Direct assistance for bidding & tenders</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Need instant yard inspection booking, H1 allotment status, or document verification support?
                  </p>
                  <div className="pt-1 flex items-center gap-2.5">
                    <a
                      href="https://wa.me/917304481166?text=Hello%20SalvageReef%20Desk%2C%20I%20need%20assistance%20with%20my%20bids."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs rounded-xl shadow-sm text-center flex items-center justify-center gap-1.5 transition-all"
                    >
                      <WhatsAppIcon className="w-4 h-4" /> WhatsApp Support
                    </a>
                    <a
                      href="tel:+917304481166"
                      className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                    >
                      Call Desk
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Won Auctions Showcase (if any) */}
            {won_auctions.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D48B1C] border border-amber-200 flex items-center justify-center shadow-xs font-black shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base sm:text-lg">You Have Won {won_auctions.length} Auction Lot(s)!</h3>
                      <p className="text-xs text-slate-500">Congratulations! Follow commercial payment and lifting terms below.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('won')}
                    className="px-5 py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    View Allotment Dossier &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: MY BIDS & LIVE PARTICIPATION ── */}
        {activeTab === 'bids' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-[#D48B1C]" /> My Bidding Portfolio ({recent_bids.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Track current highest bids, winning positions, and raise bids instantly.</p>
              </div>

              {/* Search Bar + Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by lot title or city..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-400 transition-colors"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-bold gap-1 border border-slate-200 overflow-x-auto w-full sm:w-auto">
                  <button
                    onClick={() => setBidFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      bidFilter === 'all' ? 'bg-[#D48B1C] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    All ({recent_bids.length})
                  </button>
                  <button
                    onClick={() => setBidFilter('winning')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      bidFilter === 'winning' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Winning ({stats.winning_bids})
                  </button>
                  <button
                    onClick={() => setBidFilter('outbid')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      bidFilter === 'outbid' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Outbid ({stats.outbid_bids})
                  </button>
                  <button
                    onClick={() => setBidFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      bidFilter === 'pending' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Pending ({stats.pending_bids})
                  </button>
                  <button
                    onClick={() => setBidFilter('won')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      bidFilter === 'won' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Won ({stats.auctions_won})
                  </button>
                </div>
              </div>
            </div>

            {filteredBids.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                  <Gavel className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">No bids found for this filter</h4>
                <p className="text-xs text-slate-500">Explore live scrap auctions and start bidding!</p>
                <Link
                  to="/auctions"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Explore Live Auctions
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50/70">
                      <th className="py-3.5 px-3">Auction Lot & Location</th>
                      <th className="py-3.5 px-3 text-right">My Bid</th>
                      <th className="py-3.5 px-3 text-right">Current Highest</th>
                      <th className="py-3.5 px-3 text-center">Your Status</th>
                      <th className="py-3.5 px-3 text-right">Bid Placed At</th>
                      <th className="py-3.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredBids.map((b) => {
                      const isWinning = b.my_status === 'winning';
                      const isOutbid = b.my_status === 'outbid';
                      const isPendingApp = b.my_status === 'pending_approval' || b.status === 'pending';
                      const isWon = b.my_status === 'won';
                      const currentHighest = b.auction?.current_highest_bid || b.auction?.starting_price || 0;

                      return (
                        <tr key={b.id} className="hover:bg-amber-50/30 transition-colors group">
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                                <img
                                  src={resolveAuctionImg(b.auction?.primary_image_url)}
                                  alt="Lot"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_AUCTION_IMG;
                                  }}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              </div>
                              <div>
                                <Link
                                  to={`/auctions/${b.auction?.slug || b.auction_id}`}
                                  className="font-bold text-slate-900 hover:text-[#D48B1C] transition-colors line-clamp-1 text-xs"
                                >
                                  {b.auction?.title || `Auction Lot #${b.auction_id}`}
                                </Link>
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  {b.auction?.location_city || 'India'} &bull; {b.auction?.category_name || 'General Scrap'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-3 text-right font-black text-amber-600 font-mono text-xs">
                            ₹{Number(b.amount || b.bid_amount).toLocaleString('en-IN')}
                          </td>

                          <td className="py-4 px-3 text-right font-black text-slate-900 font-mono text-xs">
                            ₹{Number(currentHighest).toLocaleString('en-IN')}
                          </td>

                          <td className="py-4 px-3 text-center">
                            {isWinning ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-black rounded-lg uppercase border border-emerald-200 inline-flex items-center gap-1 shadow-xs">
                                <Flame className="w-3.5 h-3.5 text-emerald-600" /> Leading (H1)
                              </span>
                            ) : isOutbid ? (
                              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[11px] font-black rounded-lg uppercase border border-rose-200 inline-flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Outbid
                              </span>
                            ) : isPendingApp ? (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg uppercase border border-amber-200 inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending
                              </span>
                            ) : isWon ? (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[11px] font-black rounded-lg uppercase border border-amber-300 inline-flex items-center gap-1 shadow-xs">
                                <Trophy className="w-3.5 h-3.5 text-amber-600" /> Won
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg uppercase border border-slate-200">
                                Ended
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-3 text-right font-mono text-slate-500 text-[11px]">
                            {formatDateTime(b.created_at)}
                          </td>

                          <td className="py-4 px-3 text-center">
                            {isOutbid ? (
                              <Link
                                to={`/auctions/${b.auction?.slug || b.auction_id}`}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1 transition-all active:scale-95"
                              >
                                Raise Bid &rarr;
                              </Link>
                            ) : (
                              <Link
                                to={`/auctions/${b.auction?.slug || b.auction_id}`}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1"
                              >
                                View Lot
                              </Link>
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

        {/* ── TAB 3: WON AUCTIONS & COMMERCIAL DOSSIER ── */}
        {activeTab === 'won' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#D48B1C]" /> Won Auctions & Commercial Allotment Dossiers ({won_auctions.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official award certificates, payment settlement schedules, and lifting protocols for your awarded salvage lots.
              </p>
            </div>

            {won_auctions.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D48B1C] flex items-center justify-center mx-auto border border-amber-200">
                  <Trophy className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">No won auctions yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Keep placing bids on live auction lots to win high-grade industrial scrap and idle machinery!
                </p>
                <Link
                  to="/auctions"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Explore Live Auctions
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {won_auctions.map((won) => (
                  <div
                    key={won.id}
                    className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-xs space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-[#D48B1C] text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider shadow">
                      Awarded {won.awarded_rank || 'H1'}
                    </div>

                    <div className="flex items-start gap-4 pt-2">
                      <div className="w-18 h-18 rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center shadow-inner">
                        <img
                          src={resolveAuctionImg(won.primary_image_url)}
                          alt="Lot"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_AUCTION_IMG;
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base line-clamp-2">{won.title}</h4>
                        <span className="text-[11px] text-slate-500 font-medium block mt-1">
                          {won.location_city}, {won.location_state} &bull; Concluded: {formatDateTime(won.end_time)}
                        </span>
                      </div>
                    </div>

                    {/* Commercial Terms Summary */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Final Winning Bid</span>
                        <span className="font-black text-emerald-600 text-lg font-mono">
                          ₹{Number(won.winning_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Retained EMD</span>
                        <span className="font-black text-amber-600 text-lg font-mono">
                          ₹{Number(won.emd_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Commercial Lifting & Payment Terms Protocol */}
                    <div className="space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-600">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Standard 3-Day Payment:</strong> Balance remittance within 72 hrs.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                        <span><strong>Standard 10-Day Lifting:</strong> Material extraction within 10 days of release.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <a
                        href={`https://wa.me/917304481166?text=Hello%20SalvageReef%20Desk%2C%20I%20am%20the%20confirmed%20H1%20winner%20for%20Lot%3A%20${encodeURIComponent(won.title)}%20(Login%20ID%3A%20${(user as any)?.login_id || user?.id}).%20Please%20issue%20my%20allotment%20letter%20and%20bank%20details.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <WhatsAppIcon className="w-4 h-4" /> Request Allotment Letter
                      </a>
                      <Link
                        to={`/auctions/${won.slug || won.id}`}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                      >
                        Lot Dossier
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: PRIVATE TENDER CLEARANCES ── */}
        {activeTab === 'tenders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Key className="w-5 h-5 text-teal-600" /> Private Auction & Closed Tender Authorizations ({tender_requests.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status of your access clearances to bid in closed corporate tenders and private enterprise salvage sales.
              </p>
            </div>

            {tender_requests.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                  <Key className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">No tender requests submitted</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Private enterprise tenders require pre-clearance from our operations desk. Discover private tenders in the auction directory.
                </p>
                <Link
                  to="/auctions"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Browse Private Tenders
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {tender_requests.map((tender) => (
                  <div
                    key={tender.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Tender Clearance Request #{tender.id}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm mt-0.5">
                        {tender.auction_title || `Auction Lot #${tender.auction_id}`}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Requested on {formatDateTime(tender.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase border ${
                        tender.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : tender.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {tender.status === 'approved' ? 'Access Granted' : tender.status === 'rejected' ? 'Declined' : 'Under Review'}
                      </span>

                      {tender.status === 'approved' && tender.auction_slug && (
                        <Link
                          to={`/auctions/${tender.auction_slug}`}
                          className="px-4 py-2 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          Enter Tender Room &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: SELL SCRAP & LISTINGS ── */}
        {activeTab === 'scrap' && (
          <div className="space-y-6">
            {/* Scrap Pickup Requests */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#D48B1C]" /> Doorstep Scrap Pickup Bookings ({scrap_requests.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Direct pickup requests submitted for corporate yard clearance.</p>
                </div>
                <Link
                  to="/post-listing"
                  className="px-4 py-2 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  + Book Scrap Pickup
                </Link>
              </div>

              {scrap_requests.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D48B1C] border border-amber-200 flex items-center justify-center mx-auto">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">No scrap collection requests yet</h4>
                  <p className="text-xs text-slate-500">Have commercial scrap or plant machinery to liquidate?</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scrap_requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{req.title}</h4>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {req.quantity} {req.unit || 'LOT'} &bull; {req.location_city || 'India'} &bull; Booked on {formatDateTime(req.created_at)}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-lg uppercase border border-amber-200">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Classified Listings */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#D48B1C]" /> My Classified Equipment Listings ({my_listings.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Classified industrial machinery ads published on SalvageReef.</p>
                </div>
                <Link
                  to="/post-listing"
                  className="px-4 py-2 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  + Post Classified Ad
                </Link>
              </div>

              {my_listings.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                    <Building className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">No classified items listed</h4>
                  <p className="text-xs text-slate-500">List idle machinery and industrial lots for direct buyer inquiries.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {my_listings.map((item) => (
                    <div key={item.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h4>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-black text-amber-600">₹{Number(item.price).toLocaleString('en-IN')}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full uppercase border border-emerald-200">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 6: KYC VERIFICATION & CORPORATE PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* KYC Documents Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#D48B1C]" /> Verified Corporate KYC Documents
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official tax and banking records required under Indian compliance laws for salvage auction participation.
                  </p>
                </div>
                <button
                  onClick={openKycModal}
                  className="px-4 py-2 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Update / Re-Upload Documents
                </button>
              </div>

              {/* Pending Update Notification Banner */}
              {Boolean((user as any)?.pending_pan_file || (user as any)?.pending_gst_file || (user as any)?.pending_cheque_file) && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <strong className="text-slate-900 text-xs block">KYC Document Update Request Sent to Admin Desk</strong>
                      <span className="text-[11px] text-amber-800">Your updated documents were submitted for verification. They will take effect officially once accepted by an Administrator.</span>
                    </div>
                  </div>
                  <button
                    onClick={openKycModal}
                    className="px-3.5 py-1.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    View / Manage Update
                  </button>
                </div>
              )}

              {(() => {
                const effectiveDocs = getUserEffectiveDocuments(user);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* 1. PAN Card */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">Company PAN Card</span>
                          {(user as any)?.pending_pan_file && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                              Update Pending Admin Approval
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-white text-slate-800 rounded-md border border-slate-200 font-bold">
                          {(user as any)?.pan_number || 'ABCDE1234F'}
                        </span>
                      </div>

                      <div
                        onClick={() => setPreviewDocUrl(effectiveDocs.panDoc)}
                        className="h-32 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#D48B1C] transition-colors relative group"
                      >
                        <img
                          src={effectiveDocs.panDoc}
                          alt="PAN Card"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                          <Eye className="w-4 h-4" /> Click to Preview
                        </div>
                      </div>
                    </div>

                    {/* 2. GST Certificate */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">GSTIN Certificate</span>
                          {(user as any)?.pending_gst_file && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                              Update Pending Admin Approval
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-white text-slate-800 rounded-md border border-slate-200 font-bold">
                          {(user as any)?.gst_number || '27ABCDE1234F1Z5'}
                        </span>
                      </div>

                      <div
                        onClick={() => setPreviewDocUrl(effectiveDocs.gstDoc)}
                        className="h-32 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#D48B1C] transition-colors relative group"
                      >
                        <img
                          src={effectiveDocs.gstDoc}
                          alt="GST Certificate"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                          <Eye className="w-4 h-4" /> Click to Preview
                        </div>
                      </div>
                    </div>

                    {/* 3. Cancelled Bank Cheque */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">Cancelled Cheque</span>
                          {(user as any)?.pending_cheque_file && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                              Update Pending Admin Approval
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                          EMD Refund Account
                        </span>
                      </div>

                      <div
                        onClick={() => setPreviewDocUrl(effectiveDocs.chequeDoc)}
                        className="h-32 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#D48B1C] transition-colors relative group"
                      >
                        <img
                          src={effectiveDocs.chequeDoc}
                          alt="Cancelled Cheque"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                          <Eye className="w-4 h-4" /> Click to Preview
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Profile Information & Password Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Details Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#D48B1C]" /> Registered Company Details
                  </h4>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
                  {profileSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" /> {profileSuccess}
                    </div>
                  )}
                  {profileError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {profileError}
                    </div>
                  )}

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Company / Enterprise Name</label>
                    <input
                      type="text"
                      value={profileForm.company_name}
                      onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Authorized SPOC Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">State</label>
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Registered Business Address</label>
                    <textarea
                      value={profileForm.registered_address}
                      onChange={(e) => setProfileForm({ ...profileForm, registered_address: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingProfile}
                    className="w-full py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submittingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#D48B1C]" /> Security & Password
                  </h4>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" /> {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-mono transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={showCurrentPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">New Password (Min. 6 chars)</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-mono transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={showNewPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-mono transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPassword}
                    className="w-full py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submittingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: RESUBMIT / UPDATE KYC DOCUMENTS (WITH REAL ON-FILE PREVIEW & ADMIN APPROVAL FLOW) ── */}
      {showResubmitModal && (() => {
        const effectiveDocs = getUserEffectiveDocuments(user);
        const pendingDocs = getUserPendingDocuments(user);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 text-slate-900 space-y-5 shadow-2xl relative my-8">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-base sm:text-lg flex items-center gap-2 text-slate-900">
                    <UploadCloud className="w-5 h-5 text-[#D48B1C]" /> Update / Re-Upload KYC Documents
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Preview your current verified documents or submit replacement files to the Admin Desk for review.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResubmitModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Workflow Notice Banner */}
              {pendingDocs.hasPending ? (
                <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-2xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" /> Pending Admin Review in Progress
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    You have submitted updated documents that are currently in the Admin verification queue. Your existing verified documents remain active until an Administrator reviews and approves the new documents.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs space-y-1">
                  <div className="font-bold text-blue-950 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D48B1C]" /> Two-Step Verification Policy
                  </div>
                  <p className="text-blue-800 text-[11px] leading-relaxed">
                    To maintain strict B2B compliance, updated documents are securely submitted to the Admin Desk. Once approved by Admin, your updated documents will replace the current files on record.
                  </p>
                </div>
              )}

              {kycSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> {kycSuccess}
                </div>
              )}
              {kycError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {kycError}
                </div>
              )}

              <form onSubmit={handleResubmitKyc} className="space-y-4 text-xs">
                {/* Identification Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Company PAN Number</label>
                    <input
                      type="text"
                      value={resubmitForm.pan_number}
                      onChange={(e) => setResubmitForm({ ...resubmitForm, pan_number: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-[#D48B1C] font-mono transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={resubmitForm.gst_number}
                      onChange={(e) => setResubmitForm({ ...resubmitForm, gst_number: e.target.value.toUpperCase() })}
                      placeholder="27ABCDE1234F1Z5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-[#D48B1C] font-mono transition-colors"
                    />
                  </div>
                </div>

                {/* 3 Document Slots: Cancelled Cheque, PAN Card, GST Certificate */}
                <div className="space-y-3.5 pt-1">
                  {/* Slot 1: Cancelled Bank Cheque */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#D48B1C]" />
                        <span className="font-bold text-slate-900 text-xs">1. Cancelled Cheque (EMD Refund Account)</span>
                      </div>
                      {(user as any)?.pending_cheque_file ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-300">
                          Pending Admin Review
                        </span>
                      ) : (user as any)?.cheque_file ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                          Active on File
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded border border-slate-300">
                          Not Provided
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      {/* Left: Current Active Document Preview */}
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={effectiveDocs.chequeDoc}
                            alt="Current Cheque"
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-slate-900 block truncate">Current Document</span>
                            <span className="text-[10px] text-slate-500 block truncate">On file with SalvageReef</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewDocUrl(effectiveDocs.chequeDoc)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[11px] font-bold border border-slate-200 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                          title="View Current Cheque"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>

                      {/* Right: Upload Replacement */}
                      <div>
                        {selectedFilesMeta['cheque_file'] ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold text-emerald-800 block truncate">{selectedFilesMeta['cheque_file'].name}</span>
                                <span className="text-[10px] text-emerald-600 block">{selectedFilesMeta['cheque_file'].size} • Ready for Admin Review</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => clearSelectedFile('cheque_file')}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Remove replacement"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 hover:text-slate-900 font-bold rounded-xl border border-slate-300 border-dashed cursor-pointer transition-all text-[11px]">
                            <Upload className="w-3.5 h-3.5 text-[#D48B1C]" />
                            <span>Choose Replacement Cheque</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload(e, 'cheque_file')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slot 2: PAN Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#D48B1C]" />
                        <span className="font-bold text-slate-900 text-xs">2. Company / Enterprise PAN Card</span>
                      </div>
                      {(user as any)?.pending_pan_file ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-300">
                          Pending Admin Review
                        </span>
                      ) : (user as any)?.pan_file ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                          Active on File
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded border border-slate-300">
                          Not Provided
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      {/* Left: Current Active Document Preview */}
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={effectiveDocs.panDoc}
                            alt="Current PAN"
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-slate-900 block truncate">Current Document</span>
                            <span className="text-[10px] text-slate-500 block truncate">On file with SalvageReef</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewDocUrl(effectiveDocs.panDoc)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[11px] font-bold border border-slate-200 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                          title="View Current PAN"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>

                      {/* Right: Upload Replacement */}
                      <div>
                        {selectedFilesMeta['pan_file'] ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold text-emerald-800 block truncate">{selectedFilesMeta['pan_file'].name}</span>
                                <span className="text-[10px] text-emerald-600 block">{selectedFilesMeta['pan_file'].size} • Ready for Admin Review</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => clearSelectedFile('pan_file')}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Remove replacement"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 hover:text-slate-900 font-bold rounded-xl border border-slate-300 border-dashed cursor-pointer transition-all text-[11px]">
                            <Upload className="w-3.5 h-3.5 text-[#D48B1C]" />
                            <span>Choose Replacement PAN Card</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload(e, 'pan_file')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slot 3: GST Registration Certificate */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#D48B1C]" />
                        <span className="font-bold text-slate-900 text-xs">3. GSTIN Registration Certificate</span>
                      </div>
                      {(user as any)?.pending_gst_file ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-300">
                          Pending Admin Review
                        </span>
                      ) : (user as any)?.gst_file ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                          Active on File
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded border border-slate-300">
                          Not Provided
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      {/* Left: Current Active Document Preview */}
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={effectiveDocs.gstDoc}
                            alt="Current GST"
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-slate-900 block truncate">Current Document</span>
                            <span className="text-[10px] text-slate-500 block truncate">On file with SalvageReef</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewDocUrl(effectiveDocs.gstDoc)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[11px] font-bold border border-slate-200 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                          title="View Current GST"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>

                      {/* Right: Upload Replacement */}
                      <div>
                        {selectedFilesMeta['gst_file'] ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold text-emerald-800 block truncate">{selectedFilesMeta['gst_file'].name}</span>
                                <span className="text-[10px] text-emerald-600 block">{selectedFilesMeta['gst_file'].size} • Ready for Admin Review</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => clearSelectedFile('gst_file')}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Remove replacement"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 hover:text-slate-900 font-bold rounded-xl border border-slate-300 border-dashed cursor-pointer transition-all text-[11px]">
                            <Upload className="w-3.5 h-3.5 text-[#D48B1C]" />
                            <span>Choose Replacement GST Certificate</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload(e, 'gst_file')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex justify-end items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResubmitModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingKyc}
                    className="px-5 py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {submittingKyc ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    <span>Submit Request to Admin</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL: DOCUMENT LIGHTBOX PREVIEW ── */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full max-h-[90vh] bg-slate-900 rounded-3xl p-4 border border-slate-700 flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="font-bold text-xs text-white">KYC Document Lightbox</span>
              <button onClick={() => setPreviewDocUrl(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {previewDocUrl.endsWith('.pdf') || previewDocUrl.includes('.pdf?') ? (
                <iframe src={previewDocUrl} className="w-full h-[65vh] rounded-xl border border-slate-700" title="KYC PDF Document" />
              ) : (
                <img src={previewDocUrl} alt="KYC Document Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT REGISTERED COMPANY PROFILE ── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 space-y-4 shadow-2xl relative my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base flex items-center gap-2 text-slate-900">
                <Building className="w-5 h-5 text-[#D48B1C]" /> Edit Registered Company Details
              </h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Company / Enterprise Name</label>
                <input
                  type="text"
                  value={profileForm.company_name}
                  onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Authorized SPOC Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Contact Mobile Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">State</label>
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Registered Business Address</label>
                <textarea
                  value={profileForm.registered_address}
                  onChange={(e) => setProfileForm({ ...profileForm, registered_address: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-medium transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="px-5 py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  {submittingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHANGE ACCOUNT PASSWORD ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl relative my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base flex items-center gap-2 text-slate-900">
                <Lock className="w-5 h-5 text-[#D48B1C]" /> Change Account Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    required
                    placeholder="Enter current password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">New Password (Min. 6 chars)</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    required
                    placeholder="Enter new strong password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    required
                    placeholder="Re-type new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-slate-900 focus:bg-white focus:outline-none focus:border-[#D48B1C] font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="px-5 py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  {submittingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
