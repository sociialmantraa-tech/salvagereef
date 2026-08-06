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
  register: (formData: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('salvagereef_user') || 'null'),
  token: localStorage.getItem('salvagereef_token') || null,
  isAuthenticated: !!localStorage.getItem('salvagereef_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { user, token } = response.data;

      localStorage.setItem('salvagereef_user', JSON.stringify(user));
      localStorage.setItem('salvagereef_token', token);

      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Login failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/auth/register', formData);
      const { user, token } = response.data;

      localStorage.setItem('salvagereef_user', JSON.stringify(user));
      localStorage.setItem('salvagereef_token', token);

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
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('salvagereef_token');
    if (!token) return;
    try {
      const res = await axios.get('/auth/me');
      const user = res.data.user;
      localStorage.setItem('salvagereef_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (e) {
      localStorage.removeItem('salvagereef_user');
      localStorage.removeItem('salvagereef_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
