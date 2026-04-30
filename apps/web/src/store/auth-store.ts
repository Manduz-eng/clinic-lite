import { create } from 'zustand';
import api from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, tenantSlug: string) => Promise<void>;
  register: (data: {
    tenantName: string;
    tenantSlug: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password, tenantSlug) => {
    const { data } = await api.post('/auth/login', { email, password, tenantSlug });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, tenant: data.tenant, isAuthenticated: true, isLoading: false });
  },

  register: async (registerData) => {
    const { data } = await api.post('/auth/register', registerData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, tenant: data.tenant, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, tenant: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        set({
          user: { id: payload.userId, email: payload.email, firstName: '', lastName: '', role: payload.roleName },
          tenant: { id: payload.tenantId, name: '', slug: '' },
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
