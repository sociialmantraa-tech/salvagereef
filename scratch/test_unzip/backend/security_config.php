<?php
// =============================================================================
// SALVAGEREEF BACKEND SECURITY CONFIGURATION
// =============================================================================
// WARNING: Do NOT expose this file publicly. Keep it server-side only.
// Any changes to APP_SECRET will invalidate all existing client signatures.
// =============================================================================

// ─── App Secret (used for request signature verification) ───────────────────
// This secret must be embedded in your authorized frontend/mobile clients.
// Change this to regenerate a new signature key for all clients.
define('SR_APP_SECRET', 'SR2026#SalvageReef!SecretKey@India$Backend%Secure^7304481166');

// ─── Allowed CORS Origins ────────────────────────────────────────────────────
// Add your production domain(s) here when you deploy to a live server.
define('SR_ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://salvagereef.com',
    'https://www.salvagereef.com',
    'https://salvagereef.in',
    'https://www.salvagereef.in',
    'https://sociialmantraa.com',
]);

// ─── Rate Limit Thresholds ───────────────────────────────────────────────────
define('SR_GLOBAL_RATE_LIMIT',      120); // Max requests per IP per minute
define('SR_LOGIN_MAX_ATTEMPTS',       5); // Failed logins before IP ban
define('SR_LOGIN_BAN_SECONDS',      900); // Ban duration (15 minutes)
define('SR_REGISTER_MAX_PER_HOUR',    3); // Max registrations per IP per hour
define('SR_BID_MAX_PER_MINUTE',      30); // Max bids per user per minute
define('SR_ADMIN_RATE_LIMIT',        60); // Max admin requests per IP per minute
define('SR_AUTO_BLOCK_THRESHOLD',    20); // Security violations before 24h block
define('SR_AUTO_BLOCK_DURATION',  86400); // Auto-block duration (24 hours)

// ─── Token Expiry ────────────────────────────────────────────────────────────
define('SR_TOKEN_TTL_HOURS', 72);   // Auth tokens expire after 72 hours

// ─── Signature Tolerance ─────────────────────────────────────────────────────
// Max allowed clock skew for X-App-Timestamp validation (seconds).
// If client and server clocks differ by more than this, the request is rejected.
define('SR_SIGNATURE_WINDOW_SECONDS', 300); // 5 minutes

// ─── Endpoints Exempt from Signature Check ──────────────────────────────────
// Public read-only endpoints that do NOT require X-App-Signature headers.
define('SR_SIGNATURE_EXEMPT_PATTERNS', [
    '#^GET /api/v1/auctions#',
    '#^GET /api/v1/classifieds#',
    '#^GET /api/v1/categories#',
    '#^GET /api/v1/locations#',
    '#^GET /api/v1/system/status#',
    '#^GET /api/v1/auth/me#',
    '#^GET /api/v1/user/dashboard#',
    '#^OPTIONS #',
]);

// ─── Blocked User-Agent Fragments ────────────────────────────────────────────
// Known AI crawlers, vulnerability scanners, and automated bot agents.
define('SR_BLOCKED_AGENTS', [
    'sqlmap',
    'nikto',
    'masscan',
    'nmap',
    'metasploit',
    'python-requests/2.', // raw Python requests library (often used for bots)
    'go-http-client',
    // 'curl/',           // commented out so health checks work
    'scrapy',
    'zgrab',
    'nessus',
    'burpsuite',
    'acunetix',
    'openvas',
    'w3af',
    'dirbuster',
    'gobuster',
    'aiohttp/',
    'httpx',
    'libwww-perl',
    'claude-bot',
    'gpt-crawler',
    'chatgpt-user',
    'anthropic-ai',
    'cohere-ai',
]);
