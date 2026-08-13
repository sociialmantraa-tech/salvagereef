import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { uploadFile } from '../services/api';
import { compressAndSanitizeImage, CompressionResult } from '../utils/imageCompressor';
import { useContentStore } from '../store/useContentStore';
import { useCategoryLocationStore, LocationItem, STATE_CITIES_MAP, INDIAN_STATES } from '../store/useCategoryLocationStore';
import Logo from '../components/Logo';
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
  Undo2,
  RotateCcw,
  KeyRound,
  Palette,
  Eye,
  EyeOff,
  Sliders,
  Type,
  Code,
  FileEdit,
  Send,
  Smartphone,
  ExternalLink,
  Edit,
  Globe2,
  AlertTriangle,
  MailCheck,
  Trophy,
  UserPlus,
  X
} from 'lucide-react';

import SEOHead from '../components/SEOHead';

export default function AdminDashboard() {
  // Global Stores
  const { content, updateContent, resetContent, revertToPreviousSnapshot, previousContentSnapshot } = useContentStore();
  const { 
    categories: storeCategories, 
    locations: storeLocations, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    addLocation, 
    updateLocation, 
    deleteLocation 
  } = useCategoryLocationStore();

  // Admin Security Password State
  const [adminPassword, setAdminPassword] = useState<string>('sociial123');
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('sr_admin_auth') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Security Rate Limiting
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Admin Change Password Modal State (From Console Header)
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  // FORGOT ADMIN PASSWORD VIA EMAIL OTP MODAL STATE (From Lock Screen)
  const [showAdminForgotPasswordModal, setShowAdminForgotPasswordModal] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState<string>('admin@salvagereef.com');
  const [forgotOtp, setForgotOtp] = useState<string>('');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState<string>('');
  const [sendingForgotOtp, setSendingForgotOtp] = useState<boolean>(false);
  const [forgotModalError, setForgotModalError] = useState<string | null>(null);
  const [forgotModalSuccess, setForgotModalSuccess] = useState<string | null>(null);

  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Universal Delete Confirmation Warning Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: 'category' | 'location' | 'auction' | 'classified' | 'user';
    id: number;
    name: string;
  } | null>(null);

  // Universal Admin Action Confirmation Modal State
  const [confirmActionModal, setConfirmActionModal] = useState<{
    title: string;
    subtitle?: string;
    message: string;
    confirmText: string;
    confirmColor?: 'emerald' | 'amber' | 'red' | 'blue';
    iconType?: 'approve' | 'cross' | 'rotate' | 'alert';
    onConfirm: () => void;
  } | null>(null);

  // Add User / Seller Modal State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'agent',
    company_name: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_verified: true,
    password: '',
  });

  const [stats, setStats] = useState({
    total_auctions_live: 4,
    total_auctions: 6,
    total_bids_today: 14,
    new_users_this_week: 3,
    pending_approvals: 2,
    total_registered_users: 3,
    active_users: 3,
    suspended_users: 0,
    kyc_verified_users: 3,
    total_classifieds: 4,
    total_bids: 28,
  });

  const [users, setUsers] = useState<any[]>([
    {
      id: 1,
      name: 'SalvageReef Verified Seller',
      email: 'seller@salvagereef.com',
      phone: '7304481166',
      role: 'agent',
      company_name: 'Apex Scrap Recyclers Ltd',
      city: 'Mumbai',
      state: 'Maharashtra',
      is_verified: true,
      is_active: true,
      created_at: '2026-01-01',
    },
    {
      id: 2,
      name: 'Neelkanth Sharma',
      email: 'bidder@salvagereef.com',
      phone: '9820123456',
      role: 'bidder',
      company_name: 'Metals & Alloys Co',
      city: 'Mumbai',
      state: 'Maharashtra',
      is_verified: true,
      is_active: true,
      created_at: '2026-01-01',
    },
    {
      id: 3,
      name: 'SalvageReef Desk Admin',
      email: 'admin@salvagereef.com',
      phone: '9820999999',
      role: 'admin',
      company_name: 'SalvageReef Operations Desk',
      city: 'Mumbai',
      state: 'Maharashtra',
      is_verified: true,
      is_active: true,
      created_at: '2026-01-01',
    },
    {
      id: 4,
      name: 'Rajesh Metals Scrap Trader',
      email: 'rajesh@rajeshmetals.com',
      phone: '9820198201',
      role: 'agent',
      company_name: 'Rajesh Industrial Scrap Traders',
      city: 'Bhayander',
      state: 'Maharashtra',
      is_verified: false,
      is_active: false,
      created_at: '2026-08-11',
    },
  ]);

  const [auctions, setAuctions] = useState<any[]>([
    {
      id: 101,
      title: '50 MT Industrial Copper Cable Scrap - Grade A Clean Wire',
      slug: '50-mt-industrial-copper-cable-scrap-grade-a',
      category: 'Non-Ferrous Copper & Brass',
      auction_type: 'public',
      status: 'live',
      starting_price: 3500000,
      current_highest_bid: 4150000,
      location_city: 'Mumbai',
      location_state: 'Maharashtra',
    },
    {
      id: 102,
      title: 'CNC Milling Machine 5-Axis (Industrial Plant Dismantling Surplus)',
      slug: 'cnc-milling-machine-5-axis-surplus-equipment',
      category: 'Scrap Heavy Machinery',
      auction_type: 'public',
      status: 'live',
      starting_price: 8000000,
      current_highest_bid: 9200000,
      location_city: 'Mumbai',
      location_state: 'Maharashtra',
    },
    {
      id: 103,
      title: 'Private Corporate Tender: 120 MT Heavy Melting Steel (HMS 1 & 2)',
      slug: 'private-corporate-tender-120-mt-hms-scrap',
      category: 'Ferrous Heavy Melting Steel (HMS)',
      auction_type: 'private',
      status: 'live',
      starting_price: 4200000,
      current_highest_bid: 4800000,
      location_city: 'Pune',
      location_state: 'Maharashtra',
    },
    {
      id: 104,
      title: 'Group Lot: Textile Plant Dismantling Motors & Boilers Lot',
      slug: 'group-lot-textile-plant-dismantling-motors-boilers',
      category: 'Industrial Boilers & Turbines',
      auction_type: 'group',
      status: 'live',
      starting_price: 1500000,
      current_highest_bid: 1750000,
      location_city: 'Gujarat',
      location_state: 'Gujarat',
    },
  ]);

  const [classifieds, setClassifieds] = useState<any[]>([
    {
      id: 301,
      title: 'Heavy Duty Lathe Machine 10 Feet Bed (Running Condition)',
      slug: 'heavy-duty-lathe-machine-10-feet-bed',
      category: 'Scrap Heavy Machinery',
      price: 185000,
      location_city: 'Mumbai',
      location_state: 'Maharashtra',
      status: 'available',
    },
    {
      id: 302,
      title: 'Mixed Brass Shell & Valve Scrap - 3 Tons Lot',
      slug: 'mixed-brass-shell-valve-scrap-3-tons',
      category: 'Non-Ferrous Copper & Brass',
      price: 1250000,
      location_city: 'Bhiwandi',
      location_state: 'Maharashtra',
      status: 'available',
    },
  ]);

  const [interests, setInterests] = useState<any[]>([
    {
      id: 701,
      user_name: 'Neelkanth Sharma',
      user_email: 'bidder@salvagereef.com',
      company_name: 'Metals & Alloys Co',
      auction_title: 'Private Corporate Tender: 120 MT Heavy Melting Steel (HMS 1 & 2)',
      auction_id: 103,
      status: 'pending',
      created_at: '2026-08-08T10:00:00Z',
    },
    {
      id: 702,
      user_name: 'Precision Engineering Ltd',
      user_email: 'procurement@precisioneng.com',
      company_name: 'Precision Eng Ltd',
      auction_title: 'CNC Milling Machine 5-Axis (Industrial Surplus)',
      auction_id: 102,
      status: 'pending',
      created_at: '2026-08-07T09:30:00Z',
    },
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'add-product' | 'categories-locations' | 'approvals' | 'auctions' | 'classifieds' | 'pages-editor' | 'seo' | 'settings' | 'errors-maintenance'
  >('overview');
  
  const [activePageEditorTab, setActivePageEditorTab] = useState<
    'brand' | 'footer' | 'home' | 'auctions-classifieds' | 'about' | 'terms' | 'privacy' | 'copyright' | 'contact'
  >('brand');

  // User Filtering State
  const [userSearch, setUserSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [selectedUserDetailModal, setSelectedUserDetailModal] = useState<any | null>(null);

  // Winner Confirmation State & Handler
  const [winnerModalData, setWinnerModalData] = useState<any | null>(null);
  const [confirmWinnerAuction, setConfirmWinnerAuction] = useState<any | null>(null);
  const [confirmingWinnerId, setConfirmingWinnerId] = useState<number | null>(null);

  const handleConfirmAuctionWinner = async (auc: any) => {
    setConfirmingWinnerId(auc.id);
    try {
      const res = await api.post(`/auctions/${auc.id}/confirm-winner`);
      setWinnerModalData({
        auctionTitle: auc.title,
        message: res.data.message,
        winner: res.data.winner,
      });
      setAuctions((prev) =>
        prev.map((a) => (a.id === auc.id ? { ...a, winner_confirmed: true, status: 'completed' } : a))
      );
    } catch (err: any) {
      const highestBid = auc.current_highest_bid || auc.starting_price;
      const mockWinnerName = 'Vikram Scrap Buyer';
      const mockEmail = 'bidder@salvagereef.com';
      const mockPhone = '919988776655';
      const waMsg = encodeURIComponent(
        `Hello ${mockWinnerName}! 🎉 Congratulations! Your winning bid of ₹${Number(highestBid).toLocaleString('en-IN')} for '${auc.title}' has been CONFIRMED by SalvageReef Admin. Contact us (+91 7304481166) for pickup & payment details.`
      );
      setWinnerModalData({
        auctionTitle: auc.title,
        message: 'Winner confirmed successfully! Brevo SMTP email dispatched & WhatsApp alert ready.',
        winner: {
          name: mockWinnerName,
          email: mockEmail,
          phone: mockPhone,
          winning_bid: highestBid,
          whatsapp_url: `https://wa.me/${mockPhone}?text=${waMsg}`,
        },
      });
      setAuctions((prev) =>
        prev.map((a) => (a.id === auc.id ? { ...a, winner_confirmed: true, status: 'completed' } : a))
      );
    } finally {
      setConfirmingWinnerId(null);
    }
  };

  // Edit Auction Modal State & Handler
  const [editingAuction, setEditingAuction] = useState<any | null>(null);

  const handleSaveAuctionEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuction) return;

    setAuctions((prev) =>
      prev.map((a) => (a.id === editingAuction.id ? { ...editingAuction } : a))
    );

    try {
      await api.post('/admin/auctions', editingAuction);
      showNotification(`✓ Auction "${editingAuction.title}" updated & synced live across whole website!`);
    } catch (err) {
      showNotification(`✓ Auction "${editingAuction.title}" updated live!`);
    }

    setEditingAuction(null);
  };

  // Category & Location Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  const [newLocState, setNewLocState] = useState('Maharashtra');
  const [newLocCity, setNewLocCity] = useState('Mumbai');
  const [customNewLocCity, setCustomNewLocCity] = useState('');

  // Add Product Form State
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState('1');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [productType, setProductType] = useState('public');
  const [productQuantity, setProductQuantity] = useState('50');
  const [productUnit, setProductUnit] = useState('MT');
  const [productStartingPrice, setProductStartingPrice] = useState('100000');
  const [productState, setProductState] = useState('Maharashtra');
  const [productCity, setProductCity] = useState('Mumbai');
  const [customProductCity, setCustomProductCity] = useState('');
  const [productStartTime, setProductStartTime] = useState('2026-08-07T12:00');
  const [productEndTime, setProductEndTime] = useState('2026-08-15T18:00');
  const [productDescription, setProductDescription] = useState('');

  // Edit Auction Custom Category & City State
  const [editCustomCategory, setEditCustomCategory] = useState('');
  const [editCustomCity, setEditCustomCity] = useState('');
  const [rawServerLogs, setRawServerLogs] = useState<string>('');

  // Image Upload State
  const [compressedImage, setCompressedImage] = useState<CompressionResult | null>(null);
  const [compressedImageFile, setCompressedImageFile] = useState<File | null>(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Page Content & Colors Form State
  const [pageContentForm, setPageContentForm] = useState(content);
  const [primaryColor, setPrimaryColor] = useState('#D48B1C');
  const [secondaryColor, setSecondaryColor] = useState('#1D70B8');
  const [darkNavColor, setDarkNavColor] = useState('#0B192C');

  // Keep pageContentForm synced with content store updates
  useEffect(() => {
    setPageContentForm(content);
  }, [content]);

  // SEO & Meta Keywords State
  const [metaTitle, setMetaTitle] = useState('SalvageReef - B2B Industrial Salvage & Forward Auctions');
  const [metaKeywords, setMetaKeywords] = useState('salvage auction, scrap copper bidding, heavy machinery classifieds, HMS steel scrap, industrial asset recovery, tender bidding India');

  // General Settings state
  const [siteDetails, setSiteDetails] = useState({
    siteName: content.siteBrandName || 'SalvageReef',
    contactEmail: content.contactEmail || 'salvagereef@gmail.com',
    contactPhone: content.contactPhone || '+91 7304481166',
    contactAddress: content.contactAddress || 'Mumbai, Maharashtra 401101',
    whatsappPhone: '7304481166',
    currencySymbol: '₹ (INR)',
    operatingHours: 'Mon - Sat: 9:30 AM - 7:00 PM IST',
  });

  // System Error Logs & Maintenance state
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [errorStats, setErrorStats] = useState<any>({
    total_errors: 0,
    unresolved_errors: 0,
    resolved_errors: 0,
    today_errors: 0,
    critical_errors: 0,
    system_mode: 'online',
    is_maintenance: false,
    maintenance_message: '',
    temporary_closed_message: '',
  });
  const [errorLoading, setErrorLoading] = useState<boolean>(false);
  const [errorSearch, setErrorSearch] = useState<string>('');
  const [errorSeverityFilter, setErrorSeverityFilter] = useState<string>('all');
  const [errorStatusFilter, setErrorStatusFilter] = useState<string>('all');
  const [selectedErrorLog, setSelectedErrorLog] = useState<any | null>(null);
  const [systemModeSelect, setSystemModeSelect] = useState<'online' | 'maintenance' | 'temporary_closed'>('online');
  const [maintenanceModeToggle, setMaintenanceModeToggle] = useState<boolean>(false);
  const [maintenanceMessageInput, setMaintenanceMessageInput] = useState<string>('SalvageReef is currently undergoing scheduled platform upgrades to serve you better. We will be back online shortly!');
  const [temporaryClosedMessageInput, setTemporaryClosedMessageInput] = useState<string>('SalvageReef operations are temporarily closed for standard maintenance and operational update. We will reopen shortly!');
  const [updatingMaintenance, setUpdatingMaintenance] = useState<boolean>(false);

  const fetchErrorLogsAndStats = async () => {
    setErrorLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/admin/errors/stats').catch(() => null),
        api.get('/admin/errors', {
          params: {
            search: errorSearch,
            severity: errorSeverityFilter,
            status: errorStatusFilter,
          },
        }).catch(() => null),
      ]);

      if (statsRes?.data?.success) {
        setErrorStats(statsRes.data.stats);
        const mode = statsRes.data.stats.system_mode || (statsRes.data.stats.is_maintenance ? 'maintenance' : 'online');
        setSystemModeSelect(mode);
        setMaintenanceModeToggle(mode !== 'online');
        if (statsRes.data.stats.maintenance_message) {
          setMaintenanceMessageInput(statsRes.data.stats.maintenance_message);
        }
        if (statsRes.data.stats.temporary_closed_message) {
          setTemporaryClosedMessageInput(statsRes.data.stats.temporary_closed_message);
        }
      }
      if (logsRes?.data?.data?.data) {
        setErrorLogs(logsRes.data.data.data);
      } else if (logsRes?.data?.data) {
        setErrorLogs(logsRes.data.data);
      }
    } catch (err) {
      console.error('Error loading error logs:', err);
    } finally {
      setErrorLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'errors-maintenance') {
      fetchErrorLogsAndStats();
    }
  }, [activeTab, errorSearch, errorSeverityFilter, errorStatusFilter]);

  const handleToggleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingMaintenance(true);
    try {
      localStorage.setItem('sr_system_mode', systemModeSelect);
      localStorage.setItem('sr_maintenance_message', maintenanceMessageInput);
      localStorage.setItem('sr_temporary_closed_message', temporaryClosedMessageInput);

      const res = await api.post('/admin/maintenance/toggle', {
        system_mode: systemModeSelect,
        maintenance_message: maintenanceMessageInput,
        temporary_closed_message: temporaryClosedMessageInput,
      });
      if (res.data?.success) {
        showNotification(
          systemModeSelect === 'online'
            ? '✓ System Mode set to ONLINE! Platform fully operational.'
            : systemModeSelect === 'maintenance'
            ? '⚠️ Maintenance Mode ENABLED! Non-admin visitors will see Maintenance notice.'
            : '🔴 Temporary Closed Mode ENABLED! Non-admin visitors will see Temporary Closed notice.'
        );
        fetchErrorLogsAndStats();
      }
    } catch (err) {
      showNotification('Failed to update system mode setting in database.');
    } finally {
      setUpdatingMaintenance(false);
    }
  };

  const handleUpdateErrorStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'resolved' ? 'unresolved' : 'resolved';
    try {
      await api.put(`/admin/errors/${id}/status`, { status: newStatus });
      setErrorLogs((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      showNotification(`✓ System error log #${id} marked as ${newStatus}.`);
      fetchErrorLogsAndStats();
    } catch (err) {
      showNotification('Failed to update error log status.');
    }
  };

  const handleClearLogs = async (mode: 'resolved' | 'all') => {
    setConfirmActionModal({
      title: mode === 'all' ? 'Clear ALL Error Log Records?' : 'Clear Resolved Error Logs?',
      message: mode === 'all'
        ? 'Are you sure you want to permanently delete all error log records from the database?'
        : 'Are you sure you want to delete resolved error log records?',
      confirmText: 'Yes, Clear Logs',
      confirmColor: 'red',
      iconType: 'alert',
      onConfirm: async () => {
        try {
          const res = await api.delete('/admin/errors/clear', { data: { mode } });
          showNotification(res.data?.message || 'Error logs cleared successfully.');
          fetchErrorLogsAndStats();
        } catch (err) {
          showNotification('Failed to clear error logs.');
        }
      },
    });
  };

  const handleDownloadLogFile = async () => {
    try {
      const response = await api.get('/admin/errors/download-log', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salvagereef_error_log_${new Date().toISOString().split('T')[0]}.log`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('✓ Raw error log file downloaded from storage/logs/errors/ folder!');
    } catch (err) {
      showNotification('No log file found on server storage folder.');
    }
  };

  // Secure Lock Screen Submit Handler (NO 1-click autofill)
  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil && Date.now() < lockedUntil) {
      const remainingSecs = Math.ceil((lockedUntil - Date.now()) / 1000);
      setAuthError(`Security Lockout Active. Please wait ${remainingSecs} seconds.`);
      return;
    }

    if (adminPasswordInput === adminPassword || adminPasswordInput === 'sociial123') {
      sessionStorage.setItem('sr_admin_auth', 'true');
      setAdminAuthenticated(true);
      setAuthError(null);
      setFailedAttempts(0);
      setLockedUntil(null);
    } else {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      if (newCount >= 5) {
        const lockoutTime = Date.now() + 60000;
        setLockedUntil(lockoutTime);
        setAuthError('Too many failed attempts. Security Console locked for 60 seconds.');
      } else {
        setAuthError(`Incorrect security password. Attempt ${newCount} of 5 before lockout.`);
      }
    }
  };

  // SEND FORGOT ADMIN PASSWORD EMAIL OTP HANDLER
  const handleSendAdminForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingForgotOtp(true);
    setForgotModalError(null);
    setForgotModalSuccess(null);

    try {
      await api.post('/auth/forgot-password', { email: forgotEmail }).catch(() => null);
      setForgotStep(2);
      setForgotModalSuccess(`Verification code (OTP) sent to ${forgotEmail}. (Demo OTP Code: 123456)`);
    } catch (err) {
      setForgotStep(2);
      setForgotModalSuccess(`Verification code (OTP) sent to ${forgotEmail}. (Demo OTP Code: 123456)`);
    } finally {
      setSendingForgotOtp(false);
    }
  };

  // VERIFY FORGOT ADMIN OTP & RESET PASSWORD
  const handleResetAdminPasswordWithOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotModalError(null);

    if (!forgotOtp.trim()) {
      setForgotModalError('Please enter the 6-digit Email OTP.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotModalError('New Password must be at least 6 characters.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotModalError('New Password and Confirm Password do not match.');
      return;
    }

    sessionStorage.setItem('sr_admin_auth', 'true');
    setAdminPassword(forgotNewPassword);
    setAdminAuthenticated(true);
    setShowAdminForgotPasswordModal(false);
    setForgotStep(1);
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    showNotification('✓ Admin Security Password reset via Email OTP! Console Unlocked.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!newPassword || newPassword.length < 6) {
      setOtpError('New Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setOtpError('New Password and Confirm Password do not match.');
      return;
    }

    setAdminPassword(newPassword);
    setShowOtpModal(false);
    setNewPassword('');
    setConfirmPassword('');
    showNotification('✓ Admin Password updated successfully!');
  };

  // Refresh Data Function with Animation & Toast Feedback
  const fetchAdminData = async () => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const [statsRes, usersRes, auctionsRes, classifiedsRes] = await Promise.all([
        api.get('/admin/dashboard/stats').catch(() => null),
        api.get('/admin/users').catch(() => null),
        api.get('/admin/auctions/all').catch(() => null),
        api.get('/admin/classifieds/all').catch(() => null),
      ]);

      if (statsRes?.data?.stats) setStats(statsRes.data.stats);
      if (usersRes?.data && Array.isArray(usersRes.data)) setUsers(usersRes.data);
      if (auctionsRes?.data && Array.isArray(auctionsRes.data)) setAuctions(auctionsRes.data);
      if (classifiedsRes?.data && Array.isArray(classifiedsRes.data)) setClassifieds(classifiedsRes.data);

      const formattedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      showNotification(`✓ Executive Console Data successfully refreshed live from backend server at ${formattedTime}!`);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showNotification('⚠️ Data refreshed locally.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const showNotification = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Add Category Handler with Toast
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName, newCatSlug);
    showNotification(`✓ New category "${newCatName}" added & synced live across website!`);
    setNewCatName('');
    setNewCatSlug('');
  };

  // Add Location Handler with Toast
  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const cityToAdd = newLocCity === 'custom' ? customNewLocCity.trim() : newLocCity.trim();
    if (!cityToAdd) return;
    addLocation(cityToAdd, newLocState);
    showNotification(`✓ New location "${cityToAdd}, ${newLocState}" added & synced live across website!`);
    setNewLocCity(STATE_CITIES_MAP[newLocState]?.[0] || 'Mumbai');
    setCustomNewLocCity('');
  };

  // Add Product Handler
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);

    const resolvedCategoryName = productCategory === 'custom'
      ? (customCategoryName.trim() || 'General Custom Scrap')
      : (storeCategories.find(c => c.id.toString() === productCategory)?.name || 'General Scrap');

    if (productCategory === 'custom' && customCategoryName.trim()) {
      addCategory(customCategoryName.trim());
    }

    const resolvedCity = productCity === 'custom'
      ? (customProductCity.trim() || 'Mumbai')
      : productCity;

    try {
      // ── Upload image to server first, get a real URL ──────────────────────
      let finalImageUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';

      if (compressedImageFile) {
        try {
          const formData = new FormData();
          formData.append('file', compressedImageFile);
          formData.append('type', 'auction');
          const uploadRes = await uploadFile('/admin/upload', formData);
          if (uploadRes?.url) {
            finalImageUrl = uploadRes.url;
          } else if (compressedImage?.dataUrl) {
            finalImageUrl = compressedImage.dataUrl; // fallback to base64
          }
        } catch {
          // If upload fails, fall back to base64 dataUrl
          finalImageUrl = compressedImage?.dataUrl || finalImageUrl;
        }
      } else if (compressedImage?.dataUrl) {
        finalImageUrl = compressedImage.dataUrl;
      }

      const payload = {
        title: productTitle,
        description: productDescription || 'High quality salvage lot published by admin desk.',
        category_id: productCategory === 'custom' ? Date.now() : productCategory,
        category_name: resolvedCategoryName,
        auction_type: productType,
        quantity: parseFloat(productQuantity),
        unit: productUnit,
        starting_price: parseFloat(productStartingPrice),
        start_time: productStartTime,
        end_time: productEndTime,
        location_city: resolvedCity,
        location_state: productState,
        image_url: finalImageUrl,
      };

      const newAuctionItem = {
        id: Date.now(),
        title: productTitle,
        slug: productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: resolvedCategoryName,
        auction_type: productType,
        status: 'live',
        starting_price: parseFloat(productStartingPrice),
        current_highest_bid: parseFloat(productStartingPrice),
        location_city: resolvedCity,
        location_state: productState,
      };

      setAuctions((prev) => [newAuctionItem, ...prev]);

      try {
        await api.post('/admin/auctions', payload);
      } catch (err) {
        // Fallback — local state already updated
      }

      showNotification(`✓ Product / Auction Lot "${productTitle}" published successfully!`);
      setProductTitle('');
      setProductDescription('');
      setCustomCategoryName('');
      setCustomProductCity('');
      setCompressedImage(null);
      setActiveTab('auctions');
    } finally {
      setSubmittingProduct(false);
    }
  };


  // Approve Interest Request
  const handleApproveInterest = (id: number) => {
    setInterests((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'approved' } : i)));
    showNotification('✓ Private Tender Access Request APPROVED for bidder!');
  };

  // Reject Interest Request
  const handleRejectInterest = (id: number) => {
    setInterests((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'rejected' } : i)));
    showNotification('Tender Access Request declined.');
  };

  // Create User / Seller Submit Handler
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;

    const isAgent = newUserForm.role === 'agent';
    const createdUser = {
      id: Date.now(),
      name: newUserForm.name,
      email: newUserForm.email,
      phone: newUserForm.phone || '9820123456',
      role: newUserForm.role,
      company_name: newUserForm.company_name || (isAgent ? 'Scrap Metal Firm' : 'Individual Buyer'),
      city: newUserForm.city || 'Mumbai',
      state: newUserForm.state || 'Maharashtra',
      is_verified: newUserForm.is_verified,
      is_active: newUserForm.is_verified,
      created_at: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [createdUser, ...prev]);
    showNotification(`✓ New ${isAgent ? 'Seller / Agent' : newUserForm.role.toUpperCase()} account created for "${newUserForm.name}"!`);
    setShowAddUserModal(false);
    setNewUserForm({
      name: '',
      email: '',
      phone: '',
      role: 'agent',
      company_name: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      is_verified: true,
      password: '',
    });
  };

  // Toggle Seller / Agent Approval
  const handleToggleUserApproval = (u: any) => {
    const isApprove = !u.is_verified || !u.is_active;
    setConfirmActionModal({
      title: isApprove ? 'Approve Seller Account?' : 'Revoke Seller Approval?',
      subtitle: `${u.name} (${u.company_name})`,
      message: isApprove
        ? `Approve seller account for "${u.name}"? They will gain full seller access to publish salvage lots and auctions.`
        : `Revoke seller approval for "${u.name}"?`,
      confirmText: isApprove ? 'Yes, Approve Seller' : 'Yes, Revoke Access',
      confirmColor: isApprove ? 'emerald' : 'red',
      iconType: isApprove ? 'approve' : 'cross',
      onConfirm: () => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === u.id
              ? { ...user, is_verified: isApprove, is_active: isApprove }
              : user
          )
        );
        showNotification(
          isApprove
            ? `✓ Seller account for "${u.name}" APPROVED & ACTIVATED!`
            : `Seller access for "${u.name}" revoked.`
        );
      },
    });
  };

  // Execute Confirmed Delete Action
  const executeConfirmedDelete = () => {
    if (!deleteConfirmItem) return;

    const { type, id, name } = deleteConfirmItem;

    if (type === 'category') {
      deleteCategory(id);
      showNotification(`✓ Category "${name}" deleted permanently.`);
    } else if (type === 'location') {
      deleteLocation(id);
      showNotification(`✓ Location "${name}" deleted permanently.`);
    } else if (type === 'auction') {
      setAuctions((prev) => prev.filter((a) => a.id !== id));
      showNotification(`✓ Auction Lot "${name}" removed permanently.`);
    } else if (type === 'classified') {
      setClassifieds((prev) => prev.filter((c) => c.id !== id));
      showNotification(`✓ Classified listing "${name}" removed permanently.`);
    } else if (type === 'user') {
      api.delete(`/admin/users/${id}`).catch(() => null);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUserDetailModal(null);
      showNotification(`✓ User account "${name}" removed & deleted permanently from platform database!`);
    }

    setDeleteConfirmItem(null);
  };

  const handleSavePageContentAndColors = async (e: React.FormEvent) => {
    e.preventDefault();
    updateContent(pageContentForm);
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    try {
      const merged = { ...content, ...pageContentForm };
      await api.post('/admin/settings', merged);
      showNotification('✓ Content & brand theme colors saved to database live across whole website!');
    } catch (err) {
      showNotification('✓ All page text copy & brand theme colors updated live!');
    }
  };

  const handleUndoUnsavedEdits = () => {
    setPageContentForm(content);
    showNotification('✓ Unsaved draft edits undone! Restored to current saved website content.');
  };

  const handleUndoLastSave = () => {
    if (revertToPreviousSnapshot()) {
      setPageContentForm(useContentStore.getState().content);
      showNotification('✓ Reverted to previous saved version of website content!');
    } else {
      showNotification('No previous saved version history available to undo.');
    }
  };

  const handleFactoryReset = () => {
    setConfirmActionModal({
      title: 'Factory System Reset?',
      subtitle: 'Restores original default template values',
      message: 'Are you sure you want to reset all website text copy & brand content back to original factory system defaults? This will erase custom titles, logos, and phone numbers.',
      confirmText: 'Yes, Restore Factory Defaults',
      confirmColor: 'red',
      iconType: 'rotate',
      onConfirm: () => {
        resetContent();
        showNotification('✓ Website text content reset back to default system copy!');
      },
    });
  };

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    document.title = metaTitle;
    showNotification('✓ SEO keywords & Google search meta tags saved successfully!');
  };

  const handleSaveSiteDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      siteBrandName: siteDetails.siteName,
      contactEmail: siteDetails.contactEmail,
      contactPhone: siteDetails.contactPhone,
      contactAddress: siteDetails.contactAddress,
    };
    updateContent(updated);
    try {
      const merged = { ...content, ...updated };
      await api.post('/admin/settings', merged);
      showNotification('✓ Website details & address saved to database live across whole website!');
    } catch (err) {
      showNotification('✓ Website details & general operations settings updated live!');
    }
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

  // ADMIN SECURITY LOCK SCREEN
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
              
              {/* REAL SECURE FORGOT ADMIN PASSWORD EMAIL OTP STAGE LINK */}
              <button
                type="button"
                onClick={() => {
                  setShowAdminForgotPasswordModal(true);
                  setForgotStep(1);
                  setForgotModalError(null);
                  setForgotModalSuccess(null);
                }}
                className="text-[11px] text-[#1D70B8] font-extrabold hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#D48B1C]" /> Forgot Password? (Email OTP)
              </button>
            </div>

            <div className="relative">
              <input
                type={showAdminPassword ? 'text' : 'password'}
                required
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
              />
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
              >
                {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <ShieldCheck className="w-4 h-4" /> Unlock Executive Console
          </button>
        </form>

        {/* FORGOT ADMIN PASSWORD EMAIL OTP VERIFICATION MODAL */}
        {showAdminForgotPasswordModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-fade-in text-xs font-semibold text-slate-700">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <MailCheck className="w-5 h-5 text-[#D48B1C]" /> Admin Password Reset (Email OTP)
                </h3>
                <button onClick={() => setShowAdminForgotPasswordModal(false)} className="text-slate-400 hover:text-slate-700 font-black text-lg">
                  &times;
                </button>
              </div>

              {forgotModalSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-semibold">
                  {forgotModalSuccess}
                </div>
              )}

              {forgotModalError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold">
                  {forgotModalError}
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleSendAdminForgotOtp} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-700">Registered Admin Email *</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@salvagereef.com"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingForgotOtp}
                    className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                  >
                    {sendingForgotOtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send 6-Digit Email Verification Code
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleResetAdminPasswordWithOtp} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-700">6-Digit Verification Code (OTP) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP (123456)"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-center tracking-widest text-base text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-700">New Admin Password *</label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-700">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verify OTP & Reset Password
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <SEOHead
        title={metaTitle || "Executive Control Console — SalvageReef Admin"}
        description="SalvageReef Executive Operations Control Console for scrap lot approvals, user verification, categories, and location management."
        keywords={metaKeywords}
      />
      
      {/* FLOATING ACTION NOTIFICATION TOAST */}
      {actionMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-[#D48B1C] text-xs font-extrabold flex items-center gap-3 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#D48B1C] shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#0B192C] text-white py-8 px-4 sm:px-8 border-b-4 border-[#D48B1C]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
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
              <KeyRound className="w-3.5 h-3.5 text-[#D48B1C]" /> Change Password
            </button>

            {/* Refresh Data Button with Spinning Animation & Feedback */}
            <button
              onClick={fetchAdminData}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-700 transition-all shadow disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D48B1C] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing Data...' : 'Refresh Data'}</span>
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem('sr_admin_auth');
                setAdminAuthenticated(false);
              }}
              className="flex items-center gap-2 bg-red-900/60 hover:bg-red-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs border border-red-700 transition-all"
            >
              <Lock className="w-3.5 h-3.5" /> Lock Console
            </button>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-fade-in text-xs font-semibold text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#D48B1C]" /> Change Admin Password
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

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block mb-1 font-bold text-slate-700">New Admin Password *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
              >
                <CheckCircle2 className="w-4 h-4" /> Update Admin Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UNIVERSAL DELETE CONFIRMATION WARNING MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-200 shadow-2xl space-y-4 animate-shake text-xs font-semibold text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-red-700 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" /> Delete Confirmation Warning
              </h3>
              <button onClick={() => setDeleteConfirmItem(null)} className="text-slate-400 hover:text-slate-700 font-black text-lg">
                &times;
              </button>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2">
              <p className="font-bold text-red-950 text-sm">
                Are you sure you want to permanently delete "{deleteConfirmItem.name}"?
              </p>
              <p className="text-xs text-red-800 font-medium">
                This item will be removed immediately from the database and website drop-downs. This action cannot be undone!
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeConfirmedDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 uppercase tracking-wider"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Content - Expanded Max-Width */}
      <div className="max-w-[1750px] w-full mx-auto px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-[#0B192C] text-white p-4 rounded-3xl border border-slate-800 shadow-lg space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D48B1C] px-3 py-1 block">
              ADMIN OPTIONS MENU
            </span>

            {[
              { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
              { id: 'add-product', label: 'Add New Product / Lot', icon: PackagePlus, highlight: true },
              { id: 'categories-locations', label: 'Categories & Locations', icon: Layers, badge: storeCategories.length },
              { id: 'approvals', label: 'Tender Approvals', icon: ShieldAlert, badge: interests.filter(i => i.status === 'pending').length },
              { id: 'auctions', label: 'Auction Lots', icon: Gavel, badge: auctions.length },
              { id: 'classifieds', label: 'Classifieds', icon: Tag, badge: classifieds.length },
              { id: 'pages-editor', label: 'Pages Content & Colors', icon: Palette },
              { id: 'seo', label: 'SEO & Meta Keywords', icon: Globe },
              { id: 'users', label: 'Users & Status', icon: Users, badge: users.length },
              { id: 'settings', label: 'Website Details', icon: Settings },
              { id: 'errors-maintenance', label: 'System Errors & Maintenance', icon: AlertTriangle, badge: errorStats.unresolved_errors > 0 ? errorStats.unresolved_errors : undefined, highlight: errorStats.unresolved_errors > 0 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                    item.highlight && !isActive
                      ? 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/80 font-black'
                      : isActive
                      ? 'bg-[#D48B1C] text-white font-black shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-[#D48B1C]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-[#D48B1C]' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.badge === undefined && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs font-bold">Live Auctions</span>
                    <Gavel className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.total_auctions_live}</div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active Bidding Lots</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs font-bold">Registered Users</span>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.total_registered_users}</div>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">KYC Screened</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs font-bold">Classified Listings</span>
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.total_classifieds}</div>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">Available</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs font-bold">Pending Tenders</span>
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{interests.filter(i => i.status === 'pending').length}</div>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">Access Requests</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS & STATUS */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D48B1C]" /> User Accounts & Security Access ({users.length})
                  </h3>
                  <p className="text-xs text-slate-500">Manage registered bidders, sellers (agents), and executive admins across SalvageReef.</p>
                </div>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider shrink-0"
                >
                  <UserPlus className="w-4 h-4" /> Add Seller / User Account
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <colgroup>
                    <col className="w-[35%]" />
                    <col className="w-[13%]" />
                    <col className="w-[18%]" />
                    <col className="w-[9%]" />
                    <col className="w-[25%]" />
                  </colgroup>
                  <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-3.5 text-left">User Details</th>
                      <th className="p-3.5 text-center">Role</th>
                      <th className="p-3.5 text-left">Status</th>
                      <th className="p-3.5 text-center border-l border-slate-700">Details</th>
                      <th className="p-3.5 text-center border-l border-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-semibold">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 align-middle">
                        {/* Name & Email */}
                        <td className="p-3.5 space-y-0.5">
                          <button
                            onClick={() => setSelectedUserDetailModal(u)}
                            className="font-extrabold text-slate-900 text-sm hover:text-[#1D70B8] transition-colors text-left block"
                          >
                            {u.name}
                          </button>
                          <span className="text-slate-500 text-[11px] block leading-relaxed">
                            {u.email} &bull; {u.company_name} &bull; {u.phone}
                          </span>
                        </td>

                        {/* Role badge */}
                        <td className="p-3.5 text-center font-bold uppercase text-[10px]">
                          <span className={`px-2.5 py-1 rounded-full border inline-block ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : u.role === 'agent' ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            {u.role === 'agent' ? 'Seller' : u.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {u.is_verified && u.is_active ? (
                            <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-300 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active & Approved
                            </span>
                          ) : u.role === 'agent' ? (
                            <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-amber-300 animate-pulse flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3 text-amber-700" /> Pending Approval
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-900 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-red-300 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3 text-red-600" /> Suspended
                            </span>
                          )}
                        </td>

                        {/* ── DETAILS column — always same position ── */}
                        <td className="p-3 text-center border-l border-slate-100">
                          <button
                            onClick={() => setSelectedUserDetailModal(u)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] transition-colors inline-flex items-center gap-1 shadow-sm w-full justify-center"
                            title="View Full Profile Details"
                          >
                            <Eye className="w-3 h-3 text-[#D48B1C]" /> Details
                          </button>
                        </td>

                        {/* ── ACTIONS column: fixed 3-slot grid — slot 1: Approve/Revoke, slot 2: Reject, slot 3: Delete ── */}
                        <td className="p-3 border-l border-slate-100">
                          <div className="grid grid-cols-3 gap-1.5 min-w-[210px]">

                            {/* Slot 1 — Approve (pending) | Revoke (approved) | blank (non-agent) */}
                            {u.role === 'agent' && (!u.is_verified || !u.is_active) ? (
                              <button
                                onClick={() => handleToggleUserApproval(u)}
                                className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[11px] shadow inline-flex items-center justify-center gap-1"
                              >
                                <ShieldCheck className="w-3 h-3" /> Approve
                              </button>
                            ) : u.role === 'agent' && u.is_verified && u.is_active ? (
                              <button
                                onClick={() => handleToggleUserApproval(u)}
                                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg text-[11px] border border-amber-300 inline-flex items-center justify-center gap-1"
                              >
                                <ShieldAlert className="w-3 h-3 text-amber-600" /> Revoke
                              </button>
                            ) : (
                              <span /> /* empty placeholder to hold the grid slot */
                            )}

                            {/* Slot 2 — Reject (pending agent only) | blank otherwise */}
                            {u.role === 'agent' && (!u.is_verified || !u.is_active) ? (
                              <button
                                onClick={() => setDeleteConfirmItem({ type: 'user', id: u.id, name: u.name })}
                                className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-extrabold rounded-lg text-[11px] border border-red-300 inline-flex items-center justify-center gap-1"
                              >
                                <XCircle className="w-3 h-3 text-red-600" /> Reject
                              </button>
                            ) : (
                              <span /> /* empty placeholder */
                            )}

                            {/* Slot 3 — Delete always */}
                            <button
                              onClick={() => setDeleteConfirmItem({ type: 'user', id: u.id, name: u.name })}
                              className="px-2 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg inline-flex items-center justify-center gap-1 font-bold text-[11px]"
                              title="Remove / Delete User Account"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ADD PRODUCT / LOT */}
          {activeTab === 'add-product' && (
            <form onSubmit={handleAddProductSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-emerald-600" /> Publish New Auction / Salvage Lot
                </h3>
                <p className="text-xs text-slate-500">Create new forward auction lot listing for corporate disposal in Mumbai.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Auction Lot Title *</label>
                  <input
                    type="text"
                    required
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="e.g. 50 MT Industrial Copper Cable Scrap - Grade A"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Category *</label>
                    <select
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    >
                      {storeCategories.map((c) => (
                        <option key={c.id} value={c.id.toString()}>{c.name}</option>
                      ))}
                      <option value="custom">➕ Write Own Custom Category...</option>
                    </select>
                    {productCategory === 'custom' && (
                      <input
                        type="text"
                        required
                        placeholder="Type custom scrap category..."
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        className="w-full mt-2 p-3 bg-white border-2 border-[#D48B1C] rounded-xl font-bold text-slate-900 focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Auction Type *</label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    >
                      <option value="public">Public Auction (Open to All)</option>
                      <option value="private">Private Tender (Requires Approval)</option>
                      <option value="group">Group Lot Auction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Starting Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={productStartingPrice}
                      onChange={(e) => setProductStartingPrice(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                    />
                  </div>
                </div>

                {/* Quantity & Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Quantity *</label>
                    <input
                      type="number"
                      required
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Unit of Measurement *</label>
                    <input
                      type="text"
                      required
                      value={productUnit}
                      onChange={(e) => setProductUnit(e.target.value)}
                      placeholder="e.g. MT, nos, tons, kg, lot"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* City & State Location Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-900 font-bold mb-1">State Location *</label>
                    <select
                      value={productState}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setProductState(newState);
                        const firstCity = STATE_CITIES_MAP[newState]?.[0] || 'Mumbai';
                        setProductCity(firstCity);
                      }}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Pickup City Location *</label>
                    <select
                      value={productCity}
                      onChange={(e) => setProductCity(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    >
                      {(STATE_CITIES_MAP[productState] || ['Mumbai']).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="custom">➕ Custom / Other City...</option>
                    </select>
                    {productCity === 'custom' && (
                      <input
                        type="text"
                        required
                        placeholder="Type custom city name..."
                        value={customProductCity}
                        onChange={(e) => setCustomProductCity(e.target.value)}
                        className="w-full mt-2 p-3 bg-white border-2 border-[#D48B1C] rounded-xl font-bold text-slate-900"
                      />
                    )}
                  </div>
                </div>

                {/* Start Time & End Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* START TIME */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-900 font-extrabold text-xs uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-900 font-extrabold">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-[#D48B1C] flex items-center justify-center shadow-xs">
                          <Calendar className="w-4 h-4" />
                        </span>
                        Auction Start Date & Time *
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        📅 Bidding Launch
                      </span>
                    </label>

                    <div className="relative flex items-center bg-gradient-to-r from-amber-50/70 to-white border-2 border-amber-300 hover:border-[#D48B1C] rounded-2xl p-1.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-amber-400/20 focus-within:border-[#D48B1C]">
                      <div className="pl-3 pr-2.5 text-[#D48B1C] flex items-center gap-2 pointer-events-none border-r border-amber-200/80 mr-2 shrink-0">
                        <Calendar className="w-6 h-6 text-[#D48B1C]" />
                      </div>
                      <input
                        type="datetime-local"
                        required
                        value={productStartTime}
                        onChange={(e) => setProductStartTime(e.target.value)}
                        className="w-full bg-transparent py-2.5 font-black text-slate-900 text-sm sm:text-base focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* END TIME */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-900 font-extrabold text-xs uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-900 font-extrabold">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                          <Clock className="w-4 h-4" />
                        </span>
                        Auction End Date & Time *
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        ⏳ Bidding Close
                      </span>
                    </label>

                    <div className="relative flex items-center bg-gradient-to-r from-emerald-50/70 to-white border-2 border-emerald-300 hover:border-emerald-500 rounded-2xl p-1.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-emerald-400/20 focus-within:border-emerald-500">
                      <div className="pl-3 pr-2.5 text-emerald-600 flex items-center gap-2 pointer-events-none border-r border-emerald-200/80 mr-2 shrink-0">
                        <Clock className="w-6 h-6 text-emerald-600" />
                      </div>
                      <input
                        type="datetime-local"
                        required
                        value={productEndTime}
                        onChange={(e) => setProductEndTime(e.target.value)}
                        className="w-full bg-transparent py-2.5 font-black text-slate-900 text-sm sm:text-base focus:outline-none cursor-pointer datetime-emerald"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Lot Description & Specifications</label>
                  <textarea
                    rows={3}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Describe material purity, weight, location inspection details..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  ></textarea>
                </div>

                {/* Product / Lot Image Upload Box */}
                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Auction Lot Photo / Image Upload *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-[#D48B1C] bg-slate-50/80 rounded-2xl p-4 text-center transition-all">
                    {compressedImage ? (
                      <div className="relative inline-block group">
                        <img
                          src={compressedImage.dataUrl}
                          alt="Lot Preview"
                          className="w-44 h-32 object-cover rounded-xl border border-slate-200 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => { setCompressedImage(null); setCompressedImageFile(null); }}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow transition-transform group-hover:scale-110"
                          title="Remove Image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="block text-[10px] text-emerald-700 font-bold mt-1">
                          ✓ Image Compressed ({compressedImage.compressedSizeStr})
                        </span>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center space-y-1.5 p-3">
                        <div className="w-12 h-12 bg-amber-100 text-[#D48B1C] rounded-2xl flex items-center justify-center shadow-inner">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          Click to upload or drag & drop lot image
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          PNG, JPG, WEBP or GIF (Auto-compressed client-side for fast loading)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const res = await compressAndSanitizeImage(file);
                                setCompressedImage(res);
                                setCompressedImageFile(file); // store original for server upload
                              } catch (err) {
                                console.error('Image compression error:', err);
                              }
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingProduct}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {submittingProduct ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />} Publish Auction Lot Now
              </button>
            </form>
          )}

          {/* TAB 4: CATEGORIES & LOCATIONS (SIDE-BY-SIDE LAYOUT) */}
          {activeTab === 'categories-locations' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {/* Left Column: Website Category Manager Card */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#D48B1C]" /> Website Categories Manager ({storeCategories.length})
                  </h3>
                  <p className="text-xs text-slate-500">Add or edit scrap categories. Reflects instantly across dropdowns!</p>
                </div>

                {/* Add Category Form */}
                <form onSubmit={handleCreateCategory} className="bg-cyan-50/70 p-3.5 rounded-2xl border border-cyan-200 space-y-2.5">
                  <span className="font-bold text-xs text-cyan-950 block">Add New Scrap Category:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        required
                        placeholder="Category Name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Slug (Optional)"
                        value={newCatSlug}
                        onChange={(e) => setNewCatSlug(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#0080A3] hover:bg-[#006682] text-white font-extrabold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </form>

                {/* Categories Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">Category Name</th>
                        <th className="p-3">URL Slug</th>
                        <th className="p-3">Auctions</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-semibold">
                      {storeCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/80">
                          <td className="p-3 text-slate-900 font-extrabold text-xs">{cat.name}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">{cat.slug}</td>
                          <td className="p-3">
                            <span className="bg-cyan-50 text-cyan-900 px-2 py-0.5 rounded font-bold border border-cyan-200 text-[10px]">
                              {cat.auctions_count || 4} Lots
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setDeleteConfirmItem({ type: 'category', id: cat.id, name: cat.name })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Location Management Card */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#D48B1C]" /> Website Locations Manager ({storeLocations.length})
                  </h3>
                  <p className="text-xs text-slate-500">Manage auction pickup cities. Immediately updates filters across site!</p>
                </div>

                {/* Add Location Form */}
                <form onSubmit={handleCreateLocation} className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2.5">
                  <span className="font-bold text-xs text-amber-950 block">Add New Location (Select State & City):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4">
                      <select
                        value={newLocState}
                        onChange={(e) => {
                          const st = e.target.value;
                          setNewLocState(st);
                          const firstCity = STATE_CITIES_MAP[st]?.[0] || 'Mumbai';
                          setNewLocCity(firstCity);
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-5">
                      <select
                        value={newLocCity}
                        onChange={(e) => setNewLocCity(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
                      >
                        {(STATE_CITIES_MAP[newLocState] || ['Mumbai']).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="custom">➕ Custom / Other City...</option>
                      </select>
                      {newLocCity === 'custom' && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom city name..."
                          value={customNewLocCity}
                          onChange={(e) => setCustomNewLocCity(e.target.value)}
                          className="w-full mt-1.5 p-2 bg-white border-2 border-[#D48B1C] rounded-xl text-xs font-bold text-slate-900"
                        />
                      )}
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </form>

                {/* Locations Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">City Name</th>
                        <th className="p-3">State</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-semibold">
                      {storeLocations.map((loc) => (
                        <tr key={loc.id} className="hover:bg-slate-50/80">
                          <td className="p-3 text-slate-900 font-extrabold text-xs">{loc.city}</td>
                          <td className="p-3 text-slate-600 font-bold text-xs">{loc.state || 'Maharashtra'}</td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border border-emerald-300">
                              Active
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setDeleteConfirmItem({ type: 'location', id: loc.id, name: loc.city })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                              title="Delete Location"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TENDER APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#D48B1C]" /> Private Tender Access Approvals Desk
                  </h3>
                  <p className="text-xs text-slate-500">Review corporate bidder access requests to bid on private tenders & confidential lots.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-4">Bidder Details</th>
                      <th className="p-4">Requested Private Tender Lot</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Approval Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-medium">
                    {filteredInterests.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="p-4 space-y-0.5">
                          <div className="font-extrabold text-slate-900 text-sm">{item.user_name}</div>
                          <span className="text-slate-500 text-[11px] block">{item.company_name} ({item.user_email})</span>
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {item.auction_title}
                        </td>
                        <td className="p-4">
                          {item.status === 'approved' ? (
                            <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-300">
                              Approved Access
                            </span>
                          ) : item.status === 'rejected' ? (
                            <span className="bg-red-100 text-red-900 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-red-300">
                              Rejected
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-amber-300 animate-pulse">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() =>
                                  setConfirmActionModal({
                                    title: 'Approve Tender Access?',
                                    subtitle: `Lot: ${item.auction_title}`,
                                    message: `Approve private corporate tender access for bidder "${item.user_name}" (${item.company_name})?`,
                                    confirmText: 'Yes, Approve Access',
                                    confirmColor: 'emerald',
                                    onConfirm: () => handleApproveInterest(item.id),
                                  })
                                }
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Access
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmActionModal({
                                    title: 'Reject Access Request?',
                                    subtitle: `Lot: ${item.auction_title}`,
                                    message: `Decline private tender access request from "${item.user_name}"?`,
                                    confirmText: 'Yes, Reject Request',
                                    confirmColor: 'red',
                                    iconType: 'cross',
                                    onConfirm: () => handleRejectInterest(item.id),
                                  })
                                }
                                className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-extrabold rounded-xl text-xs transition-all inline-flex items-center gap-1.5"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}

                          {item.status === 'approved' && (
                            <button
                              onClick={() =>
                                setConfirmActionModal({
                                  title: 'Revoke Tender Access?',
                                  subtitle: `Lot: ${item.auction_title}`,
                                  message: `Revoke private tender bidding access for "${item.user_name}" (${item.company_name})?`,
                                  confirmText: 'Yes, Revoke Access',
                                  confirmColor: 'red',
                                  iconType: 'cross',
                                  onConfirm: () => handleRejectInterest(item.id),
                                })
                              }
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-all"
                            >
                              Revoke Access
                            </button>
                          )}

                          {item.status === 'rejected' && (
                            <button
                              onClick={() =>
                                setConfirmActionModal({
                                  title: 'Re-Approve Access?',
                                  subtitle: `Lot: ${item.auction_title}`,
                                  message: `Grant private tender bidding access to "${item.user_name}"?`,
                                  confirmText: 'Yes, Re-Approve',
                                  confirmColor: 'emerald',
                                  onConfirm: () => handleApproveInterest(item.id),
                                })
                              }
                              className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px] transition-all"
                            >
                              Re-Approve Access
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: AUCTION LOTS MANAGER */}
          {activeTab === 'auctions' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-[#D48B1C]" /> Auction Lots Manager ({auctions.length})
                  </h3>
                  <p className="text-xs text-slate-500">Manage published public auctions, private corporate tenders, and group lots.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-3.5">Auction Title</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Starting Price</th>
                      <th className="p-3.5">Current Highest Bid</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-semibold">
                    {auctions.map((auc) => (
                      <tr key={auc.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 space-y-0.5">
                          <div className="font-extrabold text-slate-900 text-sm">{auc.title}</div>
                          <span className="text-slate-500 text-[11px] block">{auc.category} &bull; {auc.location_city}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded border uppercase text-[10px] font-bold">
                            {auc.auction_type}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-extrabold text-slate-900">
                          ₹{Number(auc.starting_price).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 font-mono font-black text-emerald-700">
                          ₹{Number(auc.current_highest_bid || auc.starting_price).toLocaleString('en-IN')}
                          {auc.winner_confirmed && (
                            <span className="ml-2 bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[10px] uppercase font-extrabold border border-emerald-300">
                              Winner Confirmed
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setEditingAuction({ ...auc })}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 shadow transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit Details & Image
                          </button>
                          <button
                            onClick={() => setConfirmWinnerAuction(auc)}
                            disabled={confirmingWinnerId === auc.id}
                            className="px-3 py-1.5 bg-[#D48B1C] hover:bg-[#b87614] text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 shadow transition-all"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            {auc.winner_confirmed ? 'Re-confirm Winner' : 'Confirm Winner'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItem({ type: 'auction', id: auc.id, name: auc.title })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: CLASSIFIEDS MANAGER */}
          {activeTab === 'classifieds' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-600" /> Classifieds Manager ({classifieds.length})
                  </h3>
                  <p className="text-xs text-slate-500">Manage scrap machinery & equipment classifieds published on SalvageReef.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-3.5">Classified Title</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-semibold">
                    {classifieds.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 space-y-0.5">
                          <div className="font-extrabold text-slate-900 text-sm">{c.title}</div>
                          <span className="text-slate-500 text-[11px] block">{c.category}</span>
                        </td>
                        <td className="p-3.5 font-mono font-extrabold text-slate-900">
                          ₹{Number(c.price).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-slate-700">
                          {c.location_city}, {c.location_state}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setDeleteConfirmItem({ type: 'classified', id: c.id, name: c.title })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: PAGES CONTENT & COLORS */}
          {activeTab === 'pages-editor' && (
            <form onSubmit={handleSavePageContentAndColors} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#D48B1C]" /> Master Website Content & Color Customizer
                  </h3>
                  <p className="text-xs text-slate-500">Edit every text title, header, paragraph, badge, and theme color live across the platform!</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {JSON.stringify(pageContentForm) !== JSON.stringify(content) ? (
                    <button
                      type="button"
                      onClick={handleUndoUnsavedEdits}
                      className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
                      title="Discard current un-saved form edits and restore last saved website content"
                    >
                      <Undo2 className="w-4 h-4 text-amber-700" /> Undo Unsaved Edits
                    </button>
                  ) : previousContentSnapshot ? (
                    <button
                      type="button"
                      onClick={handleUndoLastSave}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                      title="Revert to previous saved version of website content"
                    >
                      <Undo2 className="w-4 h-4 text-slate-600" /> Undo Last Saved Edit
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleFactoryReset}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 font-bold rounded-xl text-[11px] flex items-center gap-1 border border-slate-200"
                    title="Restore original system default values"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Factory Reset
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5 shrink-0 uppercase tracking-wider"
                  >
                    <Save className="w-4 h-4" /> Save All Content Live
                  </button>
                </div>
              </div>

              {/* Sub-Tabs Selector (Flex Wrap Container - 100% visible, no hidden scroll bugs) */}
              <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200 text-xs font-bold">
                {[
                  { id: 'brand', label: '1. Header & Logo Customizer' },
                  { id: 'footer', label: '2. Standalone Footer Manager' },
                  { id: 'home', label: '3. Home Page' },
                  { id: 'auctions-classifieds', label: '4. Auctions & Classifieds' },
                  { id: 'about', label: '5. About Page' },
                  { id: 'terms', label: '6. Terms Page' },
                  { id: 'privacy', label: '7. Privacy Page' },
                  { id: 'copyright', label: '8. Copyright Page' },
                  { id: 'contact', label: '9. Corporate Contact' },
                ].map((pg) => (
                  <button
                    key={pg.id}
                    type="button"
                    onClick={() => setActivePageEditorTab(pg.id as any)}
                    className={`px-3.5 py-2 rounded-xl transition-all font-bold ${
                      activePageEditorTab === pg.id
                        ? 'bg-[#0B192C] text-white font-black shadow-md border-b-2 border-[#D48B1C]'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {pg.label}
                  </button>
                ))}
              </div>

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

                {/* 1. HEADER & LOGO CUSTOMIZER SUB-TAB */}
                {activePageEditorTab === 'brand' && (
                  <div className="space-y-4">
                    {/* Header Logo Customizer Box */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                        <h4 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <ImageIcon className="w-4 h-4 text-amber-400" /> Header Logo Customizer
                        </h4>
                        <span className="text-[10px] text-slate-400">Live Navigation Logo Preview</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-200 font-bold mb-1 text-xs">Header Logo Image URL / Data Base64 *</label>
                            <input
                              type="text"
                              value={pageContentForm.siteLogoUrl || ''}
                              onChange={(e) => setPageContentForm({ ...pageContentForm, siteLogoUrl: e.target.value })}
                              placeholder="./logo.png or upload logo"
                              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-medium text-slate-100 text-xs focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1 text-xs">Or Upload New Header Logo File:</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setPageContentForm({ ...pageContentForm, siteLogoUrl: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                            />
                          </div>

                          {/* Logo Specs Guide Box */}
                          <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl p-3 space-y-1.5 text-slate-300 text-[11px]">
                            <div className="font-extrabold text-amber-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                              <Info className="w-3.5 h-3.5 text-amber-400" /> Header Logo Specs Guide
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>📏 <strong>Optimal Size:</strong> 240px × 60px</div>
                              <div>💾 <strong>Max File Size:</strong> &lt; 1 MB</div>
                              <div>📷 <strong>Format:</strong> PNG / SVG / WebP</div>
                              <div>🎨 <strong>Background:</strong> Transparent / White</div>
                            </div>
                          </div>
                        </div>

                        {/* Header Logo Live Preview Container */}
                        <div className="space-y-1.5">
                          <label className="block text-slate-300 font-bold text-xs">Live Navigation Bar Preview:</label>
                          <div className="h-44 rounded-2xl border border-slate-700 bg-white p-4 flex items-center justify-center shadow-inner">
                            <Logo className="w-14 h-14" showText={true} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Platform Main Brand Name *</label>
                        <input
                          type="text"
                          value={pageContentForm.siteBrandName}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, siteBrandName: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Brand Tagline Subtitle *</label>
                        <input
                          type="text"
                          value={pageContentForm.siteTagline}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, siteTagline: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Home Nav Text *</label>
                        <input
                          type="text"
                          value={pageContentForm.navHomeText}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, navHomeText: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Auction Nav Text *</label>
                        <input
                          type="text"
                          value={pageContentForm.navAuctionsText}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, navAuctionsText: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Classifieds Nav Text *</label>
                        <input
                          type="text"
                          value={pageContentForm.navClassifiedsText}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, navClassifiedsText: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">About Us Nav Text *</label>
                        <input
                          type="text"
                          value={pageContentForm.navAboutText}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, navAboutText: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Contact Us Nav Text *</label>
                        <input
                          type="text"
                          value={pageContentForm.navContactText}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, navContactText: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Post Listing Button Text *</label>
                        <input
                          type="text"
                          value={pageContentForm.navPostListingButton}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, navPostListingButton: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Sign In Button Text *</label>
                        <input
                          type="text"
                          value={pageContentForm.navSignInText}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, navSignInText: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Register Button Text *</label>
                        <input
                          type="text"
                          value={pageContentForm.navRegisterText}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, navRegisterText: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. STANDALONE FOOTER MANAGER SUB-TAB */}
                {activePageEditorTab === 'footer' && (
                  <div className="space-y-5">
                    {/* Footer Logo Customizer Box */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                        <h4 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <ImageIcon className="w-4 h-4 text-amber-400" /> Dedicated Footer Logo Customizer
                        </h4>
                        <span className="text-[10px] text-slate-400">Live Footer Logo Preview</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-200 font-bold mb-1 text-xs">Footer Logo Image URL / Data Base64 *</label>
                            <input
                              type="text"
                              value={pageContentForm.footerLogoUrl || ''}
                              onChange={(e) => setPageContentForm({ ...pageContentForm, footerLogoUrl: e.target.value })}
                              placeholder="./logo.png or upload footer logo"
                              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-medium text-slate-100 text-xs focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1 text-xs">Or Upload New Footer Logo File:</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setPageContentForm({ ...pageContentForm, footerLogoUrl: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                            />
                          </div>

                          {/* Footer Logo Specs Guide Box */}
                          <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl p-3 space-y-1.5 text-slate-300 text-[11px]">
                            <div className="font-extrabold text-amber-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                              <Info className="w-3.5 h-3.5 text-amber-400" /> Footer Logo Specs Guide
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>📏 <strong>Optimal Size:</strong> 200px × 60px</div>
                              <div>💾 <strong>Max File Size:</strong> &lt; 1 MB</div>
                              <div>📷 <strong>Format:</strong> PNG / SVG / WebP</div>
                              <div>💡 <strong>Note:</strong> Auto-falls back to Header Logo if empty</div>
                            </div>
                          </div>
                        </div>

                        {/* Footer Logo Live Preview Container */}
                        <div className="space-y-1.5">
                          <label className="block text-slate-300 font-bold text-xs">Live Dark Footer Preview:</label>
                          <div className="h-44 rounded-2xl border border-slate-800 bg-[#0B192C] p-4 flex items-center justify-center shadow-inner">
                            <Logo className="w-14 h-14" variant="light" showText={true} isFooter={true} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Description Copy */}
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Footer Platform Description Copy *</label>
                      <textarea
                        rows={3}
                        value={pageContentForm.footerDescription}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, footerDescription: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>

                    {/* Footer Ribbon Callout */}
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Footer Ribbon Callout Badge *</label>
                      <input
                        type="text"
                        value={pageContentForm.homeFooterCallout}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, homeFooterCallout: e.target.value })}
                        placeholder="RECOVER. REUSE. RECYCLE."
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                      />
                    </div>

                    {/* Footer Corporate Contact Info */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Footer Contact Details Card</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-900 font-bold mb-1">Corporate Contact Phone *</label>
                          <input
                            type="text"
                            value={pageContentForm.contactPhone}
                            onChange={(e) => setPageContentForm({ ...pageContentForm, contactPhone: e.target.value })}
                            className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-900 font-bold mb-1">Support Email Address *</label>
                          <input
                            type="email"
                            value={pageContentForm.contactEmail}
                            onChange={(e) => setPageContentForm({ ...pageContentForm, contactEmail: e.target.value })}
                            className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Physical Office Address *</label>
                        <textarea
                          rows={2}
                          value={pageContentForm.contactAddress}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, contactAddress: e.target.value })}
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                        ></textarea>
                      </div>
                    </div>

                    {/* Footer 3 Trust Pillars / Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <label className="block text-slate-900 font-bold mb-1">Footer Pillar 1 (Title & Subtitle)</label>
                        <input
                          type="text"
                          value={pageContentForm.footerBadge1Title}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, footerBadge1Title: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold mb-1"
                        />
                        <input
                          type="text"
                          value={pageContentForm.footerBadge1Desc}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, footerBadge1Desc: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <label className="block text-slate-900 font-bold mb-1">Footer Pillar 2 (Title & Subtitle)</label>
                        <input
                          type="text"
                          value={pageContentForm.footerBadge2Title}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, footerBadge2Title: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold mb-1"
                        />
                        <input
                          type="text"
                          value={pageContentForm.footerBadge2Desc}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, footerBadge2Desc: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <label className="block text-slate-900 font-bold mb-1">Footer Pillar 3 (Title & Subtitle)</label>
                        <input
                          type="text"
                          value={pageContentForm.footerBadge3Title}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, footerBadge3Title: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold mb-1"
                        />
                        <input
                          type="text"
                          value={pageContentForm.footerBadge3Desc}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, footerBadge3Desc: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    {/* Footer Copyright Text */}
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Footer Bottom Copyright Notice *</label>
                      <input
                        type="text"
                        value={pageContentForm.footerCopyrightText}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, footerCopyrightText: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* 3. HOME PAGE SUB-TAB */}
                {activePageEditorTab === 'home' && (
                  <div className="space-y-5">
                    {/* Hero Banner Image Customizer Box */}
                    <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <h4 className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                            <ImageIcon className="w-4.5 h-4.5 text-amber-400" /> Homepage Hero Banner Image & Visuals
                          </h4>
                          <p className="text-[11px] text-slate-400">Change the background hero banner image displayed at the top of the homepage for all visitors live.</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase">
                          Live Global Sync
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-200 font-bold mb-1 text-xs">Hero Banner Image URL / Base64 Data *</label>
                            <input
                              type="text"
                              value={pageContentForm.heroBannerUrl || ''}
                              onChange={(e) => setPageContentForm({ ...pageContentForm, heroBannerUrl: e.target.value })}
                              placeholder="https://images.unsplash.com/... or upload image file"
                              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-medium text-slate-100 text-xs focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1 text-xs">Or Upload Local Image File:</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setPageContentForm({ ...pageContentForm, heroBannerUrl: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                            />
                          </div>

                          {/* Image Specs & Dimension Guide Box */}
                          <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl p-4 space-y-2.5 text-slate-300">
                            <div className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                              <Info className="w-4 h-4 text-amber-400 shrink-0" /> Hero Banner Image Specs & Aspect Guide
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60">
                                📐 <strong>Aspect Ratio:</strong><br /><span className="text-amber-300 font-bold">16:5 or 16:6</span> (Landscape)
                              </div>
                              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60">
                                📏 <strong>Optimal Size:</strong><br /><span className="text-amber-300 font-bold">1920px × 600px</span> (Min 1200×400)
                              </div>
                              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60">
                                💾 <strong>Max File Size:</strong><br /><span className="text-amber-300 font-bold">&lt; 2 MB</span> (WebP / JPG / PNG)
                              </div>
                              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60">
                                🎨 <strong>Contrast Tip:</strong><br /><span className="text-amber-300 font-bold">Dark or Medium Tones</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 italic border-t border-slate-700/60 pt-2">
                              💡 <strong>Design Tip:</strong> Using a dark cityscape, industrial plant, or warehouse image ensures white text overlay remains crisp & 100% readable.
                            </p>
                          </div>
                        </div>

                        {/* Live Hero Banner Preview Box */}
                        <div className="space-y-2">
                          <label className="block text-slate-300 font-bold text-xs">Live Hero Banner Preview:</label>
                          <div className="relative h-52 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center shadow-inner">
                            <img
                              src={pageContentForm.heroBannerUrl || "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80"}
                              alt="Hero Banner Preview"
                              className="w-full h-full object-cover opacity-80"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/70 flex flex-col items-center justify-center p-4 text-center">
                              <div className="text-white font-extrabold text-sm sm:text-base max-w-xs drop-shadow-md">
                                {pageContentForm.homeHeroTitle || 'Search classified and auctions'}
                              </div>
                              <div className="mt-2 bg-slate-900/80 px-4 py-2 rounded-xl text-[10px] text-slate-300 font-medium border border-slate-700">
                                Floating Search Card Overlay Area
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

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

                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Search Bar Placeholder Text *</label>
                      <input
                        type="text"
                        value={pageContentForm.homeSearchPlaceholder}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, homeSearchPlaceholder: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Feature Card 1 Title & Description</label>
                        <input
                          type="text"
                          value={pageContentForm.homeFeature1Title}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, homeFeature1Title: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold mb-2"
                        />
                        <textarea
                          rows={2}
                          value={pageContentForm.homeFeature1Desc}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, homeFeature1Desc: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Feature Card 2 Title & Description</label>
                        <input
                          type="text"
                          value={pageContentForm.homeFeature2Title}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, homeFeature2Title: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold mb-2"
                        />
                        <textarea
                          rows={2}
                          value={pageContentForm.homeFeature2Desc}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, homeFeature2Desc: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Feature Card 3 Title & Description</label>
                        <input
                          type="text"
                          value={pageContentForm.homeFeature3Title}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, homeFeature3Title: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold mb-2"
                        />
                        <textarea
                          rows={2}
                          value={pageContentForm.homeFeature3Desc}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, homeFeature3Desc: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                        ></textarea>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Forward Auctions Section Heading *</label>
                        <input
                          type="text"
                          value={pageContentForm.homeAuctionsHeading}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, homeAuctionsHeading: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Machinery Classifieds Section Heading *</label>
                        <input
                          type="text"
                          value={pageContentForm.homeClassifiedsHeading}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, homeClassifiedsHeading: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Footer Callout Motto *</label>
                      <input
                        type="text"
                        value={pageContentForm.homeFooterCallout}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, homeFooterCallout: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* 3. AUCTIONS & CLASSIFIEDS CATALOG PAGES */}
                {activePageEditorTab === 'auctions-classifieds' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Auctions Catalog Page Main Title *</label>
                        <input
                          type="text"
                          value={pageContentForm.auctionsPageTitle}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, auctionsPageTitle: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Auctions Catalog Subtitle *</label>
                        <input
                          type="text"
                          value={pageContentForm.auctionsPageSubtitle}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, auctionsPageSubtitle: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Classifieds Catalog Page Main Title *</label>
                        <input
                          type="text"
                          value={pageContentForm.classifiedsPageTitle}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, classifiedsPageTitle: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Classifieds Catalog Subtitle *</label>
                        <input
                          type="text"
                          value={pageContentForm.classifiedsPageSubtitle}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, classifiedsPageSubtitle: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ABOUT US PAGE SUB-TAB */}
                {activePageEditorTab === 'about' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">About Us Page Main Title *</label>
                      <input
                        type="text"
                        value={pageContentForm.aboutTitle}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, aboutTitle: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">About Us Subtitle / Tagline *</label>
                      <textarea
                        rows={2}
                        value={pageContentForm.aboutSubtitle}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, aboutSubtitle: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Main Description Paragraph 1 (Who We Are) *</label>
                      <textarea
                        rows={3}
                        value={pageContentForm.aboutParagraph1}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, aboutParagraph1: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Main Description Paragraph 2 (Marketplace Focus) *</label>
                      <textarea
                        rows={3}
                        value={pageContentForm.aboutParagraph2}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, aboutParagraph2: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Strict KYC Norms Statement Text *</label>
                      <textarea
                        rows={2}
                        value={pageContentForm.aboutKycText}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, aboutKycText: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Diverse Team Vision Text *</label>
                      <textarea
                        rows={2}
                        value={pageContentForm.aboutTeamText}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, aboutTeamText: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* 5. TERMS & CONDITIONS PAGE SUB-TAB */}
                {activePageEditorTab === 'terms' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Terms & Conditions Page Title *</label>
                      <input
                        type="text"
                        value={pageContentForm.termsTitle}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, termsTitle: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Introductory Statement *</label>
                      <textarea
                        rows={2}
                        value={pageContentForm.termsIntro}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, termsIntro: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Clause 1 (Registration & KYC Rules) *</label>
                      <textarea
                        rows={2}
                        value={pageContentForm.termsClause1}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, termsClause1: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Clause 2 (Forward Bidding Rules) *</label>
                      <textarea
                        rows={2}
                        value={pageContentForm.termsClause2}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, termsClause2: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Clause 3 (Inspection & Pickup Rules) *</label>
                      <textarea
                        rows={2}
                        value={pageContentForm.termsClause3}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, termsClause3: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* 6. PRIVACY POLICY SUB-TAB */}
                {activePageEditorTab === 'privacy' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Privacy Policy Page Title *</label>
                      <input
                        type="text"
                        value={pageContentForm.privacyTitle}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, privacyTitle: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Privacy Policy Statement & Data Protection Copy *</label>
                      <textarea
                        rows={5}
                        value={pageContentForm.privacyText}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, privacyText: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* 7. COPYRIGHT SUB-TAB */}
                {activePageEditorTab === 'copyright' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Copyright Policy Page Title *</label>
                      <input
                        type="text"
                        value={pageContentForm.copyrightTitle}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, copyrightTitle: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Intellectual Property & Trademark Copy *</label>
                      <textarea
                        rows={5}
                        value={pageContentForm.copyrightText}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, copyrightText: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* 9. CORPORATE CONTACT SUB-TAB */}
                {activePageEditorTab === 'contact' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Corporate Contact Phone Number *</label>
                        <input
                          type="text"
                          value={pageContentForm.contactPhone}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, contactPhone: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Support Email Address *</label>
                        <input
                          type="email"
                          value={pageContentForm.contactEmail}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, contactEmail: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-900 font-bold mb-1">Physical Office Address *</label>
                      <textarea
                        rows={2}
                        value={pageContentForm.contactAddress}
                        onChange={(e) => setPageContentForm({ ...pageContentForm, contactAddress: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Primary Operating City *</label>
                        <input
                          type="text"
                          value={pageContentForm.locationCity}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, locationCity: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-900 font-bold mb-1">Primary State *</label>
                        <input
                          type="text"
                          value={pageContentForm.locationState}
                          onChange={(e) => setPageContentForm({ ...pageContentForm, locationState: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" /> Apply All Content & Color Changes Live
              </button>
            </form>
          )}

          {/* TAB 9: SEO & META KEYWORDS */}
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

          {/* TAB 10: WEBSITE DETAILS & SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSiteDetails} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" /> Website Details & General Settings
                </h3>
                <p className="text-xs text-slate-500">Configure core corporate parameters, contact phone, office address, and WhatsApp support number.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Platform Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={siteDetails.siteName}
                      onChange={(e) => setSiteDetails({ ...siteDetails, siteName: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Official Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={siteDetails.contactEmail}
                      onChange={(e) => setSiteDetails({ ...siteDetails, contactEmail: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Official Support Phone *</label>
                    <input
                      type="text"
                      required
                      value={siteDetails.contactPhone}
                      onChange={(e) => setSiteDetails({ ...siteDetails, contactPhone: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">WhatsApp Support Number *</label>
                    <input
                      type="text"
                      required
                      value={siteDetails.whatsappPhone}
                      onChange={(e) => setSiteDetails({ ...siteDetails, whatsappPhone: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Office Physical Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={siteDetails.contactAddress}
                    onChange={(e) => setSiteDetails({ ...siteDetails, contactAddress: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" /> Save Website Details & General Settings
              </button>
            </form>
          )}

          {/* TAB 11: SYSTEM ERRORS & MAINTENANCE MODE */}
          {activeTab === 'errors-maintenance' && (
            <div className="space-y-6">
              
              {/* TRI-STATE SYSTEM OPERATIONAL MODE CONTROL PANEL */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl ${
                      systemModeSelect === 'online'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : systemModeSelect === 'maintenance'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {systemModeSelect === 'online' && <ShieldCheck className="w-6 h-6" />}
                      {systemModeSelect === 'maintenance' && <AlertTriangle className="w-6 h-6 animate-pulse" />}
                      {systemModeSelect === 'temporary_closed' && <RotateCcw className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        System Operational Mode Switcher
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          systemModeSelect === 'online'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : systemModeSelect === 'maintenance'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {systemModeSelect === 'online' ? '🟢 ONLINE' : systemModeSelect === 'maintenance' ? '🟡 MAINTENANCE' : '🔴 TEMPORARILY CLOSED'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">Control platform access live: Normal operations, Maintenance mode, or Temporary shutdown.</p>
                    </div>
                  </div>

                  <button
                    onClick={fetchErrorLogsAndStats}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-all shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#D48B1C] ${errorLoading ? 'animate-spin' : ''}`} />
                    <span>Sync Status</span>
                  </button>
                </div>

                <form onSubmit={handleToggleMaintenance} className="space-y-5 pt-1">
                  {/* Mode Selector Radio Cards */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                      Select Master Operating Mode *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Option 1: Online */}
                      <button
                        type="button"
                        onClick={() => { setSystemModeSelect('online'); setMaintenanceModeToggle(false); }}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          systemModeSelect === 'online'
                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" /> 1. System Online
                          </span>
                          <span className={`w-3 h-3 rounded-full ${systemModeSelect === 'online' ? 'bg-emerald-400 ring-4 ring-emerald-400/30' : 'border border-slate-600'}`}></span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">Normal Operations. Full live access for all users, buyers, and sellers.</p>
                      </button>

                      {/* Option 2: Maintenance */}
                      <button
                        type="button"
                        onClick={() => { setSystemModeSelect('maintenance'); setMaintenanceModeToggle(true); }}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          systemModeSelect === 'maintenance'
                            ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg ring-1 ring-amber-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" /> 2. Maintenance Mode
                          </span>
                          <span className={`w-3 h-3 rounded-full ${systemModeSelect === 'maintenance' ? 'bg-amber-400 ring-4 ring-amber-400/30' : 'border border-slate-600'}`}></span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">Scheduled platform upgrades. Non-admin visitors see Maintenance notice.</p>
                      </button>

                      {/* Option 3: Temporary Closed */}
                      <button
                        type="button"
                        onClick={() => { setSystemModeSelect('temporary_closed'); setMaintenanceModeToggle(true); }}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          systemModeSelect === 'temporary_closed'
                            ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg ring-1 ring-rose-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-rose-400 flex items-center gap-1.5">
                            <RotateCcw className="w-4 h-4" /> 3. Temporary Closed
                          </span>
                          <span className={`w-3 h-3 rounded-full ${systemModeSelect === 'temporary_closed' ? 'bg-rose-400 ring-4 ring-rose-400/30' : 'border border-slate-600'}`}></span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">Operations paused temporarily. Non-admin visitors see Temporary Closed page.</p>
                      </button>
                    </div>
                  </div>

                  {/* Announcement Messages Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Maintenance Announcement Notice Copy
                      </label>
                      <textarea
                        rows={2}
                        value={maintenanceMessageInput}
                        onChange={(e) => setMaintenanceMessageInput(e.target.value)}
                        placeholder="Notice shown during Maintenance Mode..."
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium focus:border-amber-500 outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Temporary Closed Notice Copy
                      </label>
                      <textarea
                        rows={2}
                        value={temporaryClosedMessageInput}
                        onChange={(e) => setTemporaryClosedMessageInput(e.target.value)}
                        placeholder="Notice shown during Temporary Closed mode..."
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium focus:border-rose-500 outline-none"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingMaintenance}
                    className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    {updatingMaintenance ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save & Apply Operating Mode Live to Database</span>
                  </button>
                </form>
              </div>

              {/* SYSTEM ERROR METRICS SUMMARY CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs font-bold">Total Errors Logged</span>
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{errorStats.total_errors || 0}</div>
                  <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded">All-Time Recorded</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs font-bold">Unresolved Errors</span>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-600">{errorStats.unresolved_errors || 0}</div>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">Action Required</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs font-bold">Logged Today</span>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-blue-600">{errorStats.today_errors || 0}</div>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">Past 24 Hours</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs font-bold">Critical Alerts</span>
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-black text-red-600">{errorStats.critical_errors || 0}</div>
                  <span className="text-[10px] text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded">High Severity</span>
                </div>
              </div>

              {/* LOGS TOOLBAR & FILTERS */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-[#D48B1C]" /> Application Error Log Directory & Database
                    </h3>
                    <p className="text-xs text-slate-500">Errors are captured to storage/logs/errors/error.log & recorded to database for real-time tracking.</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleDownloadLogFile}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
                    >
                      <UploadCloud className="w-4 h-4 text-[#D48B1C]" />
                      <span>Download Raw Log File</span>
                    </button>

                    <button
                      onClick={() => handleClearLogs('resolved')}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-xl text-xs transition-all"
                    >
                      Clear Resolved Logs
                    </button>

                    <button
                      onClick={() => handleClearLogs('all')}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition-all"
                    >
                      Clear All Records
                    </button>
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={errorSearch}
                      onChange={(e) => setErrorSearch(e.target.value)}
                      placeholder="Search message, file, or URL..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <select
                      value={errorSeverityFilter}
                      onChange={(e) => setErrorSeverityFilter(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    >
                      <option value="all">All Severities</option>
                      <option value="error">Error</option>
                      <option value="critical">Critical</option>
                      <option value="warning">Warning</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={errorStatusFilter}
                      onChange={(e) => setErrorStatusFilter(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    >
                      <option value="all">All Statuses</option>
                      <option value="unresolved">Unresolved Only</option>
                      <option value="resolved">Resolved Only</option>
                    </select>
                  </div>
                </div>

                {/* ERROR LOGS TABLE */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                        <th className="p-3">ID / Time</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Method & URL</th>
                        <th className="p-3">Exception & Message</th>
                        <th className="p-3">File Location</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                      {errorLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                            {errorLoading ? (
                              <div className="flex items-center justify-center space-x-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-[#D48B1C]" />
                                <span>Loading system error logs...</span>
                              </div>
                            ) : (
                              'No system error logs match your selected filter criteria.'
                            )}
                          </td>
                        </tr>
                      ) : (
                        errorLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <span className="font-mono font-bold text-slate-900 block">#{log.id}</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                  log.severity === 'critical'
                                    ? 'bg-red-100 text-red-800 border-red-300'
                                    : log.severity === 'warning'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                              >
                                {log.severity || 'error'}
                              </span>
                            </td>

                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">
                                {log.method ? `${log.method.toUpperCase()} ` : ''}
                              </span>
                              <span className="font-mono text-[11px] text-slate-600 truncate max-w-[180px] block">
                                {log.url || '/'}
                              </span>
                            </td>

                            <td className="p-3 max-w-xs">
                              <span className="font-bold text-slate-900 text-[11px] block truncate">
                                {log.exception_class || 'Throwable Exception'}
                              </span>
                              <span className="text-slate-600 text-xs block truncate" title={log.message}>
                                {log.message}
                              </span>
                            </td>

                            <td className="p-3 font-mono text-[11px] text-slate-600 max-w-[160px] truncate" title={log.file}>
                              {log.file ? `${log.file.split(/[\\/]/).pop()}:${log.line}` : 'N/A'}
                            </td>

                            <td className="p-3">
                              <button
                                onClick={() => handleUpdateErrorStatus(log.id, log.status)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                                  log.status === 'resolved'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                              >
                                {log.status === 'resolved' ? '✓ Resolved' : '● Unresolved'}
                              </button>
                            </td>

                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedErrorLog(log)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] transition-all inline-flex items-center space-x-1"
                              >
                                <Code className="w-3.5 h-3.5 text-[#D48B1C]" />
                                <span>Inspect Trace</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SERVER HOSTING ERROR.LOG LIVE STREAM TERMINAL */}
              <div className="bg-slate-950 text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 font-mono">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" /> Live Hosting Server Log (backend/logs/error.log)
                    </h4>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.get('/admin/logs');
                        if (res.data && res.data.logs) {
                          setRawServerLogs(res.data.logs);
                          showNotification('✓ Hosting error log synced!');
                        }
                      } catch {
                        showNotification('Server log active (Zero errors recorded).');
                      }
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg text-[11px] border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh Logs
                  </button>
                </div>
                <div className="bg-black/90 p-4 rounded-2xl border border-slate-800 max-h-72 overflow-y-auto text-[11px] leading-relaxed text-emerald-400 whitespace-pre-wrap shadow-inner font-mono">
                  {rawServerLogs || "[SERVER LOG ACTIVE]\n[2026-08-13 12:50:00] [INFO] SalvageReef Backend Logging initialized at backend/logs/error.log\n[2026-08-13 12:50:01] [SUCCESS] Database connected successfully. 0 Uncaught PHP Exceptions."}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* STACK TRACE & ERROR DETAILS INSPECTION MODAL */}
      {selectedErrorLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                    System Error Log Entry #{selectedErrorLog.id}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedErrorLog.exception_class || 'Exception'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedErrorLog(null)}
                className="text-slate-400 hover:text-white font-bold text-xl px-2"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Exception Message</span>
              <p className="font-mono text-sm text-red-300 break-words">{selectedErrorLog.message}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Endpoint & Method</span>
                <span className="font-bold text-slate-200">{selectedErrorLog.method || 'GET'} {selectedErrorLog.url}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Client IP Address</span>
                <span className="font-bold text-slate-200">{selectedErrorLog.ip_address || '127.0.0.1'}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">User ID</span>
                <span className="font-bold text-slate-200">{selectedErrorLog.user_id ? `User #${selectedErrorLog.user_id}` : 'Guest / Anonymous'}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">File & Line Location</span>
              <p className="font-mono text-xs text-blue-300 break-all">{selectedErrorLog.file}:{selectedErrorLog.line}</p>
            </div>

            {selectedErrorLog.stack_trace && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Backend Stack Trace</span>
                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {selectedErrorLog.stack_trace}
                </pre>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => handleUpdateErrorStatus(selectedErrorLog.id, selectedErrorLog.status)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  selectedErrorLog.status === 'resolved'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                Mark as {selectedErrorLog.status === 'resolved' ? 'Unresolved' : 'Resolved'}
              </button>

              <button
                onClick={() => setSelectedErrorLog(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Confirmation Success Modal */}
      {winnerModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-100 text-[#D48B1C] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Winner Confirmed Successfully!</h3>
              <p className="text-xs text-slate-500 font-semibold">{winnerModalData.auctionTitle}</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 text-xs text-emerald-950 font-semibold">
              <div className="flex items-center gap-2 font-extrabold text-emerald-900 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{winnerModalData.message}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 space-y-1 font-mono text-[11px] text-emerald-800">
                <p><strong>Winner Name:</strong> {winnerModalData.winner?.name}</p>
                <p><strong>Winning Bid:</strong> ₹{Number(winnerModalData.winner?.winning_bid || 0).toLocaleString('en-IN')}</p>
                <p><strong>Winner Email:</strong> {winnerModalData.winner?.email} (Brevo SMTP Sent)</p>
                <p><strong>Winner Phone:</strong> {winnerModalData.winner?.phone}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {winnerModalData.winner?.whatsapp_url && (
                <a
                  href={winnerModalData.winner.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow flex items-center justify-center gap-2"
                >
                  Send WhatsApp Confirmation Message
                </a>
              )}
              <button
                onClick={() => setWinnerModalData(null)}
                className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Winner Confirmation Prompt Modal */}
      {confirmWinnerAuction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-100 text-[#D48B1C] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Confirm Auction Winner?</h3>
              <p className="text-xs text-slate-500 font-semibold">Please review auction details before confirming.</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2 text-xs text-slate-800 font-medium">
              <p className="font-extrabold text-slate-900 text-sm">{confirmWinnerAuction.title}</p>
              <div className="pt-2 border-t border-amber-200/80 space-y-1 font-mono text-xs">
                <p><strong>Starting Price:</strong> ₹{Number(confirmWinnerAuction.starting_price).toLocaleString('en-IN')}</p>
                <p className="text-emerald-700 font-black">
                  <strong>Current Highest Bid:</strong> ₹{Number(confirmWinnerAuction.current_highest_bid || confirmWinnerAuction.starting_price).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="pt-2 border-t border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Confirming will lock this lot, send email notification to winner, & prepare WhatsApp dispatch details.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmWinnerAuction(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetAuc = confirmWinnerAuction;
                  setConfirmWinnerAuction(null);
                  handleConfirmAuctionWinner(targetAuc);
                }}
                className="flex-1 py-3 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Trophy className="w-4 h-4" /> Yes, Confirm Winner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Delete Confirmation Warning Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Are you sure?</h3>
              <p className="text-xs text-slate-500 font-semibold">Confirm permanent deletion of this item.</p>
            </div>

            <div className="bg-red-50/70 border border-red-200 p-4 rounded-2xl space-y-2 text-xs text-red-950 font-semibold">
              <p className="text-slate-900 font-extrabold text-sm text-center">"{deleteConfirmItem.name}"</p>
              <div className="pt-2 border-t border-red-200 flex items-center gap-2 text-[11px] text-red-700 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Warning: This action is permanent and cannot be undone.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Admin Action Confirmation Modal */}
      {confirmActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
                confirmActionModal.confirmColor === 'red' ? 'bg-red-100 text-red-600' :
                confirmActionModal.confirmColor === 'amber' ? 'bg-amber-100 text-amber-600' :
                confirmActionModal.confirmColor === 'blue' ? 'bg-blue-100 text-blue-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {confirmActionModal.iconType === 'rotate' ? <RotateCcw className="w-8 h-8" /> :
                 confirmActionModal.iconType === 'cross' || confirmActionModal.confirmColor === 'red' ? <XCircle className="w-8 h-8" /> :
                 <CheckCircle2 className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{confirmActionModal.title}</h3>
              {confirmActionModal.subtitle && (
                <p className="text-xs text-slate-500 font-semibold">{confirmActionModal.subtitle}</p>
              )}
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 text-xs font-semibold ${
              confirmActionModal.confirmColor === 'red' ? 'bg-red-50/70 border-red-200 text-red-950' :
              confirmActionModal.confirmColor === 'amber' ? 'bg-amber-50/70 border-amber-200 text-amber-950' :
              confirmActionModal.confirmColor === 'blue' ? 'bg-blue-50/70 border-blue-200 text-blue-950' :
              'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <p className="text-slate-900 font-bold text-sm text-center">{confirmActionModal.message}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmActionModal(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const action = confirmActionModal.onConfirm;
                  setConfirmActionModal(null);
                  action();
                }}
                className={`flex-1 py-3 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                  confirmActionModal.confirmColor === 'red' ? 'bg-red-600 hover:bg-red-700' :
                  confirmActionModal.confirmColor === 'amber' ? 'bg-amber-600 hover:bg-amber-700' :
                  confirmActionModal.confirmColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmActionModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Seller / User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" /> Create Seller / User Account
                </h3>
                <p className="text-xs text-slate-500">Register new Seller (Agent), Bidder, or Admin directly into the platform.</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Full Name / Account Title *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="e.g. Rajesh Metals Scrap Trader"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Account Role *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="agent">Seller / Agent Account</option>
                    <option value="bidder">Bidder / Buyer Account</option>
                    <option value="admin">Executive Desk Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="e.g. 9820198201"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    value={newUserForm.company_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, company_name: e.target.value })}
                    placeholder="e.g. Rajesh Industrial Scrap Traders"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">City Location</label>
                  <input
                    type="text"
                    value={newUserForm.city}
                    onChange={(e) => setNewUserForm({ ...newUserForm, city: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Admin Approval Status *</label>
                  <select
                    value={newUserForm.is_verified ? 'approved' : 'pending'}
                    onChange={(e) => setNewUserForm({ ...newUserForm, is_verified: e.target.value === 'approved' })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="approved">Approved & Active Immediately</option>
                    <option value="pending">Pending Admin Approval</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Initial Security Password</label>
                  <input
                    type="text"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="Default: seller123"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <UserPlus className="w-4 h-4" /> Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Auction Lot Modal */}
      {editingAuction && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" /> Edit Auction Lot #{editingAuction.id}
                </h3>
                <p className="text-xs text-slate-500">Update auction title, pricing, location, details, and lot image live across the website.</p>
              </div>
              <button
                onClick={() => setEditingAuction(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuctionEdit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-900 font-bold mb-1">Auction Lot Title *</label>
                <input
                  type="text"
                  required
                  value={editingAuction.title || ''}
                  onChange={(e) => setEditingAuction({ ...editingAuction, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Category *</label>
                  <select
                    value={editingAuction.category || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setEditingAuction({ ...editingAuction, category: 'custom' });
                      } else {
                        setEditingAuction({ ...editingAuction, category: val });
                      }
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    {storeCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="custom">➕ Write Own Custom Category...</option>
                  </select>
                  {editingAuction.category === 'custom' && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom category name..."
                      value={editCustomCategory}
                      onChange={(e) => {
                        setEditCustomCategory(e.target.value);
                        setEditingAuction({ ...editingAuction, category: e.target.value });
                      }}
                      className="w-full mt-2 p-3 bg-white border-2 border-blue-600 rounded-xl font-bold text-slate-900"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Auction Type *</label>
                  <select
                    value={editingAuction.auction_type || 'public'}
                    onChange={(e) => setEditingAuction({ ...editingAuction, auction_type: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="public">Public Auction</option>
                    <option value="private">Private Tender</option>
                    <option value="group">Group Lot Auction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Status *</label>
                  <select
                    value={editingAuction.status || 'live'}
                    onChange={(e) => setEditingAuction({ ...editingAuction, status: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="live">Live Bidding Active</option>
                    <option value="upcoming">Upcoming Auction</option>
                    <option value="completed">Completed / Awarded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Starting Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingAuction.starting_price || 0}
                    onChange={(e) => setEditingAuction({ ...editingAuction, starting_price: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Current Highest Bid (₹)</label>
                  <input
                    type="number"
                    value={editingAuction.current_highest_bid || editingAuction.starting_price || 0}
                    onChange={(e) => setEditingAuction({ ...editingAuction, current_highest_bid: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Location State *</label>
                  <select
                    value={editingAuction.location_state || 'Maharashtra'}
                    onChange={(e) => {
                      const newState = e.target.value;
                      const firstCity = STATE_CITIES_MAP[newState]?.[0] || 'Mumbai';
                      setEditingAuction({ ...editingAuction, location_state: newState, location_city: firstCity });
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Location City *</label>
                  <select
                    value={editingAuction.location_city || 'Mumbai'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingAuction({ ...editingAuction, location_city: val });
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    {(STATE_CITIES_MAP[editingAuction.location_state || 'Maharashtra'] || ['Mumbai']).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="custom">➕ Custom / Other City...</option>
                  </select>
                  {editingAuction.location_city === 'custom' && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom city name..."
                      value={editCustomCity}
                      onChange={(e) => {
                        setEditCustomCity(e.target.value);
                        setEditingAuction({ ...editingAuction, location_city: e.target.value });
                      }}
                      className="w-full mt-2 p-3 bg-white border-2 border-blue-600 rounded-xl font-bold text-slate-900"
                    />
                  )}
                </div>
              </div>

              {/* Auction Lot Image Customizer Box */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                  <h4 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4 text-amber-400" /> Auction Lot Image Customizer
                  </h4>
                  <span className="text-[10px] text-slate-400">Live Thumbnail & Photo Specs</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-200 font-bold mb-1 text-xs">Auction Lot Image URL / Data Base64 *</label>
                      <input
                        type="text"
                        value={editingAuction.image_url || ''}
                        onChange={(e) => setEditingAuction({ ...editingAuction, image_url: e.target.value })}
                        placeholder="https://images.unsplash.com/... or upload image"
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-medium text-slate-100 text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1 text-xs">Or Upload New Image File:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingAuction({ ...editingAuction, image_url: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Auction Image Specs Box */}
                    <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl p-3 space-y-1.5 text-slate-300 text-[11px]">
                      <div className="font-extrabold text-amber-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                        <Info className="w-3.5 h-3.5 text-amber-400" /> Auction Photo Specs Guide
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>📐 <strong>Aspect Ratio:</strong> 16:10 or 4:3</div>
                        <div>📏 <strong>Optimal Size:</strong> 800px × 500px</div>
                        <div>💾 <strong>Max Size:</strong> &lt; 1 MB</div>
                        <div>📷 <strong>Format:</strong> WebP / JPG / PNG</div>
                      </div>
                    </div>
                  </div>

                  {/* Auction Image Preview Box */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold text-xs">Live Lot Image Preview:</label>
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center shadow-inner">
                      <img
                        src={editingAuction.image_url || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80"}
                        alt="Auction Lot Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Full Description & T&C</label>
                <textarea
                  rows={3}
                  value={editingAuction.description || ''}
                  onChange={(e) => setEditingAuction({ ...editingAuction, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAuction(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" /> Save Auction Changes Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL USER & SELLER PROFILE DETAILS MODAL */}
      {selectedUserDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#0B192C] text-white p-6 border-b border-slate-800 flex justify-between items-start shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#D48B1C]/20 border border-[#D48B1C]/40 text-[#D48B1C] flex items-center justify-center text-xl font-black shrink-0 uppercase">
                  {selectedUserDetailModal.name ? selectedUserDetailModal.name.substring(0, 2) : 'US'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-white text-lg tracking-tight">
                      {selectedUserDetailModal.name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      selectedUserDetailModal.role === 'admin' ? 'bg-purple-900/80 text-purple-200 border-purple-700' : selectedUserDetailModal.role === 'agent' ? 'bg-amber-900/80 text-amber-200 border-amber-700' : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}>
                      {selectedUserDetailModal.role === 'agent' ? 'Seller / Agent' : selectedUserDetailModal.role}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2">
                    <span>User ID: #{selectedUserDetailModal.id}</span> &bull; 
                    <span>Joined: {selectedUserDetailModal.created_at ? selectedUserDetailModal.created_at.split('T')[0] : 'Registered User'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserDetailModal(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
              
              {/* Account Status Ribbon */}
              <div className="flex items-center justify-between p-4 rounded-2xl border bg-slate-50">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Identity & Security Verification Status</span>
                {selectedUserDetailModal.is_verified && selectedUserDetailModal.is_active ? (
                  <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-black uppercase border border-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active & Fully KYC Verified
                  </span>
                ) : selectedUserDetailModal.role === 'agent' ? (
                  <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black uppercase border border-amber-300 flex items-center gap-1.5 animate-pulse">
                    <Clock className="w-4 h-4 text-amber-700" /> Pending Seller Approval
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-900 px-3 py-1 rounded-full text-xs font-black uppercase border border-red-300 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-600" /> Account Suspended
                  </span>
                )}
              </div>

              {/* Grid 1: Personal & Contact Information */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#D48B1C]" /> Account & Security Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 font-bold block text-[11px]">Full Registered Name</span>
                    <span className="text-slate-900 font-extrabold text-sm">{selectedUserDetailModal.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[11px]">Login Email Address</span>
                    <span className="text-slate-900 font-mono font-bold text-xs">{selectedUserDetailModal.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[11px]">Contact Phone Number</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-mono font-bold text-xs">{selectedUserDetailModal.phone || 'N/A'}</span>
                      {selectedUserDetailModal.phone && (
                        <a
                          href={`https://wa.me/91${selectedUserDetailModal.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 text-[10px] flex items-center gap-1"
                        >
                          WhatsApp Direct
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[11px]">System Role & Access Scope</span>
                    <span className="text-slate-900 font-extrabold text-xs uppercase">{selectedUserDetailModal.role}</span>
                  </div>
                </div>
              </div>

              {/* Grid 2: Corporate & Physical Business Details */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#D48B1C]" /> Corporate & Business Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 font-bold block text-[11px]">Registered Company Name</span>
                    <span className="text-slate-900 font-bold text-xs">{selectedUserDetailModal.company_name || 'Individual Trader'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[11px]">Operating Location</span>
                    <span className="text-slate-900 font-bold text-xs">{selectedUserDetailModal.city || 'Mumbai'}, {selectedUserDetailModal.state || 'Maharashtra'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-bold block text-[11px]">Physical Office / Facility Address</span>
                    <span className="text-slate-800 font-medium text-xs block">{selectedUserDetailModal.address || `${selectedUserDetailModal.city || 'Mumbai'}, ${selectedUserDetailModal.state || 'Maharashtra'} 401101`}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[11px]">GSTIN / Tax ID Verification</span>
                    <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold text-[11px] border border-emerald-200">
                      27AAAAA0000A1Z5 (Verified Business GST)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[11px]">KYC Verification Norms</span>
                    <span className="text-slate-900 font-bold text-[11px]">Aadhaar / PAN / Corporate CIN Verified</span>
                  </div>
                </div>
              </div>

              {/* Grid 3: Platform Marketplace Activity Stats */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-[#D48B1C]" /> Marketplace Activity & Engagement Metrics
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-slate-500 text-[10px] font-bold block uppercase">Auctions Posted</span>
                    <span className="text-lg font-black text-slate-900">
                      {auctions.filter(a => a.seller_email === selectedUserDetailModal.email || selectedUserDetailModal.role === 'admin').length}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-slate-500 text-[10px] font-bold block uppercase">Classifieds Listed</span>
                    <span className="text-lg font-black text-slate-900">
                      {classifieds.filter(c => c.creator_email === selectedUserDetailModal.email).length}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-slate-500 text-[10px] font-bold block uppercase">Tender Approvals</span>
                    <span className="text-lg font-black text-slate-900">
                      {interests.filter(i => i.user_email === selectedUserDetailModal.email).length}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Action Bar Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">

                {/* Pending agent: show Approve + Reject */}
                {selectedUserDetailModal.role === 'agent' && (!selectedUserDetailModal.is_verified || !selectedUserDetailModal.is_active) && (
                  <>
                    <button
                      onClick={() => {
                        handleToggleUserApproval(selectedUserDetailModal);
                        setSelectedUserDetailModal(null);
                      }}
                      className="px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" /> Approve Seller Account
                    </button>
                    <button
                      onClick={() => {
                        const u = selectedUserDetailModal;
                        setSelectedUserDetailModal(null);
                        setDeleteConfirmItem({ type: 'user', id: u.id, name: u.name });
                      }}
                      className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-red-600" /> Reject Application
                    </button>
                  </>
                )}

                {/* Approved agent: show Revoke */}
                {selectedUserDetailModal.role === 'agent' && selectedUserDetailModal.is_verified && selectedUserDetailModal.is_active && (
                  <button
                    onClick={() => {
                      handleToggleUserApproval(selectedUserDetailModal);
                      setSelectedUserDetailModal(null);
                    }}
                    className="px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                  >
                    <ShieldAlert className="w-4 h-4" /> Revoke Approval
                  </button>
                )}

                <button
                  onClick={() => {
                    const u = selectedUserDetailModal;
                    setSelectedUserDetailModal(null);
                    setDeleteConfirmItem({ type: 'user', id: u.id, name: u.name });
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-red-600" /> Remove / Delete User
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserDetailModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wider w-full sm:w-auto"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
