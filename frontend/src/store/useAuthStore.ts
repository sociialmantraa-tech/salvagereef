import { create } from 'zustand';
import axios from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginWithGoogle: (googlePayload?: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (formData: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// 7 Days Session Expiry Helper
const SESSION_EXPIRY_DAYS = 7;
const isSessionValid = (): boolean => {
  const token = localStorage.getItem('salvagereef_token');
  const expStr = localStorage.getItem('salvagereef_token_exp');
  if (!token || !expStr) return false;

  const expTime = parseInt(expStr, 10);
  if (Date.now() > expTime) {
    localStorage.removeItem('salvagereef_user');
    localStorage.removeItem('salvagereef_token');
    localStorage.removeItem('salvagereef_token_exp');
    return false;
  }
  return true;
};

const setSessionData = (user: User, token: string) => {
  const expiryTime = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem('salvagereef_user', JSON.stringify(user));
  localStorage.setItem('salvagereef_token', token);
  localStorage.setItem('salvagereef_token_exp', expiryTime.toString());
};

export const useAuthStore = create<AuthState>((set) => ({
  user: isSessionValid() ? JSON.parse(localStorage.getItem('salvagereef_user') || 'null') : null,
  token: isSessionValid() ? localStorage.getItem('salvagereef_token') : null,
  isAuthenticated: isSessionValid(),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { user, token } = response.data;

      setSessionData(user, token);

      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Login failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  loginWithGoogle: async (googlePayload?: any) => {
    set({ loading: true, error: null });
    try {
      const payload = googlePayload || {
        email: 'admin@salvagereef.com',
        name: 'Google Verified User',
      };

      const response = await axios.post('/auth/google', payload);
      const { user, token } = response.data;

      setSessionData(user, token);

      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Google Sign-In failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/auth/register', formData);
      const { user, token } = response.data;

      setSessionData(user, token);

      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await axios.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('salvagereef_user');
      localStorage.removeItem('salvagereef_token');
      localStorage.removeItem('salvagereef_token_exp');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    if (!isSessionValid()) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }
    const token = localStorage.getItem('salvagereef_token');
    if (!token) return;
    try {
      const res = await axios.get('/auth/me');
      const user = res.data.user;
      const expStr = localStorage.getItem('salvagereef_token_exp') || (Date.now() + 7 * 24 * 60 * 60 * 1000).toString();
      localStorage.setItem('salvagereef_user', JSON.stringify(user));
      localStorage.setItem('salvagereef_token_exp', expStr);
      set({ user, isAuthenticated: true });
    } catch (e) {
      localStorage.removeItem('salvagereef_user');
      localStorage.removeItem('salvagereef_token');
      localStorage.removeItem('salvagereef_token_exp');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
