import axios from 'axios';
import { handleMockApi } from './mockService';

// ─── App Security Configuration ─────────────────────────────────────────────
// This secret MUST match SR_APP_SECRET in backend/security_config.php
const SR_APP_SECRET = 'SR2026#SalvageReef!SecretKey@India$Backend%Secure^7304481166';

/**
 * Compute HMAC-SHA256 request signature for write-request authentication.
 * Signature = HMAC_SHA256( key=APP_SECRET, data=timestamp + ':' + APP_SECRET )
 */
async function computeRequestSignature(timestamp: number): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(SR_APP_SECRET);
  const msgData = enc.encode(`${timestamp}:${SR_APP_SECRET}`);

  const subtle = typeof window !== 'undefined' ? window.crypto?.subtle : (globalThis as any)?.crypto?.subtle;
  if (!subtle) return '';

  const cryptoKey = await subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuffer = await subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── API Base URL ─────────────────────────────────────────────────────────────
const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    if ((window as any).__VITE_API_BASE_URL) {
      return (window as any).__VITE_API_BASE_URL;
    }
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.origin}/backend/server.php/api/v1`;
    }
  }
  return '/backend/server.php/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 8000, // 8 second timeout — fast fail if server is unreachable
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attaches Bearer token + HMAC-SHA256 signature (only on write requests) + cache-buster
api.interceptors.request.use(async (config) => {
  // 1. Attach auth token
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('salvagereef_token') 
      || localStorage.getItem('token') 
      || localStorage.getItem('auth_token') 
      || (localStorage.getItem('sr_admin_auth') === 'true' ? 'sr_master_admin_token' : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // 2. Add cache-buster to GET requests to guarantee real-time fresh data across all browsers
  if (config.method?.toLowerCase() === 'get') {
    config.params = {
      ...(config.params || {}),
      _cb: Date.now(),
    };
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
  }

  // 3. Sign write requests only (POST, PUT, DELETE, PATCH)
  const method = config.method?.toLowerCase() ?? '';
  if (method === 'post' || method === 'put' || method === 'delete' || method === 'patch') {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await computeRequestSignature(timestamp);
      config.headers['X-App-Timestamp'] = String(timestamp);
      config.headers['X-App-Signature'] = signature;
    } catch {
      // Non-fatal — proceed without signature
    }
  }

  return config;
});

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // If backend URL returned a string containing JSON with trailing hosting scripts (e.g. GoDaddy mod_layout)
    if (typeof response.data === 'string') {
      const trimmed = response.data.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const jsonOnly = trimmed.replace(/<script[\s\S]*$/i, '').trim();
          response.data = JSON.parse(jsonOnly);
          return response;
        } catch (e) {}
      }
      // If backend URL returned HTML (e.g. Apache cPanel redirect to index.html with HTTP 200)
      if (trimmed.toLowerCase().startsWith('<')) {
        try {
          const mockResult = handleMockApi(response.config);
          if (mockResult !== undefined) {
            return { ...response, data: mockResult };
          }
        } catch (mockErr) {
          console.error('Mock fallback error:', mockErr);
        }
      }
    }
    return response;
  },
  async (error) => {
    // 0. Clean trailing script tags from error response data if present
    if (error.response && typeof error.response.data === 'string') {
      const trimmed = error.response.data.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const jsonOnly = trimmed.replace(/<script[\s\S]*$/i, '').trim();
          error.response.data = JSON.parse(jsonOnly);
        } catch (e) {}
      }
    }

    // 1. If backend URL returned 404 (e.g. Vite dev server unhandled API route) or network error, fallback to mock API
    if (!error.response || error.response.status === 404) {
      try {
        const mockResult = handleMockApi(error.config);
        if (mockResult !== undefined) {
          return {
            data: mockResult,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          };
        }
      } catch (mockErr) {
        console.error('Mock fallback handler error:', mockErr);
      }
    }


    // 2. Pass real backend HTTP validation errors (e.g. 400, 401, 422, 500) directly to caller
    if (error.response && error.response.status) {
      if (error.response.status === 401) {
        localStorage.removeItem('salvagereef_token');
        localStorage.removeItem('salvagereef_user');
      }

      // Automatically capture API errors into System Error Diagnostics (ignore error logging / telemetry endpoints to prevent recursive loop)
      const reqUrl = String(error.config?.url || '');
      const isTelemetryRoute = 
        reqUrl.includes('/errors') || 
        reqUrl.includes('/logs') || 
        reqUrl.includes('/system_mode') || 
        reqUrl.includes('/maintenance');

      if (!isTelemetryRoute && typeof window !== 'undefined') {
        try {
          const rawMsg = error.response?.data?.message || error.message || `API Error HTTP ${error.response.status}`;
          const currentLogs = JSON.parse(localStorage.getItem('sr_system_error_logs') || '[]');
          const severityVal: 'critical' | 'error' = error.response.status >= 500 ? 'critical' : 'error';
          const newErr = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            severity: severityVal,
            message: `[API ${error.config?.method?.toUpperCase()} ${error.response.status}] ${rawMsg}`,
            exception_class: `HttpException_${error.response.status}`,
            file: `frontend/src/services/api.ts -> ${reqUrl}`,
            line: 1,
            url: reqUrl,
            method: (error.config?.method || 'GET').toUpperCase(),
            status: 'unresolved' as const,
            created_at: new Date().toISOString(),
            stack_trace: error.stack || '',
            source: 'api' as const,
          };
          const updated = [newErr, ...currentLogs.filter((l: any) => l.message !== newErr.message)].slice(0, 300);
          localStorage.setItem('sr_system_error_logs', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('sr_error_logged', { detail: newErr }));
        } catch {}
      }

      return Promise.reject(error);
    }

    // 3. Fallback to mock data if backend server is offline
    try {
      const mockResult = handleMockApi(error.config);
      if (mockResult !== undefined) {
        return {
          data: mockResult,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        };
      }
    } catch (mockErr) {
      console.error('Mock fallback handler error:', mockErr);
    }

    // Capture offline or unhandled network failure into System Error Diagnostics (ignore telemetry routes)
    const reqUrl = String(error.config?.url || '');
    const isTelemetryRoute = 
      reqUrl.includes('/errors') || 
      reqUrl.includes('/logs') || 
      reqUrl.includes('/system_mode') || 
      reqUrl.includes('/maintenance');

    if (!isTelemetryRoute && typeof window !== 'undefined') {
      try {
        const currentLogs = JSON.parse(localStorage.getItem('sr_system_error_logs') || '[]');
        const newErr = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          severity: 'error' as const,
          message: `[Network/Offline] ${error.message || 'Server connection failed'} on ${reqUrl}`,
          exception_class: 'NetworkException',
          file: `frontend/src/services/api.ts -> ${reqUrl}`,
          line: 1,
          url: reqUrl,
          method: (error.config?.method || 'GET').toUpperCase(),
          status: 'unresolved' as const,
          created_at: new Date().toISOString(),
          stack_trace: error.stack || '',
          source: 'api' as const,
        };
        const updated = [newErr, ...currentLogs.filter((l: any) => l.message !== newErr.message)].slice(0, 300);
        localStorage.setItem('sr_system_error_logs', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('sr_error_logged', { detail: newErr }));
      } catch {}
    }

    return Promise.reject(error);
  }
);

/**
 * Upload a file to the SalvageReef upload endpoint.
 * Sends multipart/form-data with proper auth + HMAC headers.
 * @param endpoint - e.g. '/admin/upload'
 * @param formData - FormData containing 'file' and 'type' fields
 * @returns The parsed JSON response { url, filename, type, size } or throws on error
 */
export async function uploadFile(endpoint: string, formData: FormData): Promise<any> {
  const token = localStorage.getItem('salvagereef_token');
  const timestamp = Math.floor(Date.now() / 1000);

  // Compute HMAC signature for the upload request
  let signature = '';
  try {
    signature = await computeRequestSignature(timestamp);
  } catch {
    // Non-fatal — proceed without signature
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-App-Timestamp': String(timestamp),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (signature) headers['X-App-Signature'] = signature;
  // Do NOT set Content-Type manually — browser sets multipart/form-data with boundary automatically

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ message: `Upload failed with HTTP ${response.status}` }));
    throw new Error(errData.message || `Upload failed: HTTP ${response.status}`);
  }

  return response.json();
}

// Attach uploadFile as a method on api instance for convenience
(api as any).uploadFile = uploadFile;

export default api;

