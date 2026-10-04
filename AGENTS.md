# Project Guidelines & Standards — SalvageReef

## Admin Synchronization & Real-time Consistency
- **Single Source of Truth**: All administrative changes (rates, categories, orders, scrap pickup requests, user records, content, settings) must be persisted directly to the central backend database via API.
- **Cross-Browser & Multi-User Propagation**: Any change made in the admin panel must be visible across all browsers and user accounts. Do not rely on isolated local storage or mock state for shared app data.
- **Cache Invalidation & Fresh Fetching**: Ensure frontend stores and API clients properly re-fetch or invalidate caches to prevent stale data.

## Zero Hardcoded Mock Data in Frontend (Strict Rule)
- **No Mock Interceptors or Artificial Normalizers**: Never create functions (like `normalizeAdminUsers`) that inject hardcoded mock names, emails, or IDs (e.g., hardcoding "Neelkanth Sharma" or mock desk admins). Frontend must render 100% genuine database records directly from the backend API.
- **No Mock Re-injection**: Deleted items must NEVER be re-injected by fallback initial states or client-side mock mappers.

## Permanent Zero-Maintenance Auto-Healing Safeguards (Critical Rule)
- **Zero Empty Pages Guarantee**: The public `/auctions` and `/classifieds` pages must NEVER show empty list cards ("No Auctions Found" / "No Classifieds Found") even if no manual administrative actions are performed for months.
- **Auto-Renewal of Past Unawarded Auctions**: Open auctions whose `end_time` passes into the past without an admin explicitly confirming a winner (`winner_confirmed = 0`) must have their `end_time` automatically extended to `+7 days` and remain marked `status = 'live'`.
- **Auto-Seeding Safeguard**: The function `ensureActiveContentAutoSeeded($pdo)` in `backend/server.php` must run on backend API startup to guarantee at least 3 live auctions and 3 active classifieds are always available in the database.

## Deletion & Database Integrity Standards
- **Precise Schema & Column Validation**: Always verify table schemas before writing database queries (e.g., `personal_access_tokens` uses `tokenable_id`, not `user_id`).
- **Complete Cascade Cleanup**: When deleting users or lots, safely clean up all child references (tokens, OTPs, bids, images, enquiries, and auction winner columns) with foreign key safety pragmas (`PRAGMA foreign_keys = OFF` during cleanup and `ON` after).
- **No Race Conditions on Delete**: Update UI state and storage immediately on delete without firing premature synchronous refetches before asynchronous server transactions finish committing.
- **Multi-Method Hosting Compatibility**: Support both HTTP `DELETE` and `POST /delete` routes to guarantee compatibility with cPanel/Apache/LiteSpeed servers that may restrict `DELETE` verbs.

## Professional Quality Standards
- Strict attention to detail across UI/UX, responsive layouts, error handling, and data validation.
- All forms and network requests must feature clear feedback (loading indicators, error alerts, success confirmations).
- Maintain robust, bug-free, and production-ready code.

## System Architecture, Database & Credentials Reference
- **Master Documentation**: See [`PROJECT_SYSTEM_ARCHITECTURE.md`](file:///c:/Coding/Project/Business&Portfolio/Work/scrab/PROJECT_SYSTEM_ARCHITECTURE.md) for full database schemas, API routes, and deployment instructions.
- **Production Domain**: `https://salvagereef.com`
- **cPanel Production MySQL Database**:
  - Database: `scrab` (or cPanel prefixed `md1ofov5ad9b_scrab`)
  - User: `scrab_user` (or cPanel prefixed `md1ofov5ad9b_scrab_user`)
  - Password: `scrabRoot@123`
  - Host: `localhost` (Primary cPanel Unix Domain Socket) or `127.0.0.1:3306` (TCP)
- **Live Server Diagnostic Tool**: `https://salvagereef.com/backend/test_db.php`
- **SQLite Fallback Database Path**: `backend/database/database.sqlite` (Deploy path: `deploy_hosting/public_html/backend/database/database.sqlite`)
- **Master Admin Credentials**: Login ID `SR-ADMIN` | Email `admin@salvagereef.com` | Password `sociial123`
- **Executive Desk Admin**: Login ID `SR-EXEC-1` | Email `executive@salvagereef.com` | Password `execadmin123`
- **Read-Only Desk Admin**: Login ID `SR-DESK-1` | Email `inspector@salvagereef.com` | Password `deskadmin123`
- **Verified Seller**: Login ID `SR-SELLER-1` | Email `seller@salvagereef.com` | Password `SellerPass@2026`
- **Verified Bidder**: Login ID `SR-BIDDER-1` | Email `bidder@salvagereef.com` | Password `BidderPass@2026`
- **Pending Seller**: Login ID `SR-SELLER-2` | Email `rajesh@rajeshmetals.com` | Password `Rajesh@2026`
- **Build Package Generator**: `node build_hosting_package.cjs` -> outputs `salvagereef_UPDATE_SAFE_NO_DATABASE.zip` and `salvagereef_FULL_UPLOAD.zip`.
- **Bid Visibility & Moderation Rule**: Unapproved bids (`status = 'pending'`) must NEVER be visible on public pages or user bid logs until approved by admin.
- **User Password Reveal Rule**: Password reveal must authenticate against the logged-in admin's/executive's database password via `POST /api/v1/admin/users/{id}/reveal-password`.

