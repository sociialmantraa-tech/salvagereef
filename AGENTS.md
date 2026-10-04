# Project Guidelines & Standards

## Admin Synchronization & Real-time Consistency
- **Single Source of Truth**: All administrative changes (rates, categories, orders, scrap pickup requests, user records, content, settings) must be persisted directly to the central backend database via API.
- **Cross-Browser & Multi-User Propagation**: Any change made in the admin panel must be visible across all browsers and user accounts. Do not rely on isolated local storage or mock state for shared app data.
- **Cache Invalidation & Fresh Fetching**: Ensure frontend stores and API clients properly re-fetch or invalidate caches to prevent stale data.

## Zero Hardcoded Mock Data in Frontend (Strict Rule)
- **No Mock Interceptors or Artificial Normalizers**: Never create functions (like `normalizeAdminUsers`) that inject hardcoded mock names, emails, or IDs (e.g., hardcoding "Neelkanth Sharma" or mock desk admins). Frontend must render 100% genuine database records directly from the backend API.
- **No Mock Re-injection**: Deleted items must NEVER be re-injected by fallback initial states or client-side mock mappers.

## Deletion & Database Integrity Standards
- **Precise Schema & Column Validation**: Always verify table schemas before writing database queries (e.g., `personal_access_tokens` uses `tokenable_id`, not `user_id`).
- **Complete Cascade Cleanup**: When deleting users or lots, safely clean up all child references (tokens, OTPs, bids, images, enquiries, and auction winner columns) with foreign key safety pragmas (`PRAGMA foreign_keys = OFF` during cleanup and `ON` after).
- **No Race Conditions on Delete**: Update UI state and storage immediately on delete without firing premature synchronous refetches before asynchronous server transactions finish committing.
- **Multi-Method Hosting Compatibility**: Support both HTTP `DELETE` and `POST /delete` routes to guarantee compatibility with cPanel/Apache/LiteSpeed servers that may restrict `DELETE` verbs.

## Professional Quality Standards
- Strict attention to detail across UI/UX, responsive layouts, error handling, and data validation.
- All forms and network requests must feature clear feedback (loading indicators, error alerts, success confirmations).
- Maintain robust, bug-free, and production-ready code.

## System Architecture & Credentials Reference
- **Master Documentation**: See [`PROJECT_SYSTEM_ARCHITECTURE.md`](file:///c:/Coding/Project/Business&Portfolio/Work/scrab/PROJECT_SYSTEM_ARCHITECTURE.md) for full database schemas, API routes, and deployment instructions.
- **SQLite Database Path**: `backend/database/database.sqlite` (Public deploy: `deploy_hosting/public_html/backend/database/database.sqlite`)
- **Master Admin Credentials**: Login ID `SR-ADMIN` | Email `admin@salvagereef.com` | Password `sociial123`
- **Executive Desk Admin**: Login ID `SR-EXEC-1` | Email `executive@salvagereef.com` | Password `execadmin123`
- **Read-Only Desk Admin**: Login ID `SR-DESK-1` | Email `inspector@salvagereef.com` | Password `deskadmin123`
- **Verified Seller**: Login ID `SR-SELLER-1` | Email `seller@salvagereef.com` | Password `SellerPass@2026`
- **Verified Bidder**: Login ID `SR-BIDDER-1` | Email `bidder@salvagereef.com` | Password `BidderPass@2026`
- **Zero-Maintenance Safeguards**: `ensureActiveContentAutoSeeded($pdo)` runs on backend startup to renew unawarded past auctions and seed minimum 3 active auctions & classifieds automatically.

