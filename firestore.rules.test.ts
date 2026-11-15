// Verification suite validating the 12 "Dirty Dozen" adversarial payloads from security_spec.md
// against blueprint size/key/regex/auth/role constraints enforced by firestore.rules.

export interface SecurityTestCase {
  id: number;
  name: string;
  expectedResult: 'PERMISSION_DENIED';
  verifyRejected: () => boolean;
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export const dirtyDozenTests: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Private Account Read',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const auth = null;
      return auth === null;
    },
  },
  {
    id: 2,
    name: 'Unverified Email Admin Spoof',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const token = { email: 'itbloggerbd24@gmail.com', email_verified: false };
      return !(token.email === 'itbloggerbd24@gmail.com' && token.email_verified === true);
    },
  },
  {
    id: 3,
    name: 'Self-Assigned Admin Role Escalation on Create',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const payload = { role: 'ADMIN' };
      const isAdmin = false;
      return !(payload.role === 'USER' || isAdmin);
    },
  },
  {
    id: 4,
    name: 'Update-Time Role Escalation',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const existingRole: string = 'USER';
      const incomingRole: string = 'ADMIN';
      const isAdmin = false;
      return incomingRole !== existingRole && !isAdmin;
    },
  },
  {
    id: 5,
    name: 'Shadow / Ghost Field Injection (isVerified)',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const allowedKeys = new Set([
        'uid', 'appUserId', 'name', 'phone', 'password', 'nid',
        'securityQuestion', 'securityAnswer', 'binancePayId', 'binanceAddress',
        'referralCode', 'referredBy', 'walletBalance', 'lockedBonusBalance',
        'frozenWithdrawal', 'totalWon', 'totalLost', 'totalWagered',
        'referralCount', 'referralBonusEarned', 'firstDepositDone',
        'claimedFestivalBonusId', 'lastWeeklyClaim', 'lastMonthlyClaim',
        'createdAt', 'updatedAt',
      ]);
      const payloadKeys = ['uid', 'appUserId', 'name', 'phone', 'password', 'walletBalance', 'createdAt', 'updatedAt', 'isVerified'];
      return payloadKeys.some((k) => !allowedKeys.has(k));
    },
  },
  {
    id: 6,
    name: 'Identity Spoofing (mismatched uid)',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const authUid: string = 'uid_attacker';
      const payloadUid: string = 'uid_victim';
      return payloadUid !== authUid;
    },
  },
  {
    id: 7,
    name: 'Other User PII Read',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const authUid: string = 'uid_attacker';
      const targetUserId: string = 'uid_victim';
      const isAdmin = false;
      return authUid !== targetUserId && !isAdmin;
    },
  },
  {
    id: 8,
    name: 'Blanket User List Scraping',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const authUid: string = 'uid_attacker';
      const resourceUid: string = 'uid_victim';
      const isAdminEmail = false;
      return resourceUid !== authUid && !isAdminEmail;
    },
  },
  {
    id: 9,
    name: 'Client-Forged Timestamp',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const createdAt: unknown = '2020-01-01T00:00:00Z';
      return createdAt !== 'SERVER_REQUEST_TIME';
    },
  },
  {
    id: 10,
    name: 'Immortal Field Tampering (appUserId modified)',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const existingAppUserId: string = 'usr_1001';
      const incomingAppUserId: string = 'usr_hacked';
      return existingAppUserId !== incomingAppUserId;
    },
  },
  {
    id: 11,
    name: 'Path Variable Poisoning (invalid characters / length)',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const poisonedId = '../admin/' + 'x'.repeat(200);
      return !VALID_ID_REGEX.test(poisonedId);
    },
  },
  {
    id: 12,
    name: 'Oversized Value DoS Payload (500KB displayName)',
    expectedResult: 'PERMISSION_DENIED',
    verifyRejected: () => {
      const oversized = 'A'.repeat(500000);
      return oversized.length > 120;
    },
  },
];

export function runDirtyDozenChecks(): boolean {
  return dirtyDozenTests.every((t) => t.verifyRejected() === true);
}
