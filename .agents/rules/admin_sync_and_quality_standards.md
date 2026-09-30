# Production & Synchronization Guidelines

## 1. Universal Admin-to-Client State Synchronization
- **Backend Persistence as Single Source of Truth**: Any change made in the Admin Panel (pricing, scrap rates, orders, requests, categories, site settings, blogs, content, user status) **must** be stored and managed via the backend database / API.
- **No Local-Only State for Shared Data**: Never use browser-isolated storage (`localStorage`, `sessionStorage`, or in-memory mock objects) to represent live shared business data.
- **Cross-Browser & Multi-User Visibility**: Data must immediately reflect across all devices, browsers, and user sessions. Always ensure query refetching, cache-busting, or polling/live sync is in place so other sessions see updates without stale data issues.

## 2. Professional Standards & Quality Control
- **Zero Sloppy Errors**: Ensure all API endpoints, database migrations, and frontend components are properly wired and tested.
- **Graceful Error Handling & Fallbacks**: Every asynchronous request must have clear loading states, robust error handlers, and user-friendly notifications (toast / modal alerts).
- **Responsive & Premium Aesthetics**: Clean, professional design with consistent typography, smooth transitions, and no layout shifts or broken UI elements.
- **Data Integrity**: Validate all inputs both client-side and server-side before executing updates.
