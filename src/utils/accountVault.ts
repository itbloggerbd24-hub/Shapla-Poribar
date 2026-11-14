import { UserProfile } from '../types/game';
import { loadFromStorage, saveToStorage } from './storage';

const VAULT_STORAGE_KEY = 'user_accounts_vault_v1';
const IDB_NAME = 'ShaplaPoribarVault';
const IDB_VERSION = 1;
const IDB_STORE = 'accounts';

export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('880') && digits.length >= 13) {
    digits = digits.slice(2);
  } else if (digits.startsWith('88') && digits.length >= 13) {
    digits = digits.slice(2);
  }
  if (digits.length === 10 && digits.startsWith('1')) {
    digits = '0' + digits;
  }
  return digits || String(phone).trim();
};

export const isPhoneMatch = (p1: string, p2: string): boolean => {
  const c1 = normalizePhone(p1);
  const c2 = normalizePhone(p2);
  if (!c1 || !c2) return false;
  if (c1 === c2) return true;
  if (c1.length >= 10 && c2.length >= 10 && c1.slice(-10) === c2.slice(-10)) return true;
  return false;
};

export const isUserMatch = (u: Partial<UserProfile>, identifier: string): boolean => {
  if (!u || !identifier) return false;
  const trimmed = String(identifier).trim();
  if (!trimmed) return false;
  if (u.id && String(u.id).toLowerCase() === trimmed.toLowerCase()) return true;
  if (u.phone && isPhoneMatch(u.phone, trimmed)) return true;
  return false;
};

const openVaultDb = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }
    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'vaultKey' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

const getVaultKey = (u: Partial<UserProfile>): string => {
  const norm = normalizePhone(u.phone || '');
  return norm ? `phone_${norm}` : `id_${u.id || Date.now()}`;
};

const mergeUserRecords = (existing: UserProfile | undefined, incoming: UserProfile): UserProfile => {
  if (!existing) return { ...incoming };

  // Always preserve private auth credentials (password, nid, securityQuestion, securityAnswer)
  // if incoming record came from an API endpoint that stripped them.
  return {
    ...existing,
    ...incoming,
    password: incoming.password && String(incoming.password).trim()
      ? String(incoming.password).trim()
      : existing.password,
    nid: incoming.nid && String(incoming.nid).trim()
      ? String(incoming.nid).trim()
      : existing.nid,
    securityQuestion: incoming.securityQuestion && String(incoming.securityQuestion).trim()
      ? String(incoming.securityQuestion).trim()
      : existing.securityQuestion,
    securityAnswer: incoming.securityAnswer && String(incoming.securityAnswer).trim()
      ? String(incoming.securityAnswer).trim().toLowerCase()
      : existing.securityAnswer,
  };
};

const readIdbUsers = async (): Promise<UserProfile[]> => {
  const db = await openVaultDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = Array.isArray(req.result) ? req.result : [];
        resolve(rows.map(({ vaultKey: _, ...u }) => u as UserProfile));
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
};

const writeIdbUsers = async (users: UserProfile[]): Promise<void> => {
  const db = await openVaultDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      for (const u of users) {
        if (!u || (!u.phone && !u.id)) continue;
        store.put({ ...u, vaultKey: getVaultKey(u) });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
};

const DEFAULT_FALLBACK_USERS: UserProfile[] = [
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
    nid: '19954718294012',
    securityQuestion: "What is your mother's maiden name?",
    securityAnswer: 'khatun',
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
  },
];

export const getVaultUsersSync = (): UserProfile[] => {
  const vaultList = loadFromStorage<UserProfile[]>(VAULT_STORAGE_KEY, []);
  const legacyList = loadFromStorage<UserProfile[]>('all_users_usd', DEFAULT_FALLBACK_USERS);
  const activeSession = loadFromStorage<UserProfile | null>('active_user_session', null);
  const userProfile = loadFromStorage<UserProfile | null>('user_profile_usd', null);

  const combined: UserProfile[] = [];
  const mergeIntoCombined = (list: UserProfile[]) => {
    for (const candidate of list) {
      if (!candidate || (!candidate.phone && !candidate.id)) continue;
      const idx = combined.findIndex(
        (u) => (candidate.id && u.id === candidate.id) || (candidate.phone && isPhoneMatch(u.phone, candidate.phone))
      );
      if (idx === -1) {
        combined.push({ ...candidate });
      } else {
        combined[idx] = mergeUserRecords(combined[idx], candidate);
      }
    }
  };

  mergeIntoCombined(vaultList);
  mergeIntoCombined(legacyList);
  if (userProfile && (userProfile.phone || userProfile.id)) {
    mergeIntoCombined([userProfile]);
  }
  if (activeSession && (activeSession.phone || activeSession.id)) {
    mergeIntoCombined([activeSession]);
  }

  return combined;
};

export const getVaultUsersAsync = async (): Promise<UserProfile[]> => {
  const syncUsers = getVaultUsersSync();
  const idbUsers = await readIdbUsers();
  const combined = [...syncUsers];

  for (const candidate of idbUsers) {
    if (!candidate || (!candidate.phone && !candidate.id)) continue;
    const idx = combined.findIndex(
      (u) => (candidate.id && u.id === candidate.id) || (candidate.phone && isPhoneMatch(u.phone, candidate.phone))
    );
    if (idx === -1) {
      combined.push({ ...candidate });
    } else {
      combined[idx] = mergeUserRecords(combined[idx], candidate);
    }
  }

  // Reconcile back into both localStorage vault and IndexedDB
  if (combined.length > 0) {
    saveToStorage(VAULT_STORAGE_KEY, combined);
    void writeIdbUsers(combined);
  }

  return combined;
};

export const saveUserToVault = (user: UserProfile): UserProfile[] => {
  if (!user || (!user.phone && !user.id)) return getVaultUsersSync();
  const current = getVaultUsersSync();
  const idx = current.findIndex(
    (u) => (user.id && u.id === user.id) || (user.phone && isPhoneMatch(u.phone, user.phone))
  );

  let next: UserProfile[];
  if (idx === -1) {
    next = [...current, { ...user }];
  } else {
    next = current.map((u, i) => (i === idx ? mergeUserRecords(u, user) : u));
  }

  saveToStorage(VAULT_STORAGE_KEY, next);
  saveToStorage('all_users_usd', next);
  void writeIdbUsers(next);
  return next;
};

export const mergeServerUsersIntoVault = async (serverUsers: UserProfile[]): Promise<{
  mergedUsers: UserProfile[];
  missingOnServer: UserProfile[];
}> => {
  const localVault = await getVaultUsersAsync();
  const merged = [...localVault];

  for (const srvUser of serverUsers) {
    if (!srvUser || (!srvUser.phone && !srvUser.id)) continue;
    const idx = merged.findIndex(
      (u) => (srvUser.id && u.id === srvUser.id) || (srvUser.phone && isPhoneMatch(u.phone, srvUser.phone))
    );
    if (idx === -1) {
      merged.push({ ...srvUser });
    } else {
      merged[idx] = mergeUserRecords(merged[idx], srvUser);
    }
  }

  // Any user in localVault that is NOT on the server yet (e.g., after a website update/rebuild)
  const missingOnServer = merged.filter((localUser) => {
    if (!localUser.phone) return false;
    return !serverUsers.some(
      (s) => (localUser.id && s.id === localUser.id) || (localUser.phone && isPhoneMatch(s.phone, localUser.phone))
    );
  });

  saveToStorage(VAULT_STORAGE_KEY, merged);
  saveToStorage('all_users_usd', merged);
  void writeIdbUsers(merged);

  return { mergedUsers: merged, missingOnServer };
};

export const findVaultUser = async (identifier: string): Promise<UserProfile | undefined> => {
  const all = await getVaultUsersAsync();
  return all.find((u) => isUserMatch(u, identifier));
};
