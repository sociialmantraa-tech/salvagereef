# Project Guidelines & Standards

## Admin Synchronization & Real-time Consistency
- **Single Source of Truth**: All administrative changes (rates, categories, orders, scrap pickup requests, user records, content, settings) must be persisted directly to the central backend database via API.
- **Cross-Browser & Multi-User Propagation**: Any change made in the admin panel must be visible across all browsers and user accounts. Do not rely on isolated local storage or mock state for shared app data.
- **Cache Invalidation & Fresh Fetching**: Ensure frontend stores and API clients properly re-fetch or invalidate caches to prevent stale data.

## Professional Quality Standards
- Strict attention to detail across UI/UX, responsive layouts, error handling, and data validation.
- All forms and network requests must feature clear feedback (loading indicators, error alerts, success confirmations).
- Maintain robust, bug-free, and production-ready code.
