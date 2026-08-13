import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React ErrorBoundary caught an exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center space-x-3 text-red-400 mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Application Error Recovered</h1>
                <p className="text-xs text-slate-400">The application caught a runtime exception without crashing.</p>
              </div>
            </div>

            <div className="my-6 p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-left">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Exception Details</span>
              </div>
              <p className="font-mono text-sm text-red-300 break-words">
                {this.state.error?.message || 'An unexpected client-side error occurred.'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <details className="mt-2">
                  <summary className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer select-none">
                    View Component Stack Trace
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-y-auto font-mono text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded border border-slate-800 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/25"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <a
                href="/"
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
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
