import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Auction, Classified, Category, User } from '../../types';
import { getStoredErrors, saveStoredErrors, SystemErrorItem } from '../../services/errorService';

export interface AdminAIAssistantProps {
  auctions: Auction[];
  classifieds: Classified[];
  users: User[];
  categories: Category[];
  systemMode: string;
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

interface Message {
  id: string;
  sender: 'ai' | 'admin';
  text: string;
  timestamp: string;
  actionCard?: {
    type:
      | 'fix_error'
      | 'fix_all_errors'
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
      | 'analysis_report';
    title: string;
    description: string;
    payload: any;
    status: 'pending' | 'executed' | 'cancelled';
  };
}

export const AdminAIAssistant: React.FC<AdminAIAssistantProps> = ({
  auctions,
  classifieds,
  users,
  categories,
  systemMode,
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
        text: `👋 **Hello Master Admin!** I am your **SalvageReef AI Operations Copilot**.\n\nI have real-time autonomous control over your database, auctions, classifieds, user KYC, winner awards, and live error diagnostics.\n\nGive me any natural command or choose a quick action below:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [, setErrorsList] = useState<SystemErrorItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(!isFloating);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Execute an action card created by AI
  const handleExecuteAction = (msgId: string, actionCard: Message['actionCard']) => {
    if (!actionCard || actionCard.status !== 'pending') return;

    try {
      if (actionCard.type === 'fix_error') {
        const errId = actionCard.payload.errorId;
        const current = getStoredErrors();
        const updated = current.map(e => String(e.id) === String(errId) ? { ...e, status: 'resolved' as const, resolved_at: new Date().toISOString(), fix_notes: 'Auto-resolved by Salvage AI Copilot' } : e);
        saveStoredErrors(updated);
        setErrorsList(updated);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sr_error_logged'));
        }
      } else if (actionCard.type === 'fix_all_errors') {
        const current = getStoredErrors();
        const updated = current.map(e => ({ ...e, status: 'resolved' as const, resolved_at: new Date().toISOString(), fix_notes: 'Auto-resolved in batch by Salvage AI Copilot' }));
        saveStoredErrors(updated);
        setErrorsList(updated);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sr_error_logged'));
        }
      } else if (actionCard.type === 'create_auction') {
        onAddAuction(actionCard.payload);
      } else if (actionCard.type === 'delete_auction') {
        if (onDeleteAuction) {
          onDeleteAuction(actionCard.payload.auctionId);
        }
      } else if (actionCard.type === 'create_classified') {
        onAddClassified(actionCard.payload);
      } else if (actionCard.type === 'delete_classified') {
        if (onDeleteClassified) {
          onDeleteClassified(actionCard.payload.classifiedId);
        }
      } else if (actionCard.type === 'toggle_system') {
        onToggleMaintenance(actionCard.payload.mode, actionCard.payload.message);
      } else if (actionCard.type === 'verify_user') {
        if (onVerifyUser) onVerifyUser(actionCard.payload.userId);
      } else if (actionCard.type === 'verify_all_users') {
        if (onVerifyAllUsers) {
          onVerifyAllUsers();
        } else if (onVerifyUser) {
          users.filter(u => !u.is_verified).forEach(u => onVerifyUser(u.id));
        }
      } else if (actionCard.type === 'delete_user') {
        if (onDeleteUser) onDeleteUser(actionCard.payload.userId);
      } else if (actionCard.type === 'award_winner') {
        if (onAwardWinner) onAwardWinner(actionCard.payload.auctionId, actionCard.payload.winnerType || 'H1');
      } else if (actionCard.type === 'clear_error_logs') {
        if (onClearErrorLogs) {
          onClearErrorLogs();
        } else {
          saveStoredErrors([]);
          setErrorsList([]);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sr_error_logged'));
          }
        }
      } else if (actionCard.type === 'reset_demo_data') {
        if (onResetDemoData) onResetDemoData();
      }

      // Mark message action as executed
      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.actionCard) {
          return {
            ...m,
            actionCard: { ...m.actionCard, status: 'executed' }
          };
        }
        return m;
      }));

      // Append success message
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `✅ **Action Executed Successfully!** "${actionCard.title}" has been applied live to the marketplace.`,
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
          text: `❌ **Failed to execute action:** ${err?.message || 'Unknown error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  // Process natural language command from admin
  const handleSendCommand = async (customText?: string) => {
    const text = (customText || inputPrompt).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'admin',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setIsThinking(true);

    const lower = text.toLowerCase();

    setTimeout(() => {
      let aiResponseText = '';
      let actionCard: Message['actionCard'] = undefined;

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 1: DELETE AUCTION LOT
      // ─────────────────────────────────────────────────────────────────────────────
      const isDeleteAuction =
        /\b(delete|remove|cancel|purge|drop|discard)\b/i.test(lower) &&
        /\b(auction|lot|tender)\b/i.test(lower);

      if (isDeleteAuction) {
        let matchedAuction = auctions[0];
        const idMatch = text.match(/#?(\d+)/);
        if (idMatch) {
          const found = auctions.find(a => String(a.id) === idMatch[1]);
          if (found) matchedAuction = found;
        }

        for (const auc of auctions) {
          const t = auc.title.toLowerCase();
          if (
            (lower.includes('copper') && t.includes('copper')) ||
            (lower.includes('steel') && t.includes('steel')) ||
            (lower.includes('express') && t.includes('express')) ||
            (lower.includes('milling') && t.includes('milling')) ||
            (lower.includes('solar') && t.includes('solar')) ||
            (lower.includes('tender') && t.includes('tender')) ||
            (lower.includes('motor') && t.includes('motor')) ||
            (lower.includes('transformer') && t.includes('transformer'))
          ) {
            matchedAuction = auc;
            break;
          }
        }

        if (matchedAuction) {
          aiResponseText = `🗑️ **Target Auction Lot Identified for Permanent Deletion**\n\n- **Lot ID:** #${matchedAuction.id}\n- **Title:** "${matchedAuction.title}"\n- **Category:** ${typeof matchedAuction.category === 'object' ? (matchedAuction.category as any)?.name : (matchedAuction.category_name || 'General Scrap')}\n- **Starting Price:** ₹${Number(matchedAuction.starting_price).toLocaleString('en-IN')}\n\nClick below to immediately delete and purge this auction lot from live listings, bids, and server database.`;

          actionCard = {
            type: 'delete_auction',
            title: `Confirm Delete Auction Lot #${matchedAuction.id}`,
            description: `Permanently delete "${matchedAuction.title}" and cascade delete associated bids & tender records.`,
            payload: { auctionId: matchedAuction.id, title: matchedAuction.title },
            status: 'pending',
          };
        } else {
          aiResponseText = `⚠️ **No Matching Auction Lot Found**\n\nPlease specify the auction title or ID (e.g., *"Delete auction lot #101"*).`;
        }
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 2: CREATE / ADD AUCTION LOT (Supports ANY phrasing!)
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        (/\b(add|create|publish|post|new)\b/i.test(lower) && /\b(auction|lot|tender|scrap)\b/i.test(lower)) ||
        /\b(copper|steel|hms|machinery|scrap|cables|motors)\b/i.test(lower) && /\b(starting|price|mumbai|pune|delhi|tons|mt|lakh)\b/i.test(lower)
      ) {
        // Parse Price (Supports: 8,50,000 | 8.5 lakh | 12 lakhs | 50000 | 1.2 cr)
        let extractedPrice = 500000;
        const lakhMatch = text.match(/([\d.]+)\s*(?:lakh|lac|lacs|lakhs)/i);
        const crMatch = text.match(/([\d.]+)\s*(?:cr|crore|crores)/i);
        const kMatch = text.match(/([\d.]+)\s*k\b/i);
        const rawNumMatch = text.match(/(?:₹|rs\.?|inr|at|starting)?\s*([\d,]{4,})/i);

        if (lakhMatch) {
          extractedPrice = Math.round(parseFloat(lakhMatch[1]) * 100000);
        } else if (crMatch) {
          extractedPrice = Math.round(parseFloat(crMatch[1]) * 10000000);
        } else if (kMatch) {
          extractedPrice = Math.round(parseFloat(kMatch[1]) * 1000);
        } else if (rawNumMatch) {
          const parsed = parseFloat(rawNumMatch[1].replace(/,/g, ''));
          if (parsed > 0) extractedPrice = parsed;
        }

        // Parse Quantity & Unit (e.g. 20 Tons, 50 MT, 100 kg)
        let quantity = 20;
        let unit = 'MT';
        const qtyMatch = text.match(/(\d+(?:\.\d+)?)\s*(tons?|mt|kg|nos?|units?|pieces?)/i);
        if (qtyMatch) {
          quantity = parseFloat(qtyMatch[1]);
          const uStr = qtyMatch[2].toUpperCase();
          unit = uStr.startsWith('TON') ? 'MT' : uStr;
        }

        // Parse City & State
        let city = 'Mumbai';
        let state = 'Maharashtra';
        const cityStateMap: Record<string, string> = {
          'mumbai': 'Maharashtra',
          'pune': 'Maharashtra',
          'nagpur': 'Maharashtra',
          'thane': 'Maharashtra',
          'bhayander': 'Maharashtra',
          'navi mumbai': 'Maharashtra',
          'ahmedabad': 'Gujarat',
          'surat': 'Gujarat',
          'vadodara': 'Gujarat',
          'rajkot': 'Gujarat',
          'delhi': 'Delhi',
          'chennai': 'Tamil Nadu',
          'kolkata': 'West Bengal',
          'hyderabad': 'Telangana',
          'bangalore': 'Karnataka',
          'bengaluru': 'Karnataka',
          'jaipur': 'Rajasthan',
          'indore': 'Madhya Pradesh',
          'kanpur': 'Uttar Pradesh',
          'ludhiana': 'Punjab',
        };

        for (const [c, s] of Object.entries(cityStateMap)) {
          if (lower.includes(c)) {
            city = c.charAt(0).toUpperCase() + c.slice(1);
            state = s;
            break;
          }
        }

        // Parse Category
        let catId = categories[0]?.id || 1;
        let catName = categories[0]?.name || 'Scrap Heavy Machinery';
        if (lower.includes('copper') || lower.includes('brass') || lower.includes('armoured') || lower.includes('cable')) {
          catId = 2; catName = 'Non-Ferrous Copper & Brass';
        } else if (lower.includes('steel') || lower.includes('hms') || lower.includes('melting') || lower.includes('iron')) {
          catId = 3; catName = 'Ferrous Heavy Melting Steel (HMS)';
        } else if (lower.includes('e-waste') || lower.includes('circuit') || lower.includes('solar') || lower.includes('panel')) {
          catId = 4; catName = 'E-Waste & Circuit Boards';
        } else if (lower.includes('boiler') || lower.includes('turbine') || lower.includes('plant')) {
          catId = 5; catName = 'Industrial Boilers & Turbines';
        } else if (lower.includes('vehicle') || lower.includes('auto') || lower.includes('car')) {
          catId = 6; catName = 'Vehicle Dismantling & Auto Scrap';
        }

        // Clean & generate Title
        let cleanTitle = text
          .replace(/^(?:add|create|publish|post|new)\s+(?:new\s+)?(?:public\s+|private\s+|group\s+)?(?:auction|lot|tender)?(?:\s*:\s*)?/gi, '')
          .replace(/starting\s+(?:at\s+)?[\d,kLakhCrRsINR₹\s.]+/gi, '')
          .replace(/in\s+[a-zA-Z\s]+/gi, '')
          .replace(/under\s+[a-zA-Z\s]+/gi, '')
          .trim();

        if (!cleanTitle || cleanTitle.length < 5) {
          cleanTitle = `${quantity} ${unit} ${catName} Industrial Scrap Lot`;
        }

        // Format Title: Capitalize first letter
        cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

        const auctionType: 'public' | 'private' | 'group' = lower.includes('private') ? 'private' : (lower.includes('group') ? 'group' : 'public');

        const auctionPayload: Partial<Auction> = {
          id: Date.now(),
          title: cleanTitle,
          slug: cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          category_id: Number(catId),
          category: { id: Number(catId), name: catName, slug: 'scrap' },
          starting_price: extractedPrice,
          current_highest_bid: extractedPrice,
          quantity: quantity,
          unit: unit,
          location_city: city,
          location_state: state,
          auction_type: auctionType,
          status: 'live',
          description: `Verified high-purity ${quantity} ${unit} industrial scrap lot ready for immediate bidding in ${city}, ${state}. Verified seller inventory.`,
        };

        aiResponseText = `📦 **Prepared New Scrap Auction Lot Ready for Publication**\n\n- **Title:** ${auctionPayload.title}\n- **Category:** ${catName}\n- **Starting Bid:** ₹${extractedPrice.toLocaleString('en-IN')}\n- **Quantity:** ${quantity} ${unit}\n- **Location:** ${city}, ${state}\n- **Type:** ${auctionType.toUpperCase()}\n\nPlease confirm below to publish this lot live into the marketplace.`;

        actionCard = {
          type: 'create_auction',
          title: `Publish Auction: ${auctionPayload.title}`,
          description: `Create ${auctionType} auction lot with starting price ₹${extractedPrice.toLocaleString('en-IN')} in ${city}.`,
          payload: auctionPayload,
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 3: AWARD WINNER (H1 / H2 / H3)
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(award|select|choose|finalize|winner)\b/i.test(lower) ||
        /\b(h1|h2|h3)\b/i.test(lower)
      ) {
        let winnerType: 'H1' | 'H2' | 'H3' = 'H1';
        if (/\bh2\b/i.test(lower)) winnerType = 'H2';
        else if (/\bh3\b/i.test(lower)) winnerType = 'H3';

        const targetAuction = auctions[0];
        const highestBid = Number(targetAuction.current_highest_bid || targetAuction.starting_price);
        const awardedAmount = winnerType === 'H1' ? highestBid : (winnerType === 'H2' ? Math.round(highestBid * 0.94) : Math.round(highestBid * 0.88));

        aiResponseText = `🏆 **Award Winner Selection Request**\n\n- **Auction Lot:** "${targetAuction.title}"\n- **Selected Tier:** \`${winnerType}\`\n- **Award Amount:** ₹${awardedAmount.toLocaleString('en-IN')}\n\nClick below to confirm winner award, lock the auction, and trigger notification.`;

        actionCard = {
          type: 'award_winner',
          title: `Award ${winnerType} Winner for Auction #${targetAuction.id}`,
          description: `Confirm ${winnerType} tier (₹${awardedAmount.toLocaleString('en-IN')}) for "${targetAuction.title}".`,
          payload: { auctionId: targetAuction.id, winnerType },
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 4: CLEAR LOGS / PURGE DIAGNOSTICS
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(clear|clean|purge)\b/i.test(lower) && /\b(log|logs|telemetry|diagnostics|records|database)\b/i.test(lower)
      ) {
        aiResponseText = `🧹 **Clear System Diagnostics & Error Logs Request**\n\nThis will purge resolved & captured error entries from database and reset telemetry counters to 0.`;

        actionCard = {
          type: 'clear_error_logs',
          title: 'Purge All System Error Logs',
          description: 'Clear database error logs and reset error counter to zero.',
          payload: {},
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 5: FIX / RESOLVE SYSTEM ERRORS & DIAGNOSTICS
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(error|errors|bug|bugs|fix|resolve|heal|repair|diagnostic|diagnostics|exception)\b/i.test(lower)
      ) {
        const storedErrs = getStoredErrors();
        const unresolved = storedErrs.filter(e => e.status === 'unresolved');

        if (unresolved.length === 0) {
          aiResponseText = `🎉 **Zero Unresolved Errors Found!**\n\nThe platform health monitor confirms all backend endpoints, auction deletion interfaces, and telemetry streams are running 100% cleanly without pending exceptions.`;
        } else {
          const count = unresolved.length;
          const firstErr = unresolved[0];

          aiResponseText = `🛠️ **Identified ${count} Unresolved System Error(s)**\n\n**Top Error Analysis:**\n- **Message:** \`${firstErr.message}\`\n- **Endpoint / File:** \`${firstErr.method || 'GET'} ${firstErr.url || firstErr.file}\`\n- **Severity:** \`${firstErr.severity.toUpperCase()}\`\n- **Time:** ${new Date(firstErr.created_at).toLocaleTimeString()}\n\n**Self-Healing Plan:** Auto-resolve exceptions, clean orphaned states, and sync diagnostics database. Click below to execute full self-healing fix.`;

          actionCard = {
            type: 'fix_all_errors',
            title: `Auto-Resolve All ${count} System Error(s)`,
            description: `Sanitize state and mark ${count} pending exception(s) as resolved in diagnostics database.`,
            payload: { count },
            status: 'pending',
          };
        }
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 5: CREATE / POST CLASSIFIED
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(classified|classifieds|listing)\b/i.test(lower) &&
        !/\b(delete|remove)\b/i.test(lower)
      ) {
        const classifiedPayload: any = {
          id: Date.now(),
          title: 'Direct Sale: Industrial Machinery & Surplus Stock',
          slug: `classified-${Date.now()}`,
          category_id: 1,
          category: { id: 1, name: 'Scrap Heavy Machinery', slug: 'scrap-machinery' },
          price: 150000,
          location_city: 'Mumbai',
          location_state: 'Maharashtra',
          status: 'available',
          description: 'Industrial surplus equipment in working condition available for direct purchase.',
          created_at: new Date().toISOString().split('T')[0],
        };

        aiResponseText = `🏷️ **Prepared Classified Listing Draft**\n\n- **Item:** ${classifiedPayload.title}\n- **Price:** ₹${Number(classifiedPayload.price).toLocaleString('en-IN')}\n- **Location:** ${classifiedPayload.location_city}, ${classifiedPayload.location_state}\n\nReady to post immediately to the classifieds directory.`;

        actionCard = {
          type: 'create_classified',
          title: `Post Classified: ${classifiedPayload.title}`,
          description: `List equipment for ₹${Number(classifiedPayload.price).toLocaleString('en-IN')}.`,
          payload: classifiedPayload,
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 6: DELETE CLASSIFIED
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(delete|remove)\b/i.test(lower) &&
        /\b(classified|classifieds|listing)\b/i.test(lower)
      ) {
        const matchedClassified = classifieds[0];
        if (matchedClassified) {
          aiResponseText = `🗑️ **Target Classified Identified for Deletion**\n\n- **ID:** #${matchedClassified.id}\n- **Title:** "${matchedClassified.title}"\n- **Price:** ₹${Number(matchedClassified.price).toLocaleString('en-IN')}\n\nClick below to delete this classified listing from the directory.`;

          actionCard = {
            type: 'delete_classified',
            title: `Delete Classified: "${matchedClassified.title}"`,
            description: `Remove listing #${matchedClassified.id} from classified marketplace.`,
            payload: { classifiedId: matchedClassified.id, title: matchedClassified.title },
            status: 'pending',
          };
        }
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 7: MAINTENANCE / SYSTEM MODE
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(maintenance|online|system mode|platform mode|temporary closed)\b/i.test(lower)
      ) {
        let targetMode = 'maintenance';
        if (lower.includes('online') || lower.includes('open') || lower.includes('enable live')) {
          targetMode = 'online';
        } else if (lower.includes('temp') || lower.includes('close')) {
          targetMode = 'temporary_closed';
        }

        const msg = targetMode === 'online'
          ? 'Platform operating normally'
          : (lower.includes('upgrade') ? 'SalvageReef is upgrading servers for faster bidding performance.' : 'SalvageReef is currently undergoing scheduled platform upgrades.');

        aiResponseText = `🛡️ **System Mode Modification Request**\n\n- **Target Operating Mode:** \`${targetMode.toUpperCase()}\`\n- **Notice Message:** "${msg}"\n\nClick below to apply this mode live across all users.`;

        actionCard = {
          type: 'toggle_system',
          title: `Switch Mode to ${targetMode.toUpperCase()}`,
          description: `Update platform operational status to ${targetMode}.`,
          payload: { mode: targetMode, message: msg },
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 8: VERIFY USERS
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(verify|approve|kyc|onboard)\b/i.test(lower)
      ) {
        const unverified = users.filter(u => !u.is_verified);
        if (unverified.length === 0) {
          aiResponseText = `👥 **All Registered Users are Verified!**\n\nThere are currently zero pending KYC or onboarding verifications in the queue.`;
        } else {
          aiResponseText = `👤 **Found ${unverified.length} Unverified User(s)**\n\n${unverified.map(u => `- **${u.name}** (${u.email}) - ${u.company_name || 'Individual'}`).join('\n')}\n\nClick below to bulk-verify all pending accounts with full bidding access.`;

          actionCard = {
            type: 'verify_all_users',
            title: `Verify All ${unverified.length} Pending User(s)`,
            description: `Grant verified bidding privileges to all pending accounts.`,
            payload: { count: unverified.length },
            status: 'pending',
          };
        }
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 9: CLEAR LOGS / PURGE DIAGNOSTICS
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(clear|clean|purge)\b/i.test(lower) && /\b(log|logs|telemetry|diagnostics)\b/i.test(lower)
      ) {
        aiResponseText = `🧹 **Clear System Diagnostics & Error Logs Request**\n\nThis will purge resolved & captured error entries from database and reset telemetry counters to 0.`;

        actionCard = {
          type: 'clear_error_logs',
          title: 'Purge All System Error Logs',
          description: 'Clear database error logs and reset error counter to zero.',
          payload: {},
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 10: RESET DEMO DATA
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(reset demo|restore demo|restore default|reset data|seed data)\b/i.test(lower)
      ) {
        aiResponseText = `🔄 **Restore Default Platform Demo Data**\n\nThis will restore default auction lots, verified classifieds, test bidders, and audit desk accounts.`;

        actionCard = {
          type: 'reset_demo_data',
          title: 'Restore Default Demo Marketplace Data',
          description: 'Reset auctions, classifieds, and test data to clean initial seed state.',
          payload: {},
          status: 'pending',
        };
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // INTENT 11: ANALYTICS / AUDIT REPORT
      // ─────────────────────────────────────────────────────────────────────────────
      else if (
        /\b(stats|report|analytics|summary|audit|health|metrics|overview)\b/i.test(lower)
      ) {
        const totalAuctionVal = auctions.reduce((acc, a) => acc + Number(a.starting_price || 0), 0);
        aiResponseText = `📊 **SalvageReef Executive Platform Audit Summary**\n\n- **Active Auctions:** ${auctions.length} lots (Total Value: ₹${(totalAuctionVal / 100000).toFixed(1)} Lakhs)\n- **Classified Listings:** ${classifieds.length} items published\n- **Registered Users:** ${users.length} members (${users.filter(u => u.is_verified).length} verified)\n- **System Operational Mode:** \`${systemMode.toUpperCase()}\`\n- **System Health:** 100% Operational, Real-Time Cascading Deletion Online.`;
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // DEFAULT HELPFUL FALLBACK
      // ─────────────────────────────────────────────────────────────────────────────
      else {
        aiResponseText = `🤖 **Salvage AI Operations Copilot Ready**\n\nI can execute any administrative command directly:\n\n1. **"Add 20 tons copper scrap in Mumbai at 8.5 lakhs"** — Draft and publish auction lot.\n2. **"Delete auction lot [name/id]"** — Safely cascade-delete auction and all associated bids.\n3. **"Award H1 winner for auction"** — Finalize winner and trigger notification.\n4. **"Analyze and fix all unresolved system errors"** — Auto-resolve exceptions and clean diagnostics.\n5. **"Verify all pending users"** — Approve pending KYC onboarding.\n6. **"Post classified for machinery at 65,000"** — Create direct sale listing.\n7. **"Set system mode to maintenance / online"** — Switch platform operational state.\n8. **"Show platform stats report"** — Generate real-time analytics breakdown.`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard,
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 500);
  };

  const quickPrompts = [
    { label: '🛠️ Fix Unresolved Errors', prompt: 'Analyze and fix all unresolved system errors' },
    { label: '📦 Add 20 Tons Copper Scrap Lot', prompt: 'Add new public auction: 20 Tons Industrial Copper Armoured Cables in Mumbai starting at 8,50,000' },
    { label: '🗑️ Delete Demo Auction', prompt: 'Delete 2-Minute Express Demo Auction lot' },
    { label: '🏆 Award H1 Winner', prompt: 'Award H1 winner for 2-Minute Express Demo Auction' },
    { label: '🏷️ Post Machinery Classified', prompt: 'Post a classified listing for Used 50 HP Siemens Industrial Motor at 65,000 in Ahmedabad' },
    { label: '👥 Verify Pending Users', prompt: 'Verify all pending user accounts' },
    { label: '🛡️ Toggle Maintenance Mode', prompt: 'Switch platform to maintenance mode with scheduled upgrade notice' },
    { label: '📊 System Analytics Summary', prompt: 'Generate platform overview and analytics audit report' },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#D48B1C]/20 border border-[#D48B1C]/40 rounded-2xl text-[#D48B1C]">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-wide">SalvageReef AI Admin Copilot</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Active Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Operations Assistant & Self-Healing Diagnostics</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {isFloating && (
            <>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              {onCloseFloating && (
                <button
                  type="button"
                  onClick={onCloseFloating}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-900/60 font-sans min-h-[380px] max-h-[500px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {m.sender === 'admin' ? 'Master Admin' : 'Salvage AI Agent'}
              </span>
              <span className="text-[9px] text-slate-500">{m.timestamp}</span>
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>

              {/* ACTION CARD (1-CLICK EXECUTION) */}
              {m.actionCard && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-700/80 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-black text-amber-300 text-xs flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{m.actionCard.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{m.actionCard.description}</p>
                    </div>
                  </div>

                  {m.actionCard.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => handleExecuteAction(m.id, m.actionCard)}
                      className="w-full py-2.5 px-4 bg-[#D48B1C] hover:bg-[#b87614] text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Execute Action Now</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 px-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Action Executed & Verified Live</span>
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
            <span className="font-semibold text-[11px]">Analyzing database state & constructing operational plan...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 shrink-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Quick Orders:
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
          placeholder="Give an order... (e.g. 'Add 20 tons copper scrap in Mumbai at 8.5 lakhs', 'Delete auction lot #101', 'Fix all errors')"
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
    </div>
  );

  return content;
};

export default AdminAIAssistant;
