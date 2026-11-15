import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AdminSettings, DepositRequest, UserProfile, WithdrawalRequest } from '../types/game';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const ADMIN_CLOUD_EMAIL = 'itbloggerbd24@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

const sanitizeId = (val: string, fallback: string): string => {
  const cleaned = String(val || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 128);
  return cleaned || fallback;
};

const clampStr = (val: unknown, maxLen: number, fallback = ''): string => {
  const s = typeof val === 'string' ? val.trim() : fallback;
  return s.slice(0, maxLen);
};

export async function signInWithGooglePopup(): Promise<FirebaseUser> {
  const cred = await signInWithPopup(auth, googleAuthProvider);
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function subscribeFirebaseAuth(cb: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

export function isFirebaseAdminUser(fbUser: FirebaseUser | null): boolean {
  return Boolean(
    fbUser &&
      fbUser.email?.toLowerCase() === ADMIN_CLOUD_EMAIL &&
      fbUser.emailVerified === true
  );
}

/**
 * Sync the currently authenticated Firebase user's Shapla Poribar account
 * to /users/{uid} and /users/{uid}/private/account with strict schema enforcement.
 */
export async function syncUserPrivateBackup(
  fbUser: FirebaseUser,
  profile: UserProfile
): Promise<void> {
  if (!fbUser || !fbUser.uid || !fbUser.emailVerified) return;
  const uid = sanitizeId(fbUser.uid, fbUser.uid);
  const appUserId = sanitizeId(profile.id || `usr_${uid}`, `usr_${uid}`);
  const publicPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/account`;

  try {
    const pubRef = doc(db, 'users', uid);
    const pubSnap = await getDoc(pubRef);
    const displayName = clampStr(profile.name || fbUser.displayName || 'Player', 120, 'Player');

    if (!pubSnap.exists()) {
      await setDoc(pubRef, {
        uid,
        appUserId,
        displayName,
        role: isFirebaseAdminUser(fbUser) && profile.role === 'ADMIN' ? 'ADMIN' : 'USER',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingPub = pubSnap.data();
      await setDoc(
        pubRef,
        {
          uid: existingPub.uid || uid,
          appUserId: existingPub.appUserId || appUserId,
          displayName,
          role: existingPub.role || 'USER',
          createdAt: existingPub.createdAt,
          updatedAt: serverTimestamp(),
        },
        { merge: false }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, publicPath);
  }

  try {
    const privRef = doc(db, 'users', uid, 'private', 'account');
    const privSnap = await getDoc(privRef);
    const existingData = privSnap.exists() ? privSnap.data() : null;

    const cleanPassword = clampStr(
      profile.password || existingData?.password || 'cloud_linked_account',
      128,
      'cloud_linked_account'
    );
    const cleanPhone = clampStr(
      profile.phone || existingData?.phone || '0000000000',
      32,
      '0000000000'
    );

    const payload: Record<string, unknown> = {
      uid: existingData?.uid || uid,
      appUserId: existingData?.appUserId || appUserId,
      name: clampStr(profile.name, 120, 'Player'),
      phone: cleanPhone,
      password: cleanPassword,
      nid: clampStr(profile.nid ?? existingData?.nid ?? '', 32),
      securityQuestion: clampStr(
        profile.securityQuestion ?? existingData?.securityQuestion ?? '',
        200
      ),
      securityAnswer: clampStr(
        profile.securityAnswer ?? existingData?.securityAnswer ?? '',
        120
      ),
      binancePayId: clampStr(profile.binancePayId ?? existingData?.binancePayId ?? '', 64),
      binanceAddress: clampStr(profile.binanceAddress ?? existingData?.binanceAddress ?? '', 128),
      referralCode: clampStr(profile.referralCode ?? existingData?.referralCode ?? '', 32),
      referredBy: clampStr(profile.referredBy ?? existingData?.referredBy ?? '', 32),
      walletBalance: Math.max(0, Number(profile.walletBalance || 0)),
      lockedBonusBalance: Math.max(0, Number(profile.lockedBonusBalance || 0)),
      frozenWithdrawal: Math.max(0, Number(profile.frozenWithdrawal || 0)),
      totalWon: Math.max(0, Number(profile.totalWon || 0)),
      totalLost: Math.max(0, Number(profile.totalLost || 0)),
      totalWagered: Math.max(0, Number(profile.totalWagered || 0)),
      referralCount: Math.max(0, Number(profile.referralCount || 0)),
      referralBonusEarned: Math.max(0, Number(profile.referralBonusEarned || 0)),
      firstDepositDone: Boolean(profile.firstDepositDone),
      claimedFestivalBonusId: clampStr(profile.claimedFestivalBonusId || '', 64),
      lastWeeklyClaim: Number(profile.lastWeeklyClaim || 0),
      lastMonthlyClaim: Number(profile.lastMonthlyClaim || 0),
      createdAt: existingData?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(privRef, payload, { merge: false });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, privatePath);
  }
}

/**
 * Restore the signed-in Firebase user's Shapla Poribar account from /users/{uid}/private/account.
 */
export async function loadUserPrivateBackup(fbUser: FirebaseUser): Promise<UserProfile | null> {
  if (!fbUser || !fbUser.uid || !fbUser.emailVerified) return null;
  const uid = sanitizeId(fbUser.uid, fbUser.uid);
  const privatePath = `users/${uid}/private/account`;

  try {
    const pubRef = doc(db, 'users', uid);
    const pubSnap = await getDoc(pubRef);
    if (!pubSnap.exists()) return null;

    const privRef = doc(db, 'users', uid, 'private', 'account');
    const privSnap = await getDoc(privRef);
    if (!privSnap.exists()) return null;

    const data = privSnap.data();
    const pubData = pubSnap.data();
    return {
      id: String(data.appUserId || `usr_${uid}`),
      name: String(data.name || pubData.displayName || 'Player'),
      phone: String(data.phone || ''),
      password: String(data.password || ''),
      nid: String(data.nid || ''),
      securityQuestion: String(data.securityQuestion || ''),
      securityAnswer: String(data.securityAnswer || ''),
      binancePayId: String(data.binancePayId || ''),
      binanceAddress: String(data.binanceAddress || ''),
      referralCode: String(data.referralCode || ''),
      referredBy: String(data.referredBy || ''),
      walletBalance: Number(data.walletBalance || 0),
      lockedBonusBalance: Number(data.lockedBonusBalance || 0),
      frozenWithdrawal: Number(data.frozenWithdrawal || 0),
      totalWon: Number(data.totalWon || 0),
      totalLost: Number(data.totalLost || 0),
      totalWagered: Number(data.totalWagered || 0),
      referralCount: Number(data.referralCount || 0),
      referralBonusEarned: Number(data.referralBonusEarned || 0),
      firstDepositDone: Boolean(data.firstDepositDone),
      claimedFestivalBonusId: data.claimedFestivalBonusId ? String(data.claimedFestivalBonusId) : undefined,
      lastWeeklyClaim: Number(data.lastWeeklyClaim || 0),
      lastMonthlyClaim: Number(data.lastMonthlyClaim || 0),
      role: pubData.role === 'ADMIN' ? 'ADMIN' : 'USER',
      isSuspended: false,
      createdAt: Date.now(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, privatePath);
  }
}

export interface PlatformCloudSnapshot {
  users: UserProfile[];
  settings?: AdminSettings;
  deposits?: DepositRequest[];
  withdrawals?: WithdrawalRequest[];
  savedAt: number;
}

/**
 * Admin Cloud Backup: Persist the full server database snapshot to Firestore (/adminSnapshots/platform_latest)
 * so all accounts, settings, and transactions survive any number of website updates/redeploys.
 */
export async function saveAdminCloudSnapshot(
  fbUser: FirebaseUser,
  snapshot: PlatformCloudSnapshot
): Promise<void> {
  if (!isFirebaseAdminUser(fbUser)) {
    throw new Error('Admin verification required to sync full platform snapshot.');
  }
  const snapshotId = 'platform_latest';
  const docPath = `adminSnapshots/${snapshotId}`;
  const uid = sanitizeId(fbUser.uid, fbUser.uid);

  // Strip heavy base64 images from deposit slips if oversized to stay well under 1MB Firestore doc limit
  const compactDeposits = (snapshot.deposits || []).slice(0, 150).map((d) => ({
    ...d,
    screenshotUrl:
      typeof d.screenshotUrl === 'string' && d.screenshotUrl.length > 1200
        ? ''
        : d.screenshotUrl || '',
  }));

  try {
    const snapRef = doc(db, 'adminSnapshots', snapshotId);
    const existingSnap = await getDoc(snapRef);

    const payloadMap = {
      users: snapshot.users,
      settings: snapshot.settings || null,
      deposits: compactDeposits,
      withdrawals: (snapshot.withdrawals || []).slice(0, 150),
      savedAt: snapshot.savedAt || Date.now(),
    };

    if (!existingSnap.exists()) {
      await setDoc(snapRef, {
        snapshotId,
        ownerUid: uid,
        userCount: snapshot.users.length,
        payload: payloadMap,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const prev = existingSnap.data();
      await setDoc(
        snapRef,
        {
          snapshotId: prev.snapshotId || snapshotId,
          ownerUid: prev.ownerUid || uid,
          userCount: snapshot.users.length,
          payload: payloadMap,
          createdAt: prev.createdAt,
          updatedAt: serverTimestamp(),
        },
        { merge: false }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function loadAdminCloudSnapshot(
  fbUser: FirebaseUser
): Promise<PlatformCloudSnapshot | null> {
  if (!isFirebaseAdminUser(fbUser)) return null;
  const docPath = 'adminSnapshots/platform_latest';
  try {
    const snapRef = doc(db, 'adminSnapshots', 'platform_latest');
    const snap = await getDoc(snapRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    const payload = data.payload as PlatformCloudSnapshot | undefined;
    if (!payload || !Array.isArray(payload.users)) return null;
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}
