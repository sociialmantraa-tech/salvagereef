import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initGlobalErrorLogging } from './services/errorService';

// Initialize global client error and unhandled rejection interceptors
initGlobalErrorLogging();

// Auto-invalidate stale browser caches and synchronize with live server database
const SR_CACHE_VERSION = '2026.09.28.v8';
try {
  const currentVersion = localStorage.getItem('sr_cache_version');
  if (currentVersion !== SR_CACHE_VERSION) {
    const keysToPurge = [
      'sr_auctions',
      'sr_admin_auctions',
      'sr_classifieds',
      'sr_admin_classifieds',
      'sr_admin_bids',
    ];
    for (const k of keysToPurge) {
      localStorage.removeItem(k);
    }
    localStorage.setItem('sr_cache_version', SR_CACHE_VERSION);
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
