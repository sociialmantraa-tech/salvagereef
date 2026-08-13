/**
 * SalvageReef Frontend Error Reporter
 * Captures all unhandled JS errors, promise rejections, and React errors
 * and sends them to the backend /api/v1/client/error endpoint.
 * Silently drops errors if the server is unreachable.
 */

const API_BASE = (() => {
  if ((import.meta as any).env?.VITE_API_BASE_URL) return (import.meta as any).env.VITE_API_BASE_URL;
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/backend/api/v1`;
  }
  return '/api/v1';
})();

// Rate limit: max 10 errors per session to avoid flooding
let _errorCount = 0;
const MAX_ERRORS_PER_SESSION = 10;

async function sendErrorToServer(data: Record<string, any>): Promise<void> {
  if (_errorCount >= MAX_ERRORS_PER_SESSION) return;
  _errorCount++;

  try {
    await fetch(`${API_BASE}/client/error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        url: window.location.href,
        referrer: document.referrer,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        ts: new Date().toISOString(),
      }),
      // Don't wait long for this — non-critical
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Silently ignore — error reporting is non-critical
  }
}

/**
 * Install global error listeners.
 * Call this once at app startup.
 */
export function installErrorReporter(): void {
  // Unhandled JavaScript errors
  window.addEventListener('error', (event: ErrorEvent) => {
    // Skip browser extension errors
    if (!event.filename || event.filename.startsWith('chrome-extension://')) return;

    sendErrorToServer({
      type: 'JS_ERROR',
      message: event.message || 'Unknown error',
      source: event.filename || '',
      line: event.lineno || 0,
      col: event.colno || 0,
      stack: event.error?.stack || '',
    });
  });

  // Unhandled Promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const message = reason instanceof Error
      ? reason.message
      : (typeof reason === 'string' ? reason : JSON.stringify(reason));

    sendErrorToServer({
      type: 'UNHANDLED_PROMISE_REJECTION',
      message: message || 'Unhandled promise rejection',
      stack: reason instanceof Error ? reason.stack || '' : '',
    });
  });
}

/**
 * Manually report an error from a React Error Boundary or try/catch block.
 */
export function reportError(error: Error | string, context?: Record<string, any>): void {
  const message = error instanceof Error ? error.message : error;
  const stack   = error instanceof Error ? error.stack || '' : '';

  sendErrorToServer({
    type: 'MANUAL_REPORT',
    message,
    stack,
    ...(context || {}),
  });
}
