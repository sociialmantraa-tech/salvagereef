import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, AlertCircle, Wrench, ShieldCheck, Terminal } from 'lucide-react';
import { logSystemError } from '../services/errorService';
import { getUserFriendlyError, generateIncidentCode } from '../utils/errorMessages';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reported: boolean;
  incidentCode: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    reported: false,
    incidentCode: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      reported: false,
      incidentCode: generateIncidentCode(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React ErrorBoundary caught an exception:', error, errorInfo);
    this.setState({ errorInfo });

    // Persist and report error to the backend/dev error log system
    try {
      logSystemError(error, {
        severity: 'error',
        source: 'frontend',
        exception_class: error.name || 'ReactRuntimeError',
        stack_trace: errorInfo.componentStack || error.stack,
        url: typeof window !== 'undefined' ? window.location.href : '/admin',
      }).then(() => {
        this.setState({ reported: true });
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to report runtime error:', e);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearCacheAndReload = () => {
    try {
      // Clear non-essential cached session items that might cause deserialization crashes
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const friendly = getUserFriendlyError(this.state.error);

      // Check if logged-in user is an admin
      let isAdmin = false;
      try {
        const rawUser = localStorage.getItem('salvagereef_user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          isAdmin = ['admin', 'master_admin', 'desk_admin'].includes(u?.role) || u?.email === 'admin@salvagereef.com';
        }
      } catch {}

      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
            {/* User-Friendly Header */}
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-[#D48B1C] shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-black text-slate-100">{friendly.userTitle}</h1>
                <p className="text-xs text-slate-400 leading-relaxed">{friendly.userMessage}</p>
              </div>
            </div>

            {/* Incident Reference Card */}
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Incident Reference
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {this.state.reported ? '✓ Logged to Diagnostics' : 'Recording Incident...'}
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-amber-300">
                {this.state.incidentCode || 'SR-ERR-INCIDENT'}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Our automated telemetry has recorded this occurrence. If this persists, quote the reference code above to our operations desk.
              </p>
            </div>

            {/* Admin-Exclusive Technical Diagnostic Panel */}
            {isAdmin && (
              <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-2.5 text-left">
                <div className="flex items-center justify-between text-xs font-black text-red-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-red-400" /> Admin Diagnostic Console
                  </span>
                  <a
                    href="/admin"
                    className="text-[10px] text-cyan-400 hover:underline font-mono"
                  >
                    Open Error Logs &rarr;
                  </a>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-slate-300 font-bold">
                    <span className="text-slate-500 font-normal">Diagnosis: </span>
                    {friendly.adminDiagnosis}
                  </div>
                  <div className="text-slate-300 font-bold">
                    <span className="text-slate-500 font-normal">Action: </span>
                    {friendly.adminAction}
                  </div>
                </div>

                <details className="mt-2 text-xs">
                  <summary className="text-slate-400 hover:text-slate-200 cursor-pointer select-none font-semibold">
                    View Raw Stack Trace
                  </summary>
                  <p className="font-mono text-[11px] text-red-300 mt-2 bg-slate-950 p-2.5 rounded-xl border border-red-900/50 break-words">
                    {this.state.error?.message}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 max-h-40 overflow-y-auto font-mono text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-[#D48B1C] hover:bg-[#b87614] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 active:scale-95"
              >
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>Recover & Reset</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

