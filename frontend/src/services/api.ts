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

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── API Base URL ─────────────────────────────────────────────────────────────
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/backend/api/v1`;
  }
  return '/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 8000, // 8 second timeout — fast fail if server is unreachable
});

// ─── HMAC Signature Cache (avoid recomputing on every request) ────────────────
let _cachedSig: string | null = null;
let _cachedSigTime = 0;

async function getRequestSignature(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  // Reuse cached signature if it's less than 25 seconds old
  if (_cachedSig && now - _cachedSigTime < 25) {
    return _cachedSig;
  }
  _cachedSig = await computeRequestSignature(now);
  _cachedSigTime = now;
  return _cachedSig;
}

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attaches Bearer token + HMAC-SHA256 signature (only on write requests)
api.interceptors.request.use(async (config) => {
  // 1. Attach auth token
  const token = localStorage.getItem('salvagereef_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Sign write requests only (POST, PUT, DELETE, PATCH)
  // GET requests are NOT signed — no crypto overhead on reads
  const method = config.method?.toLowerCase() ?? '';
  if (method === 'post' || method === 'put' || method === 'delete' || method === 'patch') {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await getRequestSignature(); // uses 25-second cache
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
    // If backend URL returned HTML (e.g. Apache cPanel redirect to index.html with HTTP 200)
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<')) {
      try {
        const mockResult = handleMockApi(response.config);
        if (mockResult !== undefined) {
          return { ...response, data: mockResult };
        }
      } catch (mockErr) {
        console.error('Mock fallback error:', mockErr);
      }
    }
    return response;
  },
  async (error) => {
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

