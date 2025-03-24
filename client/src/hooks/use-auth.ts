import { create } from 'zustand';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'customer' | 'farmer' | 'delivery';
  phone?: string;
  address?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface RegisterData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'customer' | 'farmer' | 'delivery';
  phone?: string;
  address?: string;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', '/api/login', { username, password });
      const data = await response.json();

      localStorage.setItem('token', data.token);
      
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Invalidate queries that might depend on authentication status
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to login',
        isLoading: false,
      });
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', '/api/register', userData);
      const data = await response.json();

      localStorage.setItem('token', data.token);
      
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Invalidate queries that might depend on authentication status
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to register',
        isLoading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    // Invalidate queries that might depend on authentication status
    queryClient.invalidateQueries();
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Hook to fetch user profile on app initialization
export const initializeAuth = async () => {
  const { token, isAuthenticated, logout } = useAuth.getState();
  
  if (isAuthenticated && token) {
    try {
      const response = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await response.json();
      useAuth.setState({ user: userData });
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  }
};
