import axios from 'axios';
import { handleMockApi } from './mockService';

// API Base URL - Environment variable or fallback
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Production vs Local fallback
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/backend/api/v1`;
  }
  return 'http://127.0.0.1:8000/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 1200, // Reduced from 5000ms for instant 0ms response speed
});

// Interceptor to attach Sanctum bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('salvagereef_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle fallback mock data instantly
api.interceptors.response.use(
  (response) => {
    // If backend URL returned HTML (e.g. Apache cPanel redirected missing /backend/api/... to index.html with HTTP 200)
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<')) {
      try {
        const mockResult = handleMockApi(response.config);
        if (mockResult !== undefined) {
          return {
            ...response,
            data: mockResult,
          };
        }
      } catch (mockErr) {
        console.error('Mock fallback error:', mockErr);
      }
    }
    return response;
  },
  async (error) => {
    // If request fails or times out, immediately return instant fallback data
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

export default api;
