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
      binanceAddress: '0xd1194126385ab996d60542f54e5d8f1372a4cc3e',
      isSuspended: false,
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'usr_admin',
      name: 'Super Admin',
      phone: '01899999999',
      password: 't$5yB1qu4mEa3gR',
      walletBalance: 15000.00,
      frozenWithdrawal: 0,
      totalWon: 0,
      totalLost: 0,
      role: 'ADMIN',
      binancePayId: '1156528658',
      binanceAddress: '0xd1194126385ab996d60542f54e5d8f1372a4cc3e',
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
  },

  // Claim Weekly or Monthly Bonus (Server persistent)
  async claimBonus(userId: string, type: 'weekly' | 'monthly' | 'daily'): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/claim-bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to claim bonus' };
      }
      return { success: true, user: json.user };
    } catch (e) {
      return { success: false, error: 'Network error claiming bonus' };
    }
  },

  // Sync user balance on server
  async syncBalance(userId: string, data: { walletBalance?: number; totalWagered?: number; referralWagerRequirement?: number }): Promise<void> {
    try {
      await fetch(`${API_BASE}/users/${userId}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      // ignore
    }
  },

  // Deposits API
  async fetchDeposits(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/deposits`);
      if (res.ok) {
        const json = await res.json();
        return json.deposits || [];
      }
    } catch (e) {
      // ignore
    }
    return [];
  },

  async createDeposit(depositData: any): Promise<{ success: boolean; deposit?: any; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/deposits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositData),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Deposit submission failed' };
      }
      return { success: true, deposit: json.deposit, user: json.user };
    } catch (e) {
      return { success: false, error: 'Network error submitting deposit' };
    }
  },

  async approveDeposit(depositId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/deposits/${depositId}/approve`, { method: 'POST' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async rejectDeposit(depositId: string, note?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // Withdrawals API
  async fetchWithdrawals(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/withdrawals`);
      if (res.ok) {
        const json = await res.json();
        return json.withdrawals || [];
      }
    } catch (e) {
      // ignore
    }
    return [];
  },

  async createWithdrawal(wthData: any): Promise<{ success: boolean; withdrawal?: any; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/withdrawals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wthData),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Withdrawal submission failed' };
      }
      return { success: true, withdrawal: json.withdrawal, user: json.user };
    } catch (e) {
      return { success: false, error: 'Network error submitting withdrawal' };
    }
  },

  async approveWithdrawal(wthId: string, txHash?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/withdrawals/${wthId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async rejectWithdrawal(wthId: string, note?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/withdrawals/${wthId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // Settings & Quick Notice API
  async fetchSettings(): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        const json = await res.json();
        return json.settings || null;
      }
    } catch (e) {
      // ignore
    }
    return null;
  },

  async updateSettings(settings: any): Promise<{ success: boolean; settings?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to update settings' };
      }
      return { success: true, settings: json.settings };
    } catch (e) {
      return { success: false, error: 'Network error saving settings' };
    }
  },

  // Notifications API
  async fetchNotifications(userId?: string): Promise<any[]> {
    try {
      const url = userId ? `${API_BASE}/notifications?userId=${encodeURIComponent(userId)}` : `${API_BASE}/notifications`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.notifications || [];
      }
    } catch (e) {
      // ignore
    }
    return [];
  },

  async publishNotification(data: {
    title: string;
    message: string;
    badge?: string;
    type?: string;
    userId?: string;
  }): Promise<{ success: boolean; notification?: any; quickNotice?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to publish notice' };
      }
      return { success: true, notification: json.notification, quickNotice: json.quickNotice };
    } catch (e) {
      return { success: false, error: 'Network error publishing notice' };
    }
  }
};
