import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertOctagon, Home, ArrowLeft, RefreshCw, Mail } from 'lucide-react';

interface ErrorPageProps {
  code?: 404 | 500 | 503 | number;
  title?: string;
  message?: string;
}

export default function ErrorPage({
  code = 404,
  title,
  message,
}: ErrorPageProps) {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (code) {
      case 404:
        return {
          codeStr: '404',
          defaultTitle: 'Page Not Found',
          defaultMessage:
            'The requested page could not be located on SalvageReef. It may have been moved, renamed, or temporarily unavailable.',
          badgeColor: 'bg-amber-500/10 border-amber-500/20 text-amber-600',
        };
      case 500:
        return {
          codeStr: '500',
          defaultTitle: 'Internal Server Error',
          defaultMessage:
            'Our system encountered an unexpected server issue. The error has been logged automatically to our Admin Error Desk for resolution.',
          badgeColor: 'bg-red-500/10 border-red-500/20 text-red-600',
        };
      default:
        return {
          codeStr: String(code),
          defaultTitle: title || 'An Error Occurred',
          defaultMessage:
            message ||
            'Something went wrong while processing your request. Please try again or return to the main dashboard.',
          badgeColor: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-xl w-full text-center bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-2xl text-red-500 mb-6 shadow-sm">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <span
          className={`inline-block px-3 py-1 text-xs font-bold rounded-full border mb-3 ${content.badgeColor}`}
        >
          ERROR CODE: {content.codeStr}
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          {title || content.defaultTitle}
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          {message || content.defaultMessage}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center text-xs text-slate-400 space-x-2">
          <Mail className="w-3.5 h-3.5" />
          <span>Need help? Contact support@salvagereef.com</span>
        </div>
      </div>
    </div>
  );
}
