import api from './api';

export interface SystemErrorItem {
  id: number | string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  message: string;
  exception_class?: string;
  file?: string;
  line?: number | string;
  url: string;
  method?: string;
  status: 'unresolved' | 'resolved';
  user?: { id: number; name: string; email: string; role: string } | null;
  created_at: string;
  stack_trace?: string;
  source?: 'frontend' | 'backend' | 'api';
  resolved_at?: string | null;
  fix_notes?: string;
}

const STORAGE_KEY = 'sr_system_error_logs';
const MAX_STORED_LOGS = 300;

export function getStoredErrors(): SystemErrorItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored error logs:', e);
  }

  // Seed default initial logs for diagnostics
  const sampleLogs: SystemErrorItem[] = [
    {
      id: 101,
      severity: 'info',
      message: 'SalvageReef Error Tracking & AI Diagnostics Engine Initialized.',
      exception_class: 'SystemInit',
      file: 'frontend/src/services/errorService.ts',
      line: 1,
      url: window.location.pathname || '/admin',
      method: 'GET',
      status: 'resolved',
      created_at: new Date().toISOString(),
      source: 'frontend',
      fix_notes: 'System telemetry online and operational.',
    }
  ];
  saveStoredErrors(sampleLogs);
  return sampleLogs;
}

export function saveStoredErrors(logs: SystemErrorItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_STORED_LOGS)));
  } catch (e) {
    console.error('Failed to persist error logs:', e);
  }
}

/**
 * Log a system error from anywhere in the application.
 */
export async function logSystemError(
  err: any,
  context: {
    severity?: 'critical' | 'error' | 'warning' | 'info';
    file?: string;
    line?: number | string;
    exception_class?: string;
    stack_trace?: string;
    method?: string;
    url?: string;
    source?: 'frontend' | 'backend' | 'api';
  } = {}
): Promise<SystemErrorItem> {
  const currentLogs = getStoredErrors();
  
  let message = 'Unknown Application Error';
  let stack = context.stack_trace || '';
  let exceptionClass = context.exception_class || 'RuntimeError';

  if (typeof err === 'string') {
    message = err;
  } else if (err instanceof Error) {
    message = err.message || err.toString();
    stack = stack || err.stack || '';
    exceptionClass = exceptionClass || err.name || 'Error';
  } else if (err && typeof err === 'object') {
    message = err.message || err.error || JSON.stringify(err);
    if (err.stack) stack = stack || err.stack;
  }

  let currentUser: any = null;
  try {
    const userRaw = localStorage.getItem('salvagereef_user');
    if (userRaw) currentUser = JSON.parse(userRaw);
  } catch {}

  const newError: SystemErrorItem = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    severity: context.severity || (message.toLowerCase().includes('critical') || message.toLowerCase().includes('fatal') ? 'critical' : 'error'),
    message: String(message),
    exception_class: exceptionClass,
    file: context.file || (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
    line: context.line || 1,
    url: context.url || (typeof window !== 'undefined' ? window.location.href : '/'),
    method: context.method || 'CLIENT',
    status: 'unresolved',
    user: currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role } : null,
    created_at: new Date().toISOString(),
    stack_trace: stack,
    source: context.source || 'frontend',
  };

  // Add to local state (prepend)
  const updatedLogs = [newError, ...currentLogs.filter(l => l.message !== newError.message || Math.abs(new Date(l.created_at).getTime() - new Date(newError.created_at).getTime()) > 5000)].slice(0, MAX_STORED_LOGS);
  saveStoredErrors(updatedLogs);

  // Dispatch custom browser event so UI updates in real-time
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sr_error_logged', { detail: newError }));
  }

  // Attempt to forward to backend error endpoint asynchronously
  try {
    await api.post('/errors/report', newError);
  } catch {
    // If backend is unreachable or offline, local storage already captured it safely
  }

  return newError;
}

/**
 * Initialize global window error handlers once at app start.
 */
export function initGlobalErrorLogging() {
  if (typeof window === 'undefined') return;

  // Catch unhandled JS runtime errors
  window.addEventListener('error', (event) => {
    // Ignore harmless cross-origin script error noise
    if (event.message === 'Script error.' && !event.filename) return;

    logSystemError(event.error || event.message, {
      file: event.filename,
      line: event.lineno,
      severity: 'error',
      source: 'frontend',
      exception_class: event.error?.name || 'UncaughtError',
      stack_trace: event.error?.stack,
    });
  });

  // Catch unhandled Promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    logSystemError(reason || 'Unhandled Promise Rejection', {
      severity: 'error',
      source: 'frontend',
      exception_class: 'UnhandledRejection',
      stack_trace: reason?.stack,
    });
  });
}
