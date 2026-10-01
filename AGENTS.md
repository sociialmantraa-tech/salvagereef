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
