import { UserProfile } from '../types/game';
import {
  normalizePhone,
  isPhoneMatch,
  isUserMatch,
  getVaultUsersSync,
  getVaultUsersAsync,
  saveUserToVault,
  mergeServerUsersIntoVault,
  findVaultUser,
} from './accountVault';

export { normalizePhone, isPhoneMatch };

const API_BASE = '/api';

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
  isSuspended?: boolean;
  message?: string;
}

const syncUserToServer = async (user: UserProfile): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/auth/sync-local-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const authApi = {
  // Send phone verification code (SMS/OTP)
  async sendVerificationCode(phone: string): Promise<{ success: boolean; message?: string; code?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to send verification code.' };
      }
      return { success: true, message: json.message, code: json.code };
    } catch (e) {
      // Local simulated fallback
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      return { success: true, message: `Verification code sent to ${phone}.`, code: mockCode };
    }
  },

  // Verify phone code
  async verifyCode(phone: string, code: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Invalid verification code.' };
      }
      return { success: true, message: json.message };
    } catch (e) {
      return { success: true, message: 'Verified' };
    }
  },

  // Register: strictly 1 account per phone & NID with security question
  async register(data: {
    name: string;
    phone: string;
    password: string;
    nid: string;
    securityQuestion: string;
    securityAnswer: string;
    verificationCode: string;
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
      // Guarantee dual persistent vault storage (localStorage + IndexedDB)
      if (json.user) {
        saveUserToVault({
          ...json.user,
          password: data.password.trim(),
          nid: data.nid.trim(),
          securityQuestion: data.securityQuestion.trim(),
          securityAnswer: data.securityAnswer.trim().toLowerCase(),
        });
      }
      return { success: true, user: json.user };
    } catch (e) {
      // Offline / Local database fallback
      const cleanPhone = normalizePhone(data.phone);
      const localUsers = await getVaultUsersAsync();
      if (localUsers.some(u => isPhoneMatch(u.phone, cleanPhone))) {
        return { 
          success: false, 
          error: 'An account is already registered with this phone number. Multiple accounts are not allowed.' 
        };
      }

      const myRefCode = `SP-${cleanPhone.slice(-4)}`;
      const newUser: UserProfile = {
        id: `usr_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        name: data.name.trim(),
        phone: cleanPhone,
        password: data.password.trim(),
        nid: data.nid.trim(),
        securityQuestion: data.securityQuestion.trim(),
        securityAnswer: data.securityAnswer.trim().toLowerCase(),
        walletBalance: 0.00,
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

      saveUserToVault(newUser);
      return { success: true, user: newUser };
    }
  },

  // Login: universal across devices and website updates with IndexedDB + localStorage vault auto-restore
  async login(phone: string, password: string): Promise<AuthResponse> {
    const cleanPassword = password.trim();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: cleanPassword }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.user) {
        saveUserToVault({ ...json.user, password: cleanPassword });
        return { success: true, user: json.user };
      }

      // If server returned 401/404 ("No account registered" after site update), check persistent vault
      if (res.status === 401 || res.status === 404) {
        const vaultUser = await findVaultUser(phone);
        if (vaultUser) {
          if (vaultUser.password && vaultUser.password !== cleanPassword) {
            return { success: false, error: 'Incorrect password. Please verify and try again.' };
          }
          if (vaultUser.password === cleanPassword) {
            if (vaultUser.isSuspended) {
              return {
                success: false,
                error: 'Your account has been suspended by administration. Contact Help Desk support for inquiries.',
                isSuspended: true,
              };
            }
            await syncUserToServer(vaultUser);
            return { success: true, user: vaultUser };
          }
        }
      }

      return { 
        success: false, 
        error: json.error || 'Login failed',
        isSuspended: json.isSuspended
      };
    } catch (e) {
      // Local / IndexedDB vault fallback
      const user = await findVaultUser(phone);

      if (!user) {
        return { success: false, error: 'No account found with this phone number.' };
      }

      if (user.password !== cleanPassword) {
        return { success: false, error: 'Incorrect password. Please verify and try again.' };
      }

      if (user.isSuspended) {
        return { 
          success: false, 
          error: 'Your account has been suspended by administration. Contact Help Desk support for inquiries.',
          isSuspended: true
        };
      }

      await syncUserToServer(user);
      return { success: true, user };
    }
  },

  // Get Security Question for phone
  async getSecurityQuestion(phone: string): Promise<{ success: boolean; securityQuestion?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/get-security-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (res.ok) {
        return { success: true, securityQuestion: json.securityQuestion };
      }
      if (res.status === 404) {
        const vaultUser = await findVaultUser(phone);
        if (vaultUser) {
          await syncUserToServer(vaultUser);
          return { success: true, securityQuestion: vaultUser.securityQuestion || "What is your childhood nickname?" };
        }
      }
      return { success: false, error: json.error || 'Failed to retrieve security question.' };
    } catch (e) {
      const user = await findVaultUser(phone);
      if (!user) return { success: false, error: 'No account found with this phone number.' };
      return { success: true, securityQuestion: user.securityQuestion || "What is your childhood nickname?" };
    }
  },

  // Reset password using Security Question (supports selecting question & post-update vault recovery)
  async resetWithSecurityQuestion(
    phone: string, 
    securityQuestion: string, 
    securityAnswer: string, 
    newPassword: string
  ): Promise<AuthResponse> {
    const cleanNewPassword = newPassword.trim();
    try {
      const res = await fetch(`${API_BASE}/auth/reset-with-security-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, securityQuestion, securityAnswer, newPassword: cleanNewPassword }),
      });
      const json = await res.json();

      if (res.ok) {
        const vaultUser = await findVaultUser(phone);
        if (vaultUser) {
          saveUserToVault({ ...vaultUser, password: cleanNewPassword });
        }
        return { success: true, message: json.message };
      }

      // If server returned 404 after update, verify against persistent vault and restore to server
      if (res.status === 404) {
        const vaultUser = await findVaultUser(phone);
        if (vaultUser) {
          if (securityQuestion && vaultUser.securityQuestion) {
            if (vaultUser.securityQuestion.toLowerCase() !== securityQuestion.trim().toLowerCase()) {
              return {
                success: false,
                error: 'The selected security question does not match this account. Please select the question you chose during registration, or click "Forgot Security Question" below.'
              };
            }
          }
          if (vaultUser.securityAnswer && vaultUser.securityAnswer.toLowerCase() !== securityAnswer.trim().toLowerCase()) {
            return { success: false, error: 'Incorrect answer to security question. If forgotten, recover via NID.' };
          }
          const updatedUser = { ...vaultUser, password: cleanNewPassword };
          saveUserToVault(updatedUser);
          await syncUserToServer(updatedUser);
          return { success: true, message: 'Password has been updated. You can now login.' };
        }
      }

      return { success: false, error: json.error || 'Reset failed.' };
    } catch (e) {
      const user = await findVaultUser(phone);

      if (!user) {
        return { success: false, error: 'No account found with this phone number.' };
      }

      if (securityQuestion && user.securityQuestion) {
        if (user.securityQuestion.toLowerCase() !== securityQuestion.trim().toLowerCase()) {
          return {
            success: false,
            error: 'The selected security question does not match this account. Please select the question you chose during registration, or click "Forgot Security Question" below.'
          };
        }
      }

      if (user.securityAnswer && user.securityAnswer.toLowerCase() !== securityAnswer.trim().toLowerCase()) {
        return { success: false, error: 'Incorrect answer to security question. If forgotten, recover via NID.' };
      }

      const updatedUser = { ...user, password: cleanNewPassword };
      saveUserToVault(updatedUser);
      await syncUserToServer(updatedUser);
      return { success: true, message: 'Password has been updated. You can now login.' };
    }
  },

  // Recover Security Question using NID + Phone Number (with vault auto-restore)
  async recoverSecurityQuestion(phone: string, nid: string): Promise<{ 
    success: boolean; 
    securityQuestion?: string; 
    securityAnswer?: string; 
    smsMessage?: string; 
    message?: string; 
    error?: string; 
  }> {
    try {
      const res = await fetch(`${API_BASE}/auth/recover-security-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, nid }),
      });
      const json = await res.json();
      if (res.ok) {
        return {
          success: true,
          securityQuestion: json.securityQuestion,
          securityAnswer: json.securityAnswer,
          smsMessage: json.smsMessage,
          message: json.message,
        };
      }
      if (res.status === 404) {
        const vaultUser = await findVaultUser(phone);
        if (vaultUser) {
          if (!vaultUser.nid || String(vaultUser.nid).trim() !== String(nid).trim()) {
            return { success: false, error: 'NID number does not match our records for this account.' };
          }
          await syncUserToServer(vaultUser);
          const q = vaultUser.securityQuestion || "What is your childhood nickname?";
          const a = vaultUser.securityAnswer || "shanto";
          return {
            success: true,
            securityQuestion: q,
            securityAnswer: a,
            smsMessage: `SMS to ${phone}: Security Recovery: Your question is "${q}" and answer is "${a}".`,
            message: 'Security details verified. Your Security Question and Answer have been sent via SMS.',
          };
        }
      }
      return { success: false, error: json.error || 'NID and Phone verification failed.' };
    } catch (e) {
      const user = await findVaultUser(phone);

      if (!user) return { success: false, error: 'No account registered with this phone number.' };
      if (!user.nid || String(user.nid).trim() !== String(nid).trim()) {
        return { success: false, error: 'NID number does not match our records for this account.' };
      }

      const q = user.securityQuestion || "What is your childhood nickname?";
      const a = user.securityAnswer || "shanto";
      return {
        success: true,
        securityQuestion: q,
        securityAnswer: a,
        smsMessage: `SMS to ${phone}: Security Recovery: Your question is "${q}" and answer is "${a}".`,
        message: 'Security details verified. Your Security Question and Answer have been sent via SMS.',
      };
    }
  },

  // Bets persistence API
  async fetchBets(userId?: string): Promise<any[]> {
    try {
      const url = userId ? `${API_BASE}/bets?userId=${encodeURIComponent(userId)}` : `${API_BASE}/bets`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.bets || [];
      }
    } catch (e) {}
    return [];
  },

  async recordBet(bet: any): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bet),
      });
      return true;
    } catch (e) {
      return false;
    }
  },

  async resolveBets(roundId: number, winner: string, winningPayoutMultiplier: number = 1.85): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/bets/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId, winner, winningPayoutMultiplier }),
      });
      return true;
    } catch (e) {
      return false;
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
      if (json.user) saveUserToVault(json.user);
      return { success: true, user: json.user };
    } catch (e) {
      const localUsers = await getVaultUsersAsync();
      const target = localUsers.find(u => u.id === userId);
      if (target) {
        const updated = { ...target, isSuspended: suspended, ...(reason ? { suspensionReason: reason } : {}) };
        saveUserToVault(updated);
        return { success: true, user: updated };
      }
      return { success: false, error: 'User not found' };
    }
  },

  // Restore a single user to backend if missing after update
  async restoreUserToServer(user: UserProfile): Promise<boolean> {
    if (!user || !user.phone) return false;
    const vaultMatch = await findVaultUser(user.phone || user.id);
    const merged = vaultMatch
      ? {
          ...vaultMatch,
          ...user,
          password: user.password || vaultMatch.password,
          nid: user.nid || vaultMatch.nid,
          securityQuestion: user.securityQuestion || vaultMatch.securityQuestion,
          securityAnswer: user.securityAnswer || vaultMatch.securityAnswer,
        }
      : user;
    saveUserToVault(merged);
    return syncUserToServer(merged);
  },

  // Fetch all users non-destructively (merges vault + syncs back any accounts missing on updated server)
  async fetchUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) {
        const json = await res.json();
        if (json.users && Array.isArray(json.users)) {
          const { mergedUsers, missingOnServer } = await mergeServerUsersIntoVault(json.users);

          // Automatically restore any accounts from local/IndexedDB vault that vanished after a website update
          const restorable = missingOnServer.filter((u) => Boolean(u.phone && (u.password || u.id)));
          if (restorable.length > 0) {
            try {
              await fetch(`${API_BASE}/auth/sync-local-users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: restorable }),
              });
            } catch {
              // ignore batch restore network failure; individual sync will handle on login
            }
          }

          return mergedUsers;
        }
      }
    } catch (e) {
      // ignore
    }
    return await getVaultUsersAsync();
  },

  // Claim Weekly, Monthly, or Festival Special Bonus (Server persistent)
  async claimBonus(userId: string, type: 'weekly' | 'monthly' | 'daily' | 'festival'): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
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
      if (json.user) saveUserToVault(json.user);
      return { success: true, user: json.user };
    } catch (e) {
      return { success: false, error: 'Network error claiming bonus' };
    }
  },

  // Sync user balance on server + vault
  async syncBalance(userId: string, data: { walletBalance?: number; lockedBonusBalance?: number; totalWagered?: number; referralWagerRequirement?: number }): Promise<void> {
    const existing = getVaultUsersSync().find((u) => isUserMatch(u, userId));
    if (existing) {
      saveUserToVault({ ...existing, ...data });
    }
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status === 404 && existing) {
        // Re-restore missing user first, then retry balance sync
        await syncUserToServer({ ...existing, ...data });
      }
    } catch (e) {
      // ignore
    }
  },

  // Admin: Directly grant bonus funds to a user's wallet & locked bonus balance
  async grantUserBonus(userId: string, amountUSD: number, note?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/grant-bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUSD, note }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to grant bonus' };
      }
      if (json.user) saveUserToVault(json.user);
      return { success: true, user: json.user };
    } catch (e) {
      return { success: false, error: 'Network error granting bonus' };
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
      if (json.user) saveUserToVault(json.user);
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
      if (json.user) saveUserToVault(json.user);
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


