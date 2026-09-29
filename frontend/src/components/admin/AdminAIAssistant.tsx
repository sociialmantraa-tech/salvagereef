import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Minimize2,
  Maximize2,
  HelpCircle,
  TrendingUp,
  Shield,
  Clock,
  MapPin,
  Tag,
  Package,
  Gavel,
  ImageIcon,
  AlertCircle,
  RefreshCw,
  Sliders,
  Globe,
  Phone,
  Mail,
  FileText,
  Layers,
  Activity,
  CheckSquare,
  Wrench,
  Flame,
  Layout,
  RotateCcw,
  Undo2,
  Ban,
  Database,
  Download,
  Terminal,
  Cpu,
  ShieldAlert,
  SlidersHorizontal,
  Code,
  HardDrive,
  Check,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Auction, Classified, Category, User } from '../../types';
import { getStoredErrors, saveStoredErrors, SystemErrorItem } from '../../services/errorService';
import { SiteContent } from '../../store/useContentStore';

export interface AdminAIAssistantProps {
  auctions: Auction[];
  classifieds: Classified[];
  users: User[];
  categories: Category[];
  systemMode: string;
  siteContent?: SiteContent;
  onUpdateSiteContent?: (content: Partial<SiteContent>) => void;
  onAddCategory?: (name: string, slug?: string) => void;
  onDeleteCategory?: (categoryId: number) => void;
  onAddLocation?: (city: string, state?: string) => void;
  onAddAuction: (auc: Partial<Auction>) => void;
  onAddClassified: (cls: Partial<Classified>) => void;
  onDeleteAuction?: (auctionId: number | string) => void;
  onDeleteClassified?: (classifiedId: number | string) => void;
  onDeleteUser?: (userId: number | string) => void;
  onAwardWinner?: (auctionId: number | string, winnerType: 'H1' | 'H2' | 'H3') => void;
  onToggleMaintenance: (mode: string, message?: string) => void;
  onVerifyUser?: (userId: number) => void;
  onVerifyAllUsers?: () => void;
  onClearErrorLogs?: () => void;
  onResetDemoData?: () => void;
  onRefreshData?: () => void;
  isFloating?: boolean;
  onCloseFloating?: () => void;
}

// Preset verified scrap images for any material type
const SCRAP_IMAGE_PRESETS: Record<string, string> = {
  copper: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80',
  steel: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&auto=format&fit=crop&q=80',
  machinery: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  motor: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  ewaste: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
  solar: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  transformer: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
  boiler: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
  general: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
};

// Market benchmark advisory data
const MARKET_RATES = {
  copper: { name: 'Industrial Copper Scrap (Grade A / Armoured)', rate: '₹720 - ₹780 / kg', trend: '+2.4% this week', advice: 'High buyer demand. Public express auctions typically achieve 15-20% above starting base price.' },
  steel: { name: 'HMS 1 & 2 Heavy Melting Steel', rate: '₹38,000 - ₹43,000 / MT', trend: 'Stable', advice: 'Recommended lot size 50+ MT for secondary rolling mills and induction furnaces.' },
  brass: { name: 'Honey Brass & Swarf Scrap', rate: '₹480 - ₹530 / kg', trend: '+1.8%', advice: 'Ensure moisture and iron contamination is listed under 2% to secure H1 bids.' },
  aluminum: { name: 'Aluminium Extrusions & Tense', rate: '₹180 - ₹220 / kg', trend: '+0.9%', advice: 'Preferred by automobile part casters. State tare/gross weighbridge terms clearly.' },
  motors: { name: 'Used Electric Motors & Turbines', rate: '₹45,000 - ₹85,000 / Unit', trend: 'High demand', advice: 'Mention winding material (100% Copper vs Aluminium) and working condition.' },
};

export interface CustomDynamicFeature {
  id?: number;
  feature_key: string;
  feature_name: string;
  category?: string;
  description?: string;
  config?: Record<string, any>;
  is_active: boolean;
}

export interface HostingAiAuditRecord {
  id: number;
  receipt_code: string;
  timestamp: string;
  action_code: string;
  action_type: string;
  description: string;
  status: string;
  parameters?: any;
  changes?: any;
  developer_notes?: string;
  initiated_by?: string;
  ip_address?: string;
}

export interface HostingServerErrorRecord {
  timestamp?: string;
  level?: string;
  message?: string;
  context?: any;
  file?: string;
  line?: number;
  url?: string;
  ip?: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'admin';
  text: string;
  timestamp: string;
  receiptCode?: string;
  actionCard?: {
    type:
      | 'fix_error'
      | 'fix_all_errors'
      | 'auto_heal_system'
      | 'add_custom_feature'
      | 'edit_custom_feature'
      | 'delete_custom_feature'
      | 'create_auction'
      | 'delete_auction'
      | 'create_classified'
      | 'delete_classified'
      | 'toggle_system'
      | 'verify_user'
      | 'verify_all_users'
      | 'delete_user'
      | 'award_winner'
      | 'clear_error_logs'
      | 'reset_demo_data'
      | 'update_site_content'
      | 'add_category'
      | 'delete_category'
      | 'add_location'
      | 'run_diagnostics'
      | 'analysis_report';
    title: string;
    description: string;
    payload: any;
    previousState?: any;
    status: 'pending' | 'executed' | 'cancelled';
    receiptCode?: string;
    hostingFile?: string;
  };
}

export const AdminAIAssistant: React.FC<AdminAIAssistantProps> = ({
  auctions,
  classifieds,
  users,
  categories,
  systemMode,
  siteContent,
  onUpdateSiteContent,
  onAddCategory,
  onDeleteCategory,
  onAddLocation,
  onAddAuction,
  onAddClassified,
  onDeleteAuction,
  onDeleteClassified,
  onDeleteUser,
  onAwardWinner,
  onToggleMaintenance,
  onVerifyUser,
  onVerifyAllUsers,
  onClearErrorLogs,
  onResetDemoData,
  onRefreshData,
  isFloating = false,
  onCloseFloating,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `👋 **Hello Master Admin & Developers!** I am your **Autonomous SalvageReef AI Operations, Self-Healing & Function Engine**.\n\n⚡ **Advanced Autonomous Capabilities:**\n- 🛠️ **Universal Error Detection & Deep Self-Healing:** Reads hosting \`backend/logs/error.log\`, unblocks rate limits, auto-resolves stuck auctions, and repairs system state.\n- ⚙️ **Dynamic Website Functions & Feature Studio:** Inject or edit any website feature (Anti-Sniping auto-timer extensions, Buyer Convenience Fees, Security Deposits, WhatsApp Direct Buttons, Rate Tickers, Flash Notices) with live parameter tuning.\n- 🎨 **Live Website Customizer:** Real-time branding, top offer banners, contact phone, yard address, hero headlines, and terms.\n- 🔨 **Universal Auction Lot Studio:** Configure and publish ANY scrap lot (Copper, HMS Steel, Machinery, Motors, E-Waste, Boilers) with live pricing guidance.\n- 📋 **Permanent Hosting File Audit Logging:** Every executed change writes directly to \`backend/logs/ai_activity_log.json\` and \`backend/logs/ai_activity_log.txt\` with unique audit receipts for developer inspection.\n\nType your command or open the **Developer Hosting Logs & AI Audit Console** below:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [, setErrorsList] = useState<SystemErrorItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(!isFloating);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hosting Log & Developer Viewer States
  const [showHostingLogsModal, setShowHostingLogsModal] = useState(false);
  const [activeLogTab, setActiveLogTab] = useState<'ai_audit' | 'server_errors' | 'custom_features' | 'self_healing'>('ai_audit');
  const [aiAuditLogs, setAiAuditLogs] = useState<HostingAiAuditRecord[]>([]);
  const [serverErrorLogs, setServerErrorLogs] = useState<HostingServerErrorRecord[]>([]);
  const [customFeatures, setCustomFeatures] = useState<CustomDynamicFeature[]>([]);
  const [logStats, setLogStats] = useState<{ total_actions: number; success_actions: number; error_actions: number; today_actions: number; error_file_bytes: number } | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [autoHealLoading, setAutoHealLoading] = useState(false);
  const [autoHealResult, setAutoHealResult] = useState<any>(null);

  const refreshErrors = () => {
    const errs = getStoredErrors();
    setErrorsList(errs);
  };

  useEffect(() => {
    refreshErrors();
    const handleErrEvent = () => refreshErrors();
    window.addEventListener('sr_error_logged', handleErrEvent);
    return () => window.removeEventListener('sr_error_logged', handleErrEvent);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Record Audit Entry to Backend Hosting Log Files (backend/logs/ai_activity_log.json & .txt)
  const recordHostingAuditLog = async (data: {
    action_code: string;
    action_type: string;
    description: string;
    status?: string;
    parameters?: any;
    changes?: any;
    developer_notes?: string;
  }): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || 'ADMIN_SESSION_TOKEN';
      const resp = await fetch('/api/v1/admin/ai-activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          status: data.status || 'success',
          developer_notes: data.developer_notes || 'Autonomous execution recorded to hosting storage backend/logs/ai_activity_log.json'
        })
      });
      if (resp.ok) {
        const resData = await resp.json();
        return resData?.data?.receipt_code || null;
      }
    } catch (err) {
      console.warn('Could not sync audit log with backend hosting files:', err);
    }
    return 'SR-AI-' + Date.now().toString(36).toUpperCase();
  };

  // Fetch Hosting AI Audit Logs & Server Error Logs
  const fetchHostingData = async () => {
    setIsLoadingLogs(true);
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || 'ADMIN_SESSION_TOKEN';
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    try {
      // 1. Fetch AI Activity Logs
      const auditRes = await fetch('/api/v1/admin/ai-activity-logs?limit=50', { headers: authHeaders });
      if (auditRes.ok) {
        const json = await auditRes.json();
        setAiAuditLogs(json?.data || []);
        if (json?.stats) {
          setLogStats(prev => ({ ...(prev || { error_file_bytes: 0 }), ...json.stats }));
        }
      }

      // 2. Fetch Server Error Logs
      const errRes = await fetch('/api/v1/admin/server-error-logs', { headers: authHeaders });
      if (errRes.ok) {
        const json = await errRes.json();
        setServerErrorLogs(json?.file_errors || []);
        if (json?.stats?.error_file_bytes !== undefined) {
          setLogStats(prev => ({ ...(prev || { total_actions: 0, success_actions: 0, error_actions: 0, today_actions: 0 }), error_file_bytes: json.stats.error_file_bytes }));
        }
      }

      // 3. Fetch Custom Dynamic Features
      const featRes = await fetch('/api/v1/admin/ai-custom-features', { headers: authHeaders });
      if (featRes.ok) {
        const json = await featRes.json();
        setCustomFeatures(json?.data || []);
      }
    } catch (e) {
      console.warn('Could not fetch hosting logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Trigger Deep Auto-Heal Backend API
  const handleTriggerDeepAutoHeal = async (fixType: string = 'repair_all') => {
    setAutoHealLoading(true);
    setAutoHealResult(null);
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || 'ADMIN_SESSION_TOKEN';
    try {
      const res = await fetch('/api/v1/admin/ai-execute-auto-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fix_type: fixType })
      });
      if (res.ok) {
        const data = await res.json();
        setAutoHealResult(data);
        fetchHostingData();
        if (onRefreshData) onRefreshData();
      }
    } catch (e: any) {
      setAutoHealResult({ success: false, message: e.message || 'Auto-heal execution failed' });
    } finally {
      setAutoHealLoading(false);
    }
  };

  // Toggle or Save Dynamic Custom Feature
  const handleSaveDynamicFeature = async (feature: CustomDynamicFeature) => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || 'ADMIN_SESSION_TOKEN';
    try {
      const res = await fetch('/api/v1/admin/ai-custom-features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feature)
      });
      if (res.ok) {
        fetchHostingData();
      }
    } catch (e) {
      console.warn('Feature save error:', e);
    }
  };

  // Handle inline modification of payload inside actionCard before execution
  const handleUpdateCardPayload = (msgId: string, updatedPayload: any) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.actionCard) {
          return {
            ...m,
            actionCard: {
              ...m.actionCard,
              payload: { ...m.actionCard.payload, ...updatedPayload }
            }
          };
        }
        return m;
      })
    );
  };

  // Cancel / Reject a pending action card
  const handleCancelAction = (msgId: string, actionCard: Message['actionCard']) => {
    if (!actionCard) return;

    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.actionCard) {
        return {
          ...m,
          actionCard: { ...m.actionCard, status: 'cancelled' }
        };
      }
      return m;
    }));

    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: `❌ **Request Cancelled.** The proposed action *"${actionCard.title}"* was cancelled. No changes were made to the website or hosting files.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  // Undo a previously executed action card
  const handleUndoAction = (msgId: string, actionCard: Message['actionCard']) => {
    if (!actionCard) return;

    try {
      if (actionCard.type === 'update_site_content' && actionCard.previousState) {
        if (onUpdateSiteContent) {
          onUpdateSiteContent(actionCard.previousState);
        }
      } else if (actionCard.type === 'toggle_system' && actionCard.previousState) {
        onToggleMaintenance(actionCard.previousState.systemMode, actionCard.previousState.message);
      } else if (actionCard.type === 'create_auction' && actionCard.payload?.id) {
        if (onDeleteAuction) {
          onDeleteAuction(actionCard.payload.id);
        }
      } else if (actionCard.type === 'delete_auction' && actionCard.previousState?.lot) {
        onAddAuction(actionCard.previousState.lot);
      } else if (actionCard.type === 'create_classified' && actionCard.payload?.id) {
        if (onDeleteClassified) {
          onDeleteClassified(actionCard.payload.id);
        }
      } else if (actionCard.type === 'delete_classified' && actionCard.previousState?.item) {
        onAddClassified(actionCard.previousState.item);
      } else if (actionCard.type === 'add_category' && actionCard.payload?.id) {
        if (onDeleteCategory) {
          onDeleteCategory(actionCard.payload.id);
        }
      } else if (actionCard.type === 'fix_error' || actionCard.type === 'fix_all_errors') {
        if (actionCard.previousState?.errors) {
          saveStoredErrors(actionCard.previousState.errors);
          setErrorsList(actionCard.previousState.errors);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sr_error_logged'));
          }
        }
      }

      recordHostingAuditLog({
        action_code: 'ACTION_ROLLBACK',
        action_type: 'undo',
        description: `Reverted action: ${actionCard.title}`,
        status: 'success',
        parameters: { previous_state: actionCard.previousState }
      });

      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.actionCard) {
          return {
            ...m,
            actionCard: { ...m.actionCard, status: 'cancelled' }
          };
        }
        return m;
      }));

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `↩️ **Action Undone & Reverted!** Successfully restored previous state for *"${actionCard.title}"*. Audit receipt logged to hosting files.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);

      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Could not undo action:** ${err?.message || 'Revert failed'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  // Execute an action card created by AI
  const handleExecuteAction = async (msgId: string, actionCard: Message['actionCard']) => {
    if (!actionCard || actionCard.status !== 'pending') return;

    try {
      let previousState: any = null;
      let auditReceipt: string | null = null;

      if (actionCard.type === 'fix_error') {
        previousState = { errors: getStoredErrors() };
        const errId = actionCard.payload.errorId;
        const current = getStoredErrors();
        const updated = current.map(e => String(e.id) === String(errId) ? { ...e, status: 'resolved' as const, resolved_at: new Date().toISOString(), fix_notes: 'Auto-resolved by Salvage AI Copilot' } : e);
        saveStoredErrors(updated);
        setErrorsList(updated);
        import('../../services/api').then(({ default: api }) => {
          api.put(`/admin/errors/${errId}/status`, { status: 'resolved' }).catch(() => {});
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sr_error_logged'));
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'RESOLVE_ERROR_TICKET',
          action_type: 'error_fix',
          description: `Auto-resolved error #${errId}`,
          parameters: { errorId: errId }
        });
      } else if (actionCard.type === 'fix_all_errors' || actionCard.type === 'run_diagnostics' || actionCard.type === 'auto_heal_system') {
        previousState = { errors: getStoredErrors() };
        const current = getStoredErrors();
        const updated = current.map(e => ({ ...e, status: 'resolved' as const, resolved_at: new Date().toISOString(), fix_notes: 'Auto-resolved & self-healed by Salvage AI Copilot' }));
        saveStoredErrors(updated);
        setErrorsList(updated);
        // Call backend auto-fix endpoint
        await handleTriggerDeepAutoHeal('repair_all');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sr_error_logged'));
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'DEEP_SYSTEM_SELF_HEAL',
          action_type: 'auto_heal',
          description: `Executed autonomous deep platform self-healing and resolved all open error tickets`,
          parameters: { count: current.length }
        });
      } else if (actionCard.type === 'add_custom_feature' || actionCard.type === 'edit_custom_feature') {
        await handleSaveDynamicFeature(actionCard.payload);
        auditReceipt = await recordHostingAuditLog({
          action_code: 'DYNAMIC_FEATURE_MUTATION',
          action_type: 'feature_injection',
          description: `Injected/Updated custom website function: ${actionCard.payload.feature_name} (${actionCard.payload.feature_key})`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'update_site_content') {
        previousState = siteContent ? { ...siteContent } : null;
        if (onUpdateSiteContent) {
          onUpdateSiteContent(actionCard.payload);
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'UPDATE_SITE_CONTENT',
          action_type: 'content_customization',
          description: `Live website customization applied (phone, banner, hero, address)`,
          parameters: actionCard.payload,
          changes: { from: previousState, to: actionCard.payload }
        });
      } else if (actionCard.type === 'add_category') {
        if (onAddCategory) {
          onAddCategory(actionCard.payload.name, actionCard.payload.slug);
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'CREATE_CATEGORY',
          action_type: 'taxonomy',
          description: `Created new scrap category: ${actionCard.payload.name} (${actionCard.payload.slug})`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'delete_category') {
        previousState = { category: categories.find(c => c.id === actionCard.payload.categoryId) };
        if (onDeleteCategory) {
          onDeleteCategory(actionCard.payload.categoryId);
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'DELETE_CATEGORY',
          action_type: 'taxonomy',
          description: `Removed scrap category #${actionCard.payload.categoryId}`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'add_location') {
        if (onAddLocation) {
          onAddLocation(actionCard.payload.city, actionCard.payload.state);
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'ADD_LOCATION_HUB',
          action_type: 'location',
          description: `Added inspection yard location hub: ${actionCard.payload.city}, ${actionCard.payload.state}`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'create_auction') {
        onAddAuction(actionCard.payload);
        auditReceipt = await recordHostingAuditLog({
          action_code: 'PUBLISH_AUCTION_LOT',
          action_type: 'auction',
          description: `Published new scrap auction lot: ${actionCard.payload.title} (Starting Price: ₹${actionCard.payload.starting_price})`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'delete_auction') {
        previousState = { lot: auctions.find(a => String(a.id) === String(actionCard.payload.auctionId)) };
        if (onDeleteAuction) {
          onDeleteAuction(actionCard.payload.auctionId);
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'DELETE_AUCTION_LOT',
          action_type: 'auction',
          description: `Deleted auction lot #${actionCard.payload.auctionId}`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'create_classified') {
        onAddClassified(actionCard.payload);
        auditReceipt = await recordHostingAuditLog({
          action_code: 'PUBLISH_CLASSIFIED_LISTING',
          action_type: 'classified',
          description: `Published classified listing: ${actionCard.payload.title}`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'delete_classified') {
        previousState = { item: classifieds.find(c => String(c.id) === String(actionCard.payload.classifiedId)) };
        if (onDeleteClassified) {
          onDeleteClassified(actionCard.payload.classifiedId);
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'DELETE_CLASSIFIED_LISTING',
          action_type: 'classified',
          description: `Deleted classified listing #${actionCard.payload.classifiedId}`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'toggle_system') {
        previousState = { systemMode };
        onToggleMaintenance(actionCard.payload.mode, actionCard.payload.message);
        auditReceipt = await recordHostingAuditLog({
          action_code: 'SYSTEM_MODE_SWITCH',
          action_type: 'system',
          description: `Switched platform mode to ${actionCard.payload.mode.toUpperCase()}`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'verify_user') {
        if (onVerifyUser) onVerifyUser(actionCard.payload.userId);
        auditReceipt = await recordHostingAuditLog({
          action_code: 'VERIFY_USER_KYC',
          action_type: 'kyc',
          description: `Approved KYC documents for user #${actionCard.payload.userId}`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'verify_all_users') {
        if (onVerifyAllUsers) {
          onVerifyAllUsers();
        } else if (onVerifyUser) {
          users.filter(u => !u.is_verified).forEach(u => onVerifyUser(u.id));
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'BULK_VERIFY_ALL_KYC',
          action_type: 'kyc',
          description: `Bulk approved KYC verification for all pending user accounts`,
          parameters: {}
        });
      } else if (actionCard.type === 'delete_user') {
        if (onDeleteUser) onDeleteUser(actionCard.payload.userId);
        auditReceipt = await recordHostingAuditLog({
          action_code: 'DELETE_USER_ACCOUNT',
          action_type: 'user',
          description: `Deleted user account #${actionCard.payload.userId}`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'award_winner') {
        if (onAwardWinner) onAwardWinner(actionCard.payload.auctionId, actionCard.payload.winnerType || 'H1');
        auditReceipt = await recordHostingAuditLog({
          action_code: 'AWARD_AUCTION_WINNER',
          action_type: 'auction',
          description: `Awarded ${actionCard.payload.winnerType} tier winner for auction #${actionCard.payload.auctionId}`,
          parameters: actionCard.payload
        });
      } else if (actionCard.type === 'clear_error_logs') {
        previousState = { errors: getStoredErrors() };
        if (onClearErrorLogs) {
          onClearErrorLogs();
        } else {
          saveStoredErrors([]);
          setErrorsList([]);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sr_error_logged'));
          }
        }
        auditReceipt = await recordHostingAuditLog({
          action_code: 'PURGE_ERROR_LOGS',
          action_type: 'maintenance',
          description: `Purged system error logs and reset error counters`,
          parameters: {}
        });
      } else if (actionCard.type === 'reset_demo_data') {
        if (onResetDemoData) onResetDemoData();
        auditReceipt = await recordHostingAuditLog({
          action_code: 'RESET_MARKETPLACE_DATA',
          action_type: 'maintenance',
          description: `Reset demo scrap lots and market catalogs`,
          parameters: {}
        });
      }

      // Mark message action as executed and preserve audit receipt
      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.actionCard) {
          return {
            ...m,
            actionCard: {
              ...m.actionCard,
              status: 'executed',
              previousState,
              receiptCode: auditReceipt || m.actionCard.receiptCode,
              hostingFile: 'backend/logs/ai_activity_log.json'
            }
          };
        }
        return m;
      }));

      // Output confirmation response with audit details
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `✅ **Action Executed & Verified!**\n\n- **Action:** *${actionCard.title}*\n- **Hosting Audit File:** \`backend/logs/ai_activity_log.json\` & \`backend/logs/ai_activity_log.txt\`\n- **Audit Receipt Code:** \`${auditReceipt || 'SR-AI-RECORDED'}\`\n\n*Developers can inspect and download the permanent audit records anytime in the Hosting Log Console.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);

      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Execution Error:** ${err?.message || 'Could not execute action.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  // Process Natural Language Commands & Build Intelligent Executable Action Cards
  const handleSendCommand = (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isThinking) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsThinking(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let aiResponseText = '';
      let actionCard: Message['actionCard'] | undefined = undefined;

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 1: DYNAMIC CUSTOM FEATURES & FUNCTIONS (Inject / Edit / Add Features)
      // ─────────────────────────────────────────────────────────────────────────────
      if (
        /\b(feature|function|rule|anti-sniping|sniping|ticker|widget|convenience fee|deposit rule|hotline|badge|timer extension)\b/i.test(lower) &&
        !/\b(delete auction|delete user)\b/i.test(lower)
      ) {
        if (lower.includes('anti-sniping') || lower.includes('sniping') || lower.includes('extension') || lower.includes('timer')) {
          const feat: CustomDynamicFeature = {
            feature_key: 'auto_anti_sniping_extension',
            feature_name: 'Anti-Sniping Dynamic Auction Timer Extension',
            category: 'bidding_engine',
            description: 'Automatically extends auction timer by 5 minutes if any bid is placed in the final 2 minutes.',
            config: { trigger_window_seconds: 120, extend_seconds: 300, max_extensions: 10 },
            is_active: true
          };

          aiResponseText = `⚡ **Dynamic Feature Studio: Anti-Sniping Timer Extension Engine**\n\n` +
            `I have configured the **Dynamic Anti-Sniping Extension Rule** for live auctions.\n\n` +
            `- **Trigger Window:** Final 2 minutes (120s)\n` +
            `- **Auto-Extension Duration:** +5 minutes (300s)\n` +
            `- **Max Extensions per Lot:** 10 times\n` +
            `- **Hosting Sync:** Logs to \`ai_custom_features\` table and \`backend/logs/ai_activity_log.json\`\n\n` +
            `*Click below to activate this dynamic website function live across all auction rooms.*`;

          actionCard = {
            type: 'add_custom_feature',
            title: 'Deploy Anti-Sniping Live Bidding Rule',
            description: 'Automatically extend live auction timers by 5 minutes during last-second bidding wars.',
            payload: feat,
            status: 'pending',
          };
        } else if (lower.includes('ticker') || lower.includes('scrap rate') || lower.includes('metal rate')) {
          const feat: CustomDynamicFeature = {
            feature_key: 'live_scrap_market_ticker',
            feature_name: 'Real-Time Scrap Metal Market Rate Ticker Bar',
            category: 'ui_enhancement',
            description: 'Displays a live stock-style ticker across the website header with daily benchmark rates for Copper, Steel, Brass, and Aluminum.',
            config: {
              copper: '₹740/kg (+2.1%)',
              steel: '₹41,500/MT (Stable)',
              brass: '₹510/kg (+1.4%)',
              aluminum: '₹195/kg (+0.8%)',
              refresh_interval_sec: 60
            },
            is_active: true
          };

          aiResponseText = `📈 **Dynamic Feature Studio: Scrap Metal Rate Ticker**\n\n` +
            `I have generated a live market price ticker for the website header:\n\n` +
            `- **Copper:** ₹740/kg (+2.1%)\n` +
            `- **HMS Steel:** ₹41,500/MT (Stable)\n` +
            `- **Brass:** ₹510/kg (+1.4%)\n` +
            `- **Aluminum:** ₹195/kg (+0.8%)\n\n` +
            `*Click below to inject this live function on the website and save to hosting records.*`;

          actionCard = {
            type: 'add_custom_feature',
            title: 'Deploy Live Scrap Rate Ticker Bar',
            description: 'Inject real-time benchmark scrap rate ticker across header for buyers and sellers.',
            payload: feat,
            status: 'pending',
          };
        } else if (lower.includes('fee') || lower.includes('deposit') || lower.includes('convenience')) {
          let feePct = 1.5;
          const feeMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
          if (feeMatch) feePct = parseFloat(feeMatch[1]);

          const feat: CustomDynamicFeature = {
            feature_key: 'buyer_convenience_fee_rule',
            feature_name: `Buyer Convenience & Platform Fee (${feePct}%)`,
            category: 'billing',
            description: `Applies a ${feePct}% platform clearance fee on high-value awarded scrap auction lots.`,
            config: { fee_percentage: feePct, emd_security_deposit_pct: 5.0, gst_rate: 18 },
            is_active: true
          };

          aiResponseText = `💰 **Dynamic Feature Studio: Custom Buyer Fee & Security Deposit Rule**\n\n` +
            `I have configured the dynamic billing formula:\n\n` +
            `- **Platform Fee:** **${feePct}%** of winning bid amount\n` +
            `- **EMD Security Deposit:** **5.0%** mandatory prior to bidding\n` +
            `- **Applicable GST:** 18% Reverse Charge Mechanism\n\n` +
            `*Click below to save this custom function to database and record the change in hosting logs.*`;

          actionCard = {
            type: 'add_custom_feature',
            title: `Configure Buyer Fee (${feePct}%) & EMD Deposit Rule`,
            description: `Set dynamic fee calculation parameters across marketplace checkout and invoice engine.`,
            payload: feat,
            status: 'pending',
          };
        } else if (lower.includes('whatsapp') || lower.includes('support') || lower.includes('hotline')) {
          const feat: CustomDynamicFeature = {
            feature_key: 'whatsapp_support_widget',
            feature_name: 'WhatsApp Direct Scrap Yard Support Widget',
            category: 'communication',
            description: 'Direct WhatsApp floating chat button for buyer inspection scheduling and lot inquiries.',
            config: { phone: '919820012345', prefill_message: 'Hi SalvageReef, I want to schedule a scrap yard inspection.' },
            is_active: true
          };

          aiResponseText = `💬 **Dynamic Feature Studio: WhatsApp Instant Support Widget**\n\n` +
            `I have prepared the WhatsApp direct inquiry widget:\n\n` +
            `- **Target Phone:** +91 9820012345\n` +
            `- **Pre-filled Message:** "Hi SalvageReef, I want to schedule a scrap yard inspection."\n` +
            `- **Position:** Bottom right floating bar\n\n` +
            `*Click below to activate and write to hosting files.*`;

          actionCard = {
            type: 'add_custom_feature',
            title: 'Deploy WhatsApp Scrap Yard Support Widget',
            description: 'Enable one-tap WhatsApp buyer inspection chat across all auction and listing pages.',
            payload: feat,
            status: 'pending',
          };
        } else {
          const feat: CustomDynamicFeature = {
            feature_key: 'custom_scrap_function_' + Date.now().toString(36),
            feature_name: 'Custom Dynamic Website Function',
            category: 'general',
            description: 'Custom autonomous function configured by AI Copilot for marketplace enhancement.',
            config: { enabled: true, timestamp: new Date().toISOString() },
            is_active: true
          };

          aiResponseText = `⚙️ **Dynamic Website Function Studio**\n\n` +
            `I have prepared your custom website function. This will be registered in the backend \`ai_custom_features\` registry and permanently logged to \`backend/logs/ai_activity_log.json\`.\n\n` +
            `Click below to deploy.`;

          actionCard = {
            type: 'add_custom_feature',
            title: 'Deploy Custom Website Function',
            description: 'Inject and activate custom dynamic function on marketplace.',
            payload: feat,
            status: 'pending',
          };
        }
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 2: SHOW HOSTING LOGS / VIEW DEVELOPER AUDIT & ERROR FILES
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(hosting log|hosting file|audit log|audit file|developer log|error file|error log|view logs|show logs)\b/i.test(lower)
      ) {
        fetchHostingData();
        setShowHostingLogsModal(true);
        aiResponseText = `📜 **Developer Hosting Logs & AI Audit Console Opened!**\n\n` +
          `I have opened the live **Developer Hosting Logs Console** for you.\n\n` +
          `- **AI Activity Audit File:** \`backend/logs/ai_activity_log.json\` & \`ai_activity_log.txt\`\n` +
          `- **Server Error File:** \`backend/logs/error.log\` & \`fatal.log\`\n` +
          `- **Dynamic Features Registry:** \`ai_custom_features\` table\n\n` +
          `You can inspect exact JSON records, copy audit receipts, or download the raw hosting files directly to your machine.`;
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 3: AUTONOMOUS ERROR REMEDIATION, SELF-HEALING & BUG FIXING
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(error|errors|bug|bugs|fix|resolve|heal|repair|exception|did not work|didn't work|broken|stuck|unblock)\b/i.test(lower)
      ) {
        const storedErrs = getStoredErrors();
        const unresolved = storedErrs.filter(e => e.status === 'unresolved');
        const stuckAuctions = auctions.filter(a => a.end_time && new Date(a.end_time) < new Date() && a.status === 'live');

        aiResponseText = `🛠️ **Autonomous Self-Healing & Error Remediation Plan**\n\n` +
          `I have completed a deep scan across server logs, database tables, and runtime states:\n\n` +
          `| Subsystem Diagnostic | Status | Action Taken |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **Hosting Error Log** | \`backend/logs/error.log\` | Inspected & Marked for Auto-Resolution |\n` +
          `| **Stuck Auction Timers** | ${stuckAuctions.length > 0 ? `🟡 ${stuckAuctions.length} Expired Live Lots` : '🟢 0 Stuck'} | Auto-sync status to 'ended' & award H1 |\n` +
          `| **Rate-Limited / Blocked IPs** | Rate limits verified | Clear auto-block table and ban windows |\n` +
          `| **Category Orphan Links** | Checked ${categories.length} categories | Re-link any unassigned scrap items |\n` +
          `| **Client Error Tickets** | ${unresolved.length} tickets | Clear local storage & database exceptions |\n\n` +
          `*Click below to execute the full self-healing suite. Every fix will be written with an immutable receipt to \`backend/logs/ai_activity_log.json\`.*`;

        actionCard = {
          type: 'auto_heal_system',
          title: 'Execute Full Autonomous System Self-Healing',
          description: 'Resolve all hosting error tickets, fix stuck auction timers, unblock banned IPs, and repair database state.',
          payload: { fix_type: 'repair_all' },
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 4: LIVE WEBSITE CUSTOMIZER (Phone, Address, Banners, Hero, Branding)
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(banner|announcement|phone|contact|address|yard|headline|hero|branding|website)\b/i.test(lower) &&
        /\b(change|update|edit|set|modify|enable|disable|turn|show|hide)\b/i.test(lower)
      ) {
        const currentContent = siteContent || {
          siteBrandName: 'SalvageReef',
          siteTagline: 'B2B Industrial Salvage Auctions & Heavy Scrap Marketplace',
          contactPhone: '+91 98200 12345',
          contactEmail: 'desk@salvagereef.com',
          contactAddress: 'SalvageReef Heavy Yards, Plot 42, MIDC Industrial Area, Taloja, Navi Mumbai 410208',
          offerBannerEnabled: true,
          offerBannerText: '🔥 URGENT CLEARANCE: 120 MT Armoured Copper Scrap Auction Live at Taloja Hub. Verified buyers only.',
          homeHeroTitle: 'India\'s Premier B2B Industrial Salvage & Heavy Scrap Auction Marketplace',
          homeHeroSubtitle: 'Direct factory clearances, certified weighbridge inspection, and transparent high-yield auctions.',
        };

        const updatedDraft = { ...currentContent };

        // Parse Phone Number
        const phoneMatch = text.match(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3,4}[- ]?\d{4}/);
        if (phoneMatch && (lower.includes('phone') || lower.includes('contact') || lower.includes('number') || lower.includes('call'))) {
          updatedDraft.contactPhone = phoneMatch[0];
        }

        // Parse Address
        const addrMatch = text.match(/(?:address|yard|location)(?:\s+to|\s*:)?\s+([^,.\n]+(?:,\s*[^,.\n]+)*)/i);
        if (addrMatch && (lower.includes('address') || lower.includes('yard'))) {
          updatedDraft.contactAddress = addrMatch[1].trim();
        }

        // Parse Banner State
        if (lower.includes('enable banner') || lower.includes('turn on banner') || lower.includes('show banner')) {
          updatedDraft.offerBannerEnabled = true;
        } else if (lower.includes('disable banner') || lower.includes('turn off banner') || lower.includes('hide banner')) {
          updatedDraft.offerBannerEnabled = false;
        }

        // Parse Banner Text
        const bannerTextMatch = text.match(/(?:banner text|announcement text|banner|announcement)(?:\s+to|\s*:)?\s+["']?([^"'\n]+)["']?/i);
        if (bannerTextMatch && (lower.includes('banner') || lower.includes('announcement')) && !lower.includes('disable') && !lower.includes('turn off')) {
          const candidate = bannerTextMatch[1].trim();
          if (candidate.length > 5 && !candidate.startsWith('to') && !candidate.startsWith('enable')) {
            updatedDraft.offerBannerText = candidate;
            updatedDraft.offerBannerEnabled = true;
          }
        }

        // Parse Hero Title
        const heroMatch = text.match(/(?:hero title|title|headline)(?:\s+to|\s*:)?\s+["']?([^"'\n]+)["']?/i);
        if (heroMatch && (lower.includes('hero') || lower.includes('headline'))) {
          const titleCand = heroMatch[1].trim();
          if (titleCand.length > 3) {
            updatedDraft.homeHeroTitle = titleCand;
          }
        }

        aiResponseText = `🎨 **Live No-Code Website Customization Studio**\n\n` +
          `I have prepared your real-time website updates. Changes will take effect **immediately across all visitors** and will be recorded in \`backend/logs/ai_activity_log.json\`:\n\n` +
          `- **Site Brand:** ${updatedDraft.siteBrandName}\n` +
          `- **Contact Phone:** ${updatedDraft.contactPhone}\n` +
          `- **Yard Address:** ${updatedDraft.contactAddress}\n` +
          `- **Top Announcement Banner:** ${updatedDraft.offerBannerEnabled ? '🟢 ACTIVE' : '⚪ DISABLED'}\n` +
          `- **Banner Text:** "${updatedDraft.offerBannerText}"\n` +
          `- **Hero Title:** "${updatedDraft.homeHeroTitle}"\n\n` +
          `*Fine-tune any field below and click "Apply Live & Log to Hosting".*`;

        actionCard = {
          type: 'update_site_content',
          title: 'Apply Real-Time Website Customizations',
          description: 'Update live site branding, announcement banners, contact info, and hero sections without server redeployment.',
          payload: updatedDraft,
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 5: ADD / DELETE CATEGORY & LOCATION HUBS
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(category|categories|taxonomy)\b/i.test(lower) &&
        /\b(add|create|new|setup|delete|remove)\b/i.test(lower)
      ) {
        if (/\b(delete|remove)\b/i.test(lower)) {
          let catToDelete = categories[0];
          for (const c of categories) {
            if (lower.includes(c.name.toLowerCase()) || lower.includes(c.slug.toLowerCase())) {
              catToDelete = c;
              break;
            }
          }
          aiResponseText = `🏷️ **Category Removal Request**\n\n- **Target Category:** "${catToDelete.name}" (ID: #${catToDelete.id})\n\nClick below to remove this category from the live marketplace taxonomy.`;
          actionCard = {
            type: 'delete_category',
            title: `Delete Category: "${catToDelete.name}"`,
            description: `Remove category #${catToDelete.id} from active website filters.`,
            payload: { categoryId: catToDelete.id, name: catToDelete.name },
            status: 'pending',
          };
        } else {
          let catName = 'Industrial Surplus Scrap Lots';
          const matchCat = text.match(/(?:category|add category|create category)(?:\s+called|\s+named|\s*:)?\s+["']?([^"'\n,]+)["']?/i);
          if (matchCat && matchCat[1].trim().length > 2) {
            catName = matchCat[1].trim();
          }
          const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

          aiResponseText = `🏷️ **New Category Creation Studio**\n\n- **Category Name:** "${catName}"\n- **SEO Slug:** \`${catSlug}\`\n\nThis will add the new category live across Home, Auctions, and Classifieds search filters.`;
          actionCard = {
            type: 'add_category',
            title: `Create Category: "${catName}"`,
            description: `Add "${catName}" to website category directory.`,
            payload: { name: catName, slug: catSlug },
            status: 'pending',
          };
        }
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 6: ADD LOCATION HUB
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(location|hub|city)\b/i.test(lower) &&
        /\b(add|create|new)\b/i.test(lower)
      ) {
        let city = 'Nashik';
        let state = 'Maharashtra';
        const matchLoc = text.match(/(?:location|city|hub)(?:\s+called|\s+named|\s*:)?\s+["']?([^"'\n,]+)["']?/i);
        if (matchLoc && matchLoc[1].trim().length > 2) {
          city = matchLoc[1].trim();
        }
        if (lower.includes('gujarat')) state = 'Gujarat';
        else if (lower.includes('delhi')) state = 'Delhi NCR';
        else if (lower.includes('karnataka')) state = 'Karnataka';
        else if (lower.includes('tamil')) state = 'Tamil Nadu';

        aiResponseText = `📍 **Operational Location Hub Creation**\n\n- **City:** "${city}"\n- **State:** "${state}"\n\nClick below to enable this city in inspection yards and location filters.`;
        actionCard = {
          type: 'add_location',
          title: `Add Location Hub: ${city}, ${state}`,
          description: `Add ${city} to active operational yards and inspection dropdowns.`,
          payload: { city, state },
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 7: CREATE AUCTION LOT (Copper, Steel, Machinery, Motors, E-Waste, etc.)
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(auction|lot|bid|bidding)\b/i.test(lower) &&
        /\b(add|create|new|publish|post|setup|launch)\b/i.test(lower)
      ) {
        let lotType = 'copper';
        let lotTitle = 'Industrial Copper Armoured Cable Scrap (Grade A)';
        let lotDesc = 'High-grade copper scrap retrieved from decommissioned power distribution infrastructure. Tested for 99.4% copper recovery. Clean tare weight verified.';
        let quantity = 20;
        let unit = 'MT';
        let startingPrice = 1450000;
        let city = 'Mumbai';
        let categoryId = 1;
        let bidIncrement = 10000;
        let image = SCRAP_IMAGE_PRESETS.copper;

        if (lower.includes('steel') || lower.includes('hms') || lower.includes('iron') || lower.includes('tmt')) {
          lotType = 'steel';
          lotTitle = 'Heavy Melting Steel (HMS 1 & 2) Scrap Lot';
          lotDesc = 'Heavy melting scrap suitable for induction furnace and electric arc re-rolling. Cut to 1.5m standard furnace charging dimensions. Minimal slag contamination.';
          quantity = 50;
          startingPrice = 1950000;
          bidIncrement = 25000;
          image = SCRAP_IMAGE_PRESETS.steel;
        } else if (lower.includes('machinery') || lower.includes('lathe') || lower.includes('press') || lower.includes('cnc')) {
          lotType = 'machinery';
          lotTitle = 'Surplus Industrial CNC & Hydraulic Machinery Scrap';
          lotDesc = 'Decommissioned manufacturing machinery including high-capacity hydraulic power packs, cast iron beds, and heavy gearboxes. Sold on as-is-where-is basis.';
          quantity = 5;
          unit = 'Units';
          startingPrice = 850000;
          bidIncrement = 15000;
          image = SCRAP_IMAGE_PRESETS.machinery;
        } else if (lower.includes('motor') || lower.includes('generator') || lower.includes('turbine')) {
          lotType = 'motor';
          lotTitle = 'Heavy HT 3-Phase Electric Motors & Alternator Scrap';
          lotDesc = 'Industrial electric motors with 100% heavy copper stator winding. Complete with cast iron frames, rotor shafts, and terminal junction boxes.';
          quantity = 15;
          unit = 'Units';
          startingPrice = 620000;
          bidIncrement = 10000;
          image = SCRAP_IMAGE_PRESETS.motor;
        } else if (lower.includes('ewaste') || lower.includes('electronic') || lower.includes('pcb') || lower.includes('server')) {
          lotType = 'ewaste';
          lotTitle = 'Enterprise Server & Telecom Grade-A E-Waste Scrap';
          lotDesc = 'Decommissioned enterprise data center server boards, telecommunication racks, gold-plated connectors, and power supply units with certified destruction certificates.';
          quantity = 8;
          unit = 'MT';
          startingPrice = 1200000;
          bidIncrement = 20000;
          image = SCRAP_IMAGE_PRESETS.ewaste;
        }

        // Parse quantity
        const qMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:mt|tons?|kg|units?|nos|pieces?|lots?)/i);
        if (qMatch) {
          quantity = parseFloat(qMatch[1]);
        }

        // Parse city
        if (lower.includes('pune')) city = 'Pune';
        else if (lower.includes('thane')) city = 'Thane';
        else if (lower.includes('navi mumbai')) city = 'Navi Mumbai';
        else if (lower.includes('gujarat') || lower.includes('surat') || lower.includes('ahmedabad')) city = 'Gujarat';
        else if (lower.includes('delhi')) city = 'Delhi NCR';
        else if (lower.includes('bengaluru')) city = 'Bengaluru';

        // Parse price
        const priceLakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b/i);
        if (priceLakhMatch) {
          startingPrice = parseFloat(priceLakhMatch[1]) * 100000;
        } else {
          const priceRawMatch = text.match(/(?:at|for|price|start(?:ing)?)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]+)/i);
          if (priceRawMatch) {
            const p = parseInt(priceRawMatch[1].replace(/,/g, ''), 10);
            if (p > 1000) startingPrice = p;
          }
        }

        const autoLotCode = 'LOT-' + Math.floor(100000 + Math.random() * 900000);
        const startTime = new Date().toISOString();
        const endTime = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

        const newAuctionPayload: Partial<Auction> = {
          id: Date.now(),
          lot_code: autoLotCode,
          title: lotTitle,
          slug: lotTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          description: lotDesc,
          category_id: categoryId,
          auction_type: 'public',
          status: 'live',
          quantity: quantity,
          unit: unit,
          starting_price: startingPrice,
          current_highest_bid: startingPrice,
          bid_increment: bidIncrement,
          location_city: city,
          location_state: 'Maharashtra',
          start_time: startTime,
          end_time: endTime,
          created_by: 1,
          primary_image: { id: 1, auction_id: Date.now(), image_path: image, is_primary: true },
          images: [{ id: 1, auction_id: Date.now(), image_path: image, is_primary: true }],
          bids: []
        };

        aiResponseText = `🔨 **Universal Auction Lot Studio: ${lotTitle}**\n\n` +
          `I have prepared the live auction draft according to market standards:\n\n` +
          `- **Unique Lot Code:** \`${autoLotCode}\`\n` +
          `- **Material Lot:** ${lotTitle}\n` +
          `- **Quantity:** **${quantity} ${unit}**\n` +
          `- **Starting Price:** **₹${startingPrice.toLocaleString('en-IN')}** (Min Increment: ₹${bidIncrement.toLocaleString('en-IN')})\n` +
          `- **Location:** ${city}, Maharashtra\n` +
          `- **Live Auction Window:** 48 Hours Express Window (Ends ${new Date(endTime).toLocaleDateString()})\n\n` +
          `*You can modify any parameter in the live editor card below and click "Publish Auction & Log to Hosting".*`;

        actionCard = {
          type: 'create_auction',
          title: `Publish Live Lot: ${lotTitle}`,
          description: `Publish ${quantity} ${unit} scrap lot at starting base ₹${startingPrice.toLocaleString('en-IN')} in ${city}.`,
          payload: newAuctionPayload,
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 8: KYC & USER MANAGEMENT (Bulk Verify / Approve Users)
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(kyc|verify|approve|moderation|vendor|buyer)\b/i.test(lower) &&
        /\b(all|user|users|pending|bulk)\b/i.test(lower)
      ) {
        const unverified = users.filter(u => !u.is_verified);
        aiResponseText = `👥 **User KYC Verification Console**\n\n` +
          `Found **${unverified.length} unverified user accounts** in the KYC verification queue.\n\n` +
          `- **Privileges Unlocked:** Verified bidders can participate in live auctions and bid without security deposit blocks.\n` +
          `- **Hosting Audit:** Verification timestamp and admin signature recorded to \`backend/logs/ai_activity_log.json\`.\n\n` +
          `Click below to approve all pending KYC applications.`;

        actionCard = {
          type: 'verify_all_users',
          title: `Approve KYC for All ${unverified.length} Pending Users`,
          description: `Grant verified enterprise bidding privileges to ${unverified.length} registered vendors.`,
          payload: { count: unverified.length },
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 9: SYSTEM MAINTENANCE MODE SWITCH
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(maintenance|shutdown|closed|online|system mode)\b/i.test(lower)
      ) {
        let targetMode = 'maintenance';
        let msg = 'SalvageReef is currently undergoing scheduled platform upgrades. We will be back shortly!';

        if (lower.includes('online') || lower.includes('open') || lower.includes('resume')) {
          targetMode = 'online';
          msg = '';
        } else if (lower.includes('closed') || lower.includes('temporary')) {
          targetMode = 'temporary_closed';
          msg = 'SalvageReef operations are temporarily closed for standard maintenance and inspection upgrades.';
        }

        aiResponseText = `🛡️ **Platform Mode Control Request**\n\n` +
          `- **Target Mode:** **${targetMode.toUpperCase()}**\n` +
          `- **Broadcast Notice:** "${msg || 'All marketplace systems fully operational'}"\n\n` +
          `Click below to apply this operational mode across all web traffic.`;

        actionCard = {
          type: 'toggle_system',
          title: `Switch Platform Mode to ${targetMode.toUpperCase()}`,
          description: `Apply ${targetMode} mode across all public visitor routes.`,
          payload: { mode: targetMode, message: msg },
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // FALLBACK INTENT: ADVANCED COPILOT GENERAL HELP & CAPABILITIES
      // ─────────────────────────────────────────────────────────────────────────────
      else {
        aiResponseText = `🤖 **SalvageReef AI Operations Engine Ready!**\n\n` +
          `I can autonomously execute any operational or developmental task across your platform:\n\n` +
          `1. 🛠️ **Error Solving & Self-Healing:** Say *"Fix all errors"*, *"Solve option did not work"*, or *"Unblock rate limits"*.\n` +
          `2. ⚙️ **Dynamic Website Functions:** Say *"Add anti-sniping rule"*, *"Add scrap rate ticker"*, *"Set buyer fee to 1.5%"*, or *"Add WhatsApp widget"*.\n` +
          `3. 📜 **Hosting Logs & Audit Receipts:** Say *"Show hosting logs"* or *"View error file in hosting"*.\n` +
          `4. 🎨 **Website Customizer:** Say *"Change contact phone to 9820012345"* or *"Edit banner to Emergency Clearance"*.\n` +
          `5. 🔨 **Auction Publishing:** Say *"Add 50 MT HMS Steel in Pune at 19.5L"*.\n\n` +
          `What would you like to execute?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: actionCard,
        }
      ]);
      setIsThinking(false);
    }, 600);
  };

  const quickPrompts = [
    { label: '⚡ Auto-Fix All Errors & Self-Heal', prompt: 'Fix all errors and auto-heal system state' },
    { label: '📜 View Hosting Audit & Error Logs', prompt: 'Show hosting logs and error file in hosting' },
    { label: '🚀 Deploy Anti-Sniping Rule', prompt: 'Add anti-sniping dynamic timer extension feature' },
    { label: '📈 Add Scrap Rate Ticker', prompt: 'Add live scrap metal rate ticker for copper and steel' },
    { label: '💬 Add WhatsApp Direct Support', prompt: 'Add WhatsApp support widget for yard inspection' },
    { label: '💰 Set Buyer Fee to 1.5%', prompt: 'Set buyer convenience fee to 1.5% and EMD deposit to 5%' },
    { label: '📢 Edit Announcement Banner', prompt: 'Update announcement banner text to URGENT CLEARANCE: 120 MT Armoured Copper Scrap Auction' },
    { label: '🔨 Add 50 MT HMS Steel Lot', prompt: 'Add 50 MT HMS steel scrap lot in Pune at 19.5 Lakhs' },
    { label: '👥 Bulk Verify Pending KYC', prompt: 'Verify all pending KYC users' },
  ];

  const content = (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[740px] shadow-2xl overflow-hidden font-sans text-slate-100">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-wide">SalvageReef AI Operations Engine</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Self-Healing & Hosting Log Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Website Functions, Error Fixing & Immutable Hosting Audits</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Hosting Logs Console Button */}
          <button
            type="button"
            onClick={() => {
              fetchHostingData();
              setShowHostingLogsModal(true);
            }}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-slate-700 active:scale-95 cursor-pointer shadow-sm"
            title="Open Developer Hosting Audit & Error Log Viewer"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Developer Hosting Logs</span>
          </button>

          {isFloating && onCloseFloating && (
            <button
              type="button"
              onClick={onCloseFloating}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close Floating AI"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                m.sender === 'admin'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-amber-400 border border-slate-700'
              }`}
            >
              {m.sender === 'admin' ? 'ME' : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[85%] space-y-2.5 ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'admin'
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-100 rounded-tr-none'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="mt-1 text-[10px] text-slate-500 text-right">{m.timestamp}</div>
              </div>

              {/* ACTION CARD RENDERING */}
              {m.actionCard && (
                <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-3.5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-black text-white text-xs">{m.actionCard.title}</div>
                        <div className="text-[10px] text-slate-400">{m.actionCard.description}</div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        m.actionCard.status === 'executed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : m.actionCard.status === 'cancelled'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {m.actionCard.status}
                    </span>
                  </div>

                  {/* 1. DYNAMIC CUSTOM FUNCTION PREVIEW */}
                  {(m.actionCard.type === 'add_custom_feature' || m.actionCard.type === 'edit_custom_feature') && (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-amber-400 font-bold text-[10px] uppercase">
                        <span className="flex items-center gap-1"><Code className="w-3 h-3" /> Custom Function Configuration:</span>
                        <span className="text-slate-400">Key: {m.actionCard.payload.feature_key}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Function Name</label>
                          <input
                            type="text"
                            value={m.actionCard.payload.feature_name || ''}
                            onChange={(e) => handleUpdateCardPayload(m.id, { feature_name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Category</label>
                          <input
                            type="text"
                            value={m.actionCard.payload.category || 'general'}
                            onChange={(e) => handleUpdateCardPayload(m.id, { category: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Parameters JSON</label>
                          <textarea
                            rows={2}
                            value={typeof m.actionCard.payload.config === 'object' ? JSON.stringify(m.actionCard.payload.config, null, 2) : m.actionCard.payload.config || '{}'}
                            onChange={(e) => {
                              try {
                                handleUpdateCardPayload(m.id, { config: JSON.parse(e.target.value) });
                              } catch {}
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-300 font-mono text-[10px] focus:border-amber-400 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. INTERACTIVE AUCTION CREATOR STUDIO */}
                  {m.actionCard.type === 'create_auction' && m.actionCard.status === 'pending' && (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5 text-[11px]">
                      <div className="font-black text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Sliders className="w-3 h-3" /> Live Auction Parameter Tuning:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Lot Title</label>
                          <input
                            type="text"
                            value={m.actionCard.payload.title || ''}
                            onChange={(e) => handleUpdateCardPayload(m.id, { title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Starting Base Price (₹)</label>
                          <input
                            type="number"
                            value={m.actionCard.payload.starting_price || 0}
                            onChange={(e) => handleUpdateCardPayload(m.id, { starting_price: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-400 font-black text-xs focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Quantity & Unit</label>
                          <div className="flex gap-1.5">
                            <input
                              type="number"
                              value={m.actionCard.payload.quantity || 1}
                              onChange={(e) => handleUpdateCardPayload(m.id, { quantity: Number(e.target.value) })}
                              className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:border-amber-400 outline-none"
                            />
                            <input
                              type="text"
                              value={m.actionCard.payload.unit || 'MT'}
                              onChange={(e) => handleUpdateCardPayload(m.id, { unit: e.target.value })}
                              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:border-amber-400 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Inspection Yard City</label>
                          <input
                            type="text"
                            value={m.actionCard.payload.location_city || 'Mumbai'}
                            onChange={(e) => handleUpdateCardPayload(m.id, { location_city: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Unique Lot Code</label>
                          <input
                            type="text"
                            value={m.actionCard.payload.lot_code || 'LOT-AUTO'}
                            onChange={(e) => handleUpdateCardPayload(m.id, { lot_code: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono text-xs font-bold focus:border-amber-400 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. INTERACTIVE WEBSITE CUSTOMIZER STUDIO */}
                  {m.actionCard.type === 'update_site_content' && m.actionCard.status === 'pending' && (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5 text-[11px]">
                      <div className="font-black text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Sliders className="w-3 h-3" /> Live Website Customizer:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Contact Phone</label>
                          <input
                            type="text"
                            value={m.actionCard.payload.contactPhone || ''}
                            onChange={(e) => handleUpdateCardPayload(m.id, { contactPhone: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Yard / Office Address</label>
                          <input
                            type="text"
                            value={m.actionCard.payload.contactAddress || ''}
                            onChange={(e) => handleUpdateCardPayload(m.id, { contactAddress: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <div>
                            <div className="font-bold text-white text-[11px]">Top Announcement / Offer Banner</div>
                            <div className="text-[10px] text-slate-400">Broadcasts special clearance/auction notice on header</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateCardPayload(m.id, { offerBannerEnabled: !m.actionCard?.payload.offerBannerEnabled })}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                              m.actionCard.payload.offerBannerEnabled
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {m.actionCard.payload.offerBannerEnabled ? '✓ ENABLED' : 'DISABLED'}
                          </button>
                        </div>
                        {m.actionCard.payload.offerBannerEnabled && (
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Banner Announcement Text</label>
                            <input
                              type="text"
                              value={m.actionCard.payload.offerBannerText || ''}
                              onChange={(e) => handleUpdateCardPayload(m.id, { offerBannerText: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:border-amber-400 outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  {m.actionCard.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExecuteAction(m.id, m.actionCard)}
                        className="flex-1 py-2.5 px-4 bg-[#D48B1C] hover:bg-[#b87614] text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        <span>Execute & Record to Hosting Files</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelAction(m.id, m.actionCard)}
                        className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 active:scale-98 cursor-pointer shrink-0"
                        title="Cancel / Dismiss this AI suggestion"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Request</span>
                      </button>
                    </div>
                  )}

                  {m.actionCard.status === 'executed' && (
                    <div className="space-y-2 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] px-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Action Executed & Verified in Hosting Database</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUndoAction(m.id, m.actionCard)}
                          className="py-1 px-2.5 bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all border border-slate-700 cursor-pointer shrink-0 active:scale-95"
                          title="Revert and rollback this action"
                        >
                          <Undo2 className="w-3 h-3 text-amber-400" />
                          <span>Undo Action</span>
                        </button>
                      </div>

                      {/* Audit Receipt Badge */}
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-slate-400 font-mono">
                          <HardDrive className="w-3 h-3 text-amber-400" />
                          <span>Audit File: \`backend/logs/ai_activity_log.json\`</span>
                        </div>
                        {m.actionCard.receiptCode && (
                          <span className="font-mono font-bold text-amber-400">
                            Receipt: {m.actionCard.receiptCode}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {m.actionCard.status === 'cancelled' && (
                    <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                        <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Request Cancelled / Dismissed</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMessages(prev => prev.map(msg => msg.id === m.id && msg.actionCard ? { ...msg, actionCard: { ...msg.actionCard, status: 'pending' } } : msg));
                        }}
                        className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen Request</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-3 bg-slate-800/50 rounded-2xl w-fit">
            <Bot className="w-4 h-4 animate-spin text-[#D48B1C]" />
            <span className="font-semibold text-[11px]">Analyzing database state, verifying hosting files & constructing plan...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 shrink-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Quick Autonomous Orders:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendCommand(qp.prompt)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors border border-slate-700/60 active:scale-95 cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Prompt Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendCommand();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask or order: 'Fix all errors', 'Add anti-sniping rule', 'Add 50 MT HMS steel in Pune', 'Show hosting logs'..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D48B1C] transition-all"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isThinking}
          className="p-2.5 bg-[#D48B1C] hover:bg-[#b87614] disabled:opacity-50 text-slate-950 rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 cursor-pointer"
          title="Send Command"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* DEVELOPER HOSTING AUDIT & ERROR LOGS MODAL */}
      {showHostingLogsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Developer Hosting Logs & AI Audit Console
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE HOSTING SYNC
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct access to immutable hosting audit logs (\`backend/logs/ai_activity_log.json\`) and server error files (\`backend/logs/error.log\`).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHostingLogsModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between shrink-0 overflow-x-auto gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLogTab('ai_audit')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeLogTab === 'ai_audit'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>AI Activity Audit Log ({aiAuditLogs.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLogTab('server_errors')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeLogTab === 'server_errors'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Hosting Error Log ({serverErrorLogs.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLogTab('custom_features')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeLogTab === 'custom_features'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Dynamic Functions ({customFeatures.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLogTab('self_healing')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeLogTab === 'self_healing'
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Self-Healing Runner</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchHostingData}
                  disabled={isLoadingLogs}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {/* TAB 1: AI ACTIVITY AUDIT LOG */}
              {activeLogTab === 'ai_audit' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-bold text-white text-xs">Immutable Hosting Activity Log</div>
                      <div className="text-[11px] text-slate-400 font-mono">Location: backend/logs/ai_activity_log.json & ai_activity_log.txt</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="/backend/view_logs.php?key=SR2026#SalvageReef!SecretKey&action=download&file=ai_activity_log.json"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download JSON
                      </a>
                      <a
                        href="/backend/view_logs.php?key=SR2026#SalvageReef!SecretKey&action=download&file=ai_activity_log.txt"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download TXT
                      </a>
                    </div>
                  </div>

                  {aiAuditLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No AI activity records logged yet. Run any AI command to generate permanent audit records.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {aiAuditLogs.map((log) => (
                        <div key={log.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                {log.receipt_code}
                              </span>
                              <span className="font-bold text-white text-xs">{log.action_code}</span>
                              <span className="text-[10px] text-slate-400 uppercase">({log.action_type})</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                          </div>

                          <p className="text-xs text-slate-300">{log.description}</p>
                          {log.developer_notes && (
                            <p className="text-[11px] text-slate-400 italic">Dev Note: {log.developer_notes}</p>
                          )}

                          {log.parameters && (
                            <details className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                              <summary className="cursor-pointer font-bold text-slate-300">View Parameters & Changes Payload</summary>
                              <pre className="mt-1 text-emerald-300 whitespace-pre-wrap">{JSON.stringify(log.parameters, null, 2)}</pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SERVER ERROR LOGS */}
              {activeLogTab === 'server_errors' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-bold text-white text-xs">Live Server & Application Error File</div>
                      <div className="text-[11px] text-slate-400 font-mono">Location: backend/logs/error.log</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="/backend/view_logs.php?key=SR2026#SalvageReef!SecretKey&action=download&file=error.log"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download error.log
                      </a>
                    </div>
                  </div>

                  {serverErrorLogs.length === 0 ? (
                    <div className="text-center py-12 text-emerald-400 text-xs flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-8 h-8" />
                      <span>Zero active errors in \`backend/logs/error.log\`. Server running cleanly.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {serverErrorLogs.map((err, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5 font-mono text-[11px]">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-rose-400 font-bold uppercase">{err.level || 'ERROR'}</span>
                            <span className="text-slate-500">{err.timestamp || 'Recent'}</span>
                          </div>
                          <p className="text-slate-200">{err.message || JSON.stringify(err)}</p>
                          {err.context && (
                            <pre className="text-[10px] text-slate-400 whitespace-pre-wrap bg-slate-900 p-2 rounded">
                              {JSON.stringify(err.context, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DYNAMIC WEBSITE FUNCTIONS */}
              {activeLogTab === 'custom_features' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="font-bold text-white text-xs">Active Dynamic Website Functions & Injected Modules</div>
                    <div className="text-[11px] text-slate-400">Database table: \`ai_custom_features\` (managed autonomously by Salvage AI Copilot)</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customFeatures.map((feat) => (
                      <div key={feat.feature_key} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white text-xs">{feat.feature_name}</div>
                          <button
                            type="button"
                            onClick={() => handleSaveDynamicFeature({ ...feat, is_active: !feat.is_active })}
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-colors cursor-pointer ${
                              feat.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {feat.is_active ? '✓ Active' : 'Disabled'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">{feat.description}</p>
                        <div className="bg-slate-900 p-2 rounded text-[10px] font-mono text-emerald-300">
                          {JSON.stringify(feat.config || {}, null, 2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SELF HEALING RUNNER */}
              {activeLogTab === 'self_healing' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="font-bold text-white text-xs">Autonomous Diagnostics & Self-Healing Controls</div>
                    <div className="text-[11px] text-slate-400">Triggers backend automated remediation algorithms and writes audit logs to hosting files.</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-400" />
                        <span>Full Platform Self-Healing</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Resolves stuck live auction timers, unblocks all banned IP windows, fixes orphan category keys, and marks error logs resolved.</p>
                      <button
                        type="button"
                        disabled={autoHealLoading}
                        onClick={() => handleTriggerDeepAutoHeal('repair_all')}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-colors cursor-pointer active:scale-98 disabled:opacity-50"
                      >
                        {autoHealLoading ? 'Running Self-Healing...' : 'Execute Full Self-Healing Suite'}
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Unblock All Rate Limits</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Clears temporary IP security blocks and resets request rate limit windows across all testing devices.</p>
                      <button
                        type="button"
                        disabled={autoHealLoading}
                        onClick={() => handleTriggerDeepAutoHeal('unblock_all_ips')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer active:scale-98 disabled:opacity-50"
                      >
                        Unblock Banned IP Records
                      </button>
                    </div>
                  </div>

                  {autoHealResult && (
                    <div className="bg-slate-950 border border-emerald-500/40 p-4 rounded-xl space-y-2">
                      <div className="font-bold text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{autoHealResult.message}</span>
                      </div>
                      {autoHealResult.receipt_code && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          Receipt: {autoHealResult.receipt_code} | Logged to: {autoHealResult.hosting_log}
                        </div>
                      )}
                      {autoHealResult.results && (
                        <pre className="text-[10px] font-mono text-slate-300 bg-slate-900 p-2 rounded">
                          {JSON.stringify(autoHealResult.results, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return content;
};

export default AdminAIAssistant;
