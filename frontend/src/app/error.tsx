'use client';

import React, { useEffect } from 'react';
import { logSystemError } from '../services/errorService';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logSystemError(error, { severity: 'critical' });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-red-950/80 border border-red-800 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center mx-auto text-red-400 font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-black text-white">Something went wrong</h2>
        <p className="text-xs text-slate-300 font-medium">
          {error.message || 'An unexpected application error occurred.'}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#D48B1C] hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
