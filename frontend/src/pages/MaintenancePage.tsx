import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, ShieldCheck, RefreshCw, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface MaintenancePageProps {
  mode?: 'online' | 'maintenance' | 'temporary_closed';
  message?: string;
  onCheckStatus?: () => void;
}

export default function MaintenancePage({
  mode = 'maintenance',
  message,
  onCheckStatus,
}: MaintenancePageProps) {
  const [checking, setChecking] = useState(false);
  const { user } = useAuthStore();

  const isClosedMode = mode === 'temporary_closed';
  const defaultMsg = isClosedMode
    ? 'SalvageReef operations are temporarily closed for standard maintenance and operational update. We will reopen shortly!'
    : 'SalvageReef is currently undergoing scheduled platform upgrades to serve you better. We will be back online shortly!';

  const displayMessage = message || defaultMsg;

  const handleRefresh = async () => {
    setChecking(true);
    if (onCheckStatus) {
      await onCheckStatus();
    } else {
      window.location.reload();
    }
    setTimeout(() => setChecking(false), 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isClosedMode ? 'bg-rose-600/20' : 'bg-amber-600/20'}`} />

      <div className="max-w-xl w-full text-center bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="relative inline-flex mb-8">
          <div className={`w-24 h-24 border rounded-3xl flex items-center justify-center shadow-inner ${isClosedMode ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
            <Wrench className="w-12 h-12 animate-pulse" />
          </div>
          <span className="absolute -top-2 -right-2 flex h-5 w-5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isClosedMode ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-5 w-5 ${isClosedMode ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
          </span>
        </div>

        <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider mb-4 ${isClosedMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{isClosedMode ? 'Temporarily Closed Notice' : 'Scheduled Maintenance'}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-4">
          {isClosedMode ? 'Platform Operations Temporarily Closed' : 'System Maintenance in Progress'}
        </h1>

        <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          {displayMessage}
        </p>

        <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 mb-8 text-left space-y-3">
          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All your active bids and listing data remain safe and secure.</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Estimated completion time: under 30 minutes.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Status...' : 'Check Server Status'}</span>
          </button>

          {user?.role === 'admin' ? (
            <Link
              to="/admin"
              className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/25"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Bypass Access</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>

        <div className="mt-8 text-xs text-slate-500">
          SalvageReef Operations Desk &bull; System Monitoring Active
        </div>
      </div>
    </div>
  );
}
