import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, AlertCircle, Wrench } from 'lucide-react';
import { logSystemError } from '../services/errorService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reported: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    reported: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, reported: false };
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
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-5">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-100">Application Error Recovered</h1>
                <p className="text-xs text-slate-400">The application caught a runtime exception and automatically recorded it to the admin error log.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>Exception Details</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {this.state.reported ? '✓ Recorded to Error Database' : 'Recording Error...'}
                </span>
              </div>
              <p className="font-mono text-xs text-red-300 break-words leading-relaxed">
                {this.state.error?.message || 'An unexpected client-side error occurred.'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <details className="mt-2">
                  <summary className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer select-none">
                    View Component Stack Trace
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-y-auto font-mono text-[11px] text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-[#D48B1C] hover:bg-[#b87614] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700"
              >
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>Recover & Reset</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700"
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
