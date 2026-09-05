import { apiClient, setAuthToken, removeAuthToken, getAuthToken } from '../lib/api/client';
import { RoleType } from '@campuspulse/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  roles: (RoleType | string)[];
  studentProfile?: {
    id?: string;
    university?: { id: string; name: string; slug: string } | null;
    faculty?: { id: string; name: string } | null;
    department?: { id: string; name: string } | null;
  } | null;
  organizations?: Array<{
    id: string;
    name: string;
    role: string;
    title?: string;
  }>;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: AuthUser;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    if (res?.accessToken) {
      setAuthToken(res.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('campuspulse_user', JSON.stringify(res.user));
      }
    }

    return res;
  },

  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  }): Promise<AuthResponse> {
    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      firstName: data.firstName?.trim(),
      lastName: data.lastName?.trim(),
      name: data.name?.trim() || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      role: RoleType.STUDENT,
    };

    const res = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res?.accessToken) {
      setAuthToken(res.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('campuspulse_user', JSON.stringify(res.user));
      }
    }

    return res;
  },

  async getMe(): Promise<AuthUser> {
    const res = await apiClient<AuthUser>('/auth/me');
    if (res && typeof window !== 'undefined') {
      localStorage.setItem('campuspulse_user', JSON.stringify(res));
    }
    return res;
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('campuspulse_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },

  async getProfile(): Promise<any> {
    return apiClient<any>('/users/me/profile');
  },

  async updateProfile(data: {
    name?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
    [key: string]: any;
  }): Promise<any> {
    const res = await apiClient<any>('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && typeof window !== 'undefined') {
      const current = this.getCurrentUser();
      if (current) {
        const updated = {
          ...current,
          name: data.name || (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : current.name),
          avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : current.avatarUrl,
        };
        localStorage.setItem('campuspulse_user', JSON.stringify(updated));
      }
    }
    return res;
  },

  logout() {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('campuspulse_user');
      localStorage.removeItem('campuspulse_profile');
    }
  },
};
