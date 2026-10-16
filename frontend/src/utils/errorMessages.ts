/**
 * SalvageReef Standard Error Message & Diagnostic Mapping
 * 
 * Rules:
 * 1. Regular users must NEVER see raw, random, or cryptic technical stack traces (e.g. "Minified React error #310").
 * 2. Regular users see clean, reassuring, and actionable messages.
 * 3. Admins receive complete technical breakdown, source tracking, and reproduction clues.
 * 4. All system errors are recorded with standard incident reference codes.
 */

export interface ErrorResolutionInfo {
  userMessage: string;
  userTitle: string;
  category: 'render' | 'network' | 'auth' | 'permission' | 'notFound' | 'server' | 'validation' | 'generic';
  adminDiagnosis: string;
  adminAction: string;
  isRecoverable: boolean;
}

export const ERROR_CATALOG: Record<string, ErrorResolutionInfo> = {
  // React Component Lifecycle / Hook errors
  'REACT_HOOKS_ERROR': {
    userTitle: 'Page Display Refresh Required',
    userMessage: 'A temporary display synchronization issue occurred while rendering this view. Please reload the page to continue.',
    category: 'render',
    adminDiagnosis: 'React Rules of Hooks violation (e.g. Minified error #310). Hooks called conditionally, inside loops, or below early returns.',
    adminAction: 'Verify component hook order in AuctionDetail, LiveBiddingWidget, or ClassifiedDetail. Ensure all hooks are declared at the top level.',
    isRecoverable: true,
  },
  'REACT_MINIFIED_310': {
    userTitle: 'Page Display Refresh Required',
    userMessage: 'A temporary display synchronization issue occurred while rendering this view. Please reload the page to continue.',
    category: 'render',
    adminDiagnosis: 'Minified React error #310: Rendered more hooks than during previous render.',
    adminAction: 'Audit recent useState/useEffect additions. Move any hook positioned below an if (condition) return statement to the top of the component.',
    isRecoverable: true,
  },
  'NETWORK_OFFLINE': {
    userTitle: 'Connection Interrupted',
    userMessage: 'Unable to reach SalvageReef servers. Please check your internet connection or try again in a few moments.',
    category: 'network',
    adminDiagnosis: 'Client-side fetch failed with ERR_NETWORK or timeout. No HTTP response received.',
    adminAction: 'Check hosting web server (LiteSpeed/Apache), SSL certificate expiration, and PHP-FPM service status.',
    isRecoverable: true,
  },
  'AUTH_EXPIRED': {
    userTitle: 'Session Expired',
    userMessage: 'Your secure session has expired for safety. Please sign in again to continue placing bids or accessing documents.',
    category: 'auth',
    adminDiagnosis: 'HTTP 401 Unauthorized or personal access token expired/invalid in database.',
    adminAction: 'Verify Bearer token in personal_access_tokens table and CORS authentication headers.',
    isRecoverable: false,
  },
  'PERMISSION_DENIED': {
    userTitle: 'Access Restricted',
    userMessage: 'This auction lot, document, or feature is restricted to verified business members or requires special administrative clearance.',
    category: 'permission',
    adminDiagnosis: 'HTTP 403 Forbidden. User KYC verification status is pending or user lacks role authority.',
    adminAction: 'Review user KYC verification in Admin Desk > User Approvals, or check auction privacy status.',
    isRecoverable: false,
  },
  'ITEM_NOT_FOUND': {
    userTitle: 'Auction Lot Not Found',
    userMessage: 'The requested salvage lot or document could not be located. It may have expired or been reassigned.',
    category: 'notFound',
    adminDiagnosis: 'HTTP 404 Not Found for auction slug or resource ID.',
    adminAction: 'Check slug normalization and verify auction record exists in database table `auctions`.',
    isRecoverable: false,
  },
  'SERVER_EXCEPTION': {
    userTitle: 'Server System Notice',
    userMessage: 'Our server experienced a brief technical interruption while processing your request. Our engineering team has been alerted.',
    category: 'server',
    adminDiagnosis: 'HTTP 500/502/503 backend exception. Database lock, syntax error, or unhandled PHP exception.',
    adminAction: 'Inspect backend/logs/error.log and backend/logs/system_errors.log for backend stack traces.',
    isRecoverable: true,
  },
  'GENERIC_FALLBACK': {
    userTitle: 'Application Notice',
    userMessage: 'An unexpected application condition occurred. The event has been securely recorded for technical analysis. Please reload or return home.',
    category: 'generic',
    adminDiagnosis: 'Uncategorized client exception captured by ErrorBoundary or global window handler.',
    adminAction: 'Review incident stack trace and component hierarchy in Admin Panel > Errors & System Health.',
    isRecoverable: true,
  },
};

/**
 * Translates raw/technical error objects into user-friendly explanations.
 * NEVER leaks raw stack traces, minified codes, or SQL errors to end users.
 */
export function getUserFriendlyError(err: any): ErrorResolutionInfo {
  const rawMsg = String(err?.message || err || '').toLowerCase();
  const rawName = String(err?.name || '').toLowerCase();
  const rawStack = String(err?.stack || '').toLowerCase();

  // 1. React Hook errors (e.g. Minified #310)
  if (
    rawMsg.includes('error #310') ||
    rawMsg.includes('rendered more hooks') ||
    rawMsg.includes('fewer hooks') ||
    rawMsg.includes('rules of hooks')
  ) {
    return ERROR_CATALOG['REACT_MINIFIED_310'];
  }
  if (rawMsg.includes('minified react error') || rawMsg.includes('react.dev/errors')) {
    return ERROR_CATALOG['REACT_HOOKS_ERROR'];
  }

  // 2. Network / Connectivity
  if (
    rawMsg.includes('network error') ||
    rawMsg.includes('failed to fetch') ||
    rawMsg.includes('net::err') ||
    rawMsg.includes('timeout')
  ) {
    return ERROR_CATALOG['NETWORK_OFFLINE'];
  }

  // 3. Auth & Permissions
  if (rawMsg.includes('401') || rawMsg.includes('unauthorized') || rawMsg.includes('token expired')) {
    return ERROR_CATALOG['AUTH_EXPIRED'];
  }
  if (rawMsg.includes('403') || rawMsg.includes('forbidden') || rawMsg.includes('restricted')) {
    return ERROR_CATALOG['PERMISSION_DENIED'];
  }

  // 4. Not Found
  if (rawMsg.includes('404') || rawMsg.includes('not found')) {
    return ERROR_CATALOG['ITEM_NOT_FOUND'];
  }

  // 5. Server 500
  if (rawMsg.includes('500') || rawMsg.includes('internal server error') || rawMsg.includes('sql') || rawMsg.includes('pdo')) {
    return ERROR_CATALOG['SERVER_EXCEPTION'];
  }

  return ERROR_CATALOG['GENERIC_FALLBACK'];
}

/**
 * Generates clean, unique incident reference for support & admin cross-referencing.
 */
export function generateIncidentCode(prefix: string = 'SR-ERR'): string {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, '0');
  return `${prefix}-${now}-${rand}`;
}
