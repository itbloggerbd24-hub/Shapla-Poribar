import { UserProfile } from '../types/game';
import { loadFromStorage, saveToStorage } from './storage';

const API_BASE = '/api';

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
  isSuspended?: boolean;
  message?: string;
}

// Local cache helper
const getLocalUsers = (): UserProfile[] => {
  return loadFromStorage<UserProfile[]>('all_users_usd', [
    {
      id: 'usr_player_1',
      name: 'Alex Hunter',
      phone: '01712345678',
      password: '123456',
      walletBalance: 25.00,
      frozenWithdrawal: 0,
      totalWon: 0,
      totalLost: 0,
      role: 'USER',
      binancePayId: '749102381',
      binanceAddress: '0x99A8b724f1165A68CcEc240B2f430F9',
      isSuspended: false,
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'usr_admin',
      name: 'Super Admin',
      phone: '01899999999',
      password: 'admin123',
      walletBalance: 15000.00,
      frozenWithdrawal: 0,
      totalWon: 0,
      totalLost: 0,
      role: 'ADMIN',
      binancePayId: '849204918',
      binanceAddress: '0x3Fa9A80B57F32b9A42Ef78A8696F89c8D11d9C54',
      isSuspended: false,
      createdAt: Date.now() - 86400000 * 30,
    }
  ]);
};

const saveLocalUsers = (users: UserProfile[]) => {
  saveToStorage('all_users_usd', users);
};

export const normalizePhone = (phone: string): string => {
  return String(phone || '').replace(/[\s\-\(\)\+]/g, '');
};

export const authApi = {
  // Register: strictly 1 account per phone number
  async register(data: {
    name: string;
    phone: string;
    password: string;
    binancePayId?: string;
    referralCode?: string;
  }): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Registration failed' };
      }
      return { success: true, user: json.user };
    } catch (e) {
      // Offline / Local database fallback
      const cleanPhone = normalizePhone(data.phone);
      const localUsers = getLocalUsers();
      if (localUsers.some(u => normalizePhone(u.phone) === cleanPhone)) {
        return { 
          success: false, 
          error: 'An account is already registered with this phone number. Multiple accounts are not allowed.' 
        };
      }

      const myRefCode = `SP-${cleanPhone.slice(-4)}`;
      const newUser: UserProfile = {
        id: `usr_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        name: data.name.trim(),
        phone: data.phone.trim(),
        password: data.password.trim(),
        walletBalance: 1.00, // $1.00 USD welcome bonus
        frozenWithdrawal: 0,
        totalWon: 0,
        totalLost: 0,
        role: 'USER',
        binancePayId: data.binancePayId?.trim() || '',
        referralCode: myRefCode,
        referredBy: data.referralCode?.trim() || '',
        referralCount: 0,
        referralBonusEarned: 0,
        isSuspended: false,
        createdAt: Date.now(),
      };

      const updated = [...localUsers, newUser];
      saveLocalUsers(updated);
      return { success: true, user: newUser };
    }
  },

  // Login: universal from any device or browser
  async login(phone: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { 
          success: false, 
          error: json.error || 'Login failed',
          isSuspended: json.isSuspended
        };
      }
      return { success: true, user: json.user };
    } catch (e) {
      // Local database fallback
      const cleanPhone = normalizePhone(phone);
      const localUsers = getLocalUsers();
      const user = localUsers.find(u => normalizePhone(u.phone) === cleanPhone);

      if (!user) {
        return { success: false, error: 'No account found with this phone number.' };
      }

      if (user.password !== password.trim()) {
        return { success: false, error: 'Incorrect password. Please verify and try again.' };
      }

      if (user.isSuspended) {
        return { 
          success: false, 
          error: 'Your account has been suspended by administration. Contact Help Desk support for inquiries.',
          isSuspended: true
        };
      }

      return { success: true, user };
    }
  },

  // Forgot password
  async forgotPassword(phone: string, newPassword: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Reset failed' };
      }
      return { success: true, message: json.message };
    } catch (e) {
      const cleanPhone = normalizePhone(phone);
      const localUsers = getLocalUsers();
      const index = localUsers.findIndex(u => normalizePhone(u.phone) === cleanPhone);

      if (index === -1) {
        return { success: false, error: 'No account found with this phone number.' };
      }

      localUsers[index].password = newPassword.trim();
      saveLocalUsers(localUsers);
      return { success: true, message: 'Password has been updated. You can now login.' };
    }
  },

  // Toggle Suspend (Admin action)
  async toggleSuspend(userId: string, suspended: boolean, reason?: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended, reason }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Action failed' };
      }
      return { success: true, user: json.user };
    } catch (e) {
      const localUsers = getLocalUsers();
      const index = localUsers.findIndex(u => u.id === userId);
      if (index !== -1) {
        localUsers[index].isSuspended = suspended;
        if (reason) localUsers[index].suspensionReason = reason;
        saveLocalUsers(localUsers);
        return { success: true, user: localUsers[index] };
      }
      return { success: false, error: 'User not found' };
    }
  },

  // Fetch all users
  async fetchUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) {
        const json = await res.json();
        if (json.users && Array.isArray(json.users)) {
          saveLocalUsers(json.users);
          return json.users;
        }
      }
    } catch (e) {
      // ignore
    }
    return getLocalUsers();
  }
};
