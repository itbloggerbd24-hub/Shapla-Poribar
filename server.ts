import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Central Database Directory and File
  const DATA_DIR = path.resolve(__dirname, 'data');
  const DB_FILE = path.resolve(DATA_DIR, 'db.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Helper to read database
  const readDb = () => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('Error reading db:', e);
    }
    return {
      users: [
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
      ],
      deposits: [],
      withdrawals: []
    };
  };

  // Helper to write database
  const writeDb = (data: any) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing db:', e);
    }
  };

  // Bulletproof Phone Normalization: handles Bangladeshi 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX, 1XXXXXXXXX, spaces, dashes
  const normalizePhone = (phone: string): string => {
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

  const isPhoneMatch = (p1: string, p2: string): boolean => {
    const c1 = normalizePhone(p1);
    const c2 = normalizePhone(p2);
    if (!c1 || !c2) return false;
    if (c1 === c2) return true;
    if (c1.length >= 10 && c2.length >= 10 && c1.slice(-10) === c2.slice(-10)) return true;
    return false;
  };

  // In-memory + persisted verification codes store: phone -> { code: string, expiresAt: number }
  const verificationCodes: Record<string, { code: string; expiresAt: number }> = {};

  const getVerificationEntry = (phone: string): { code: string; expiresAt: number } | null => {
    const clean = normalizePhone(phone);
    if (verificationCodes[clean]) return verificationCodes[clean];
    for (const [k, v] of Object.entries(verificationCodes)) {
      if (isPhoneMatch(k, clean)) return v;
    }
    const db = readDb();
    if (db.verificationCodes) {
      if (db.verificationCodes[clean]) return db.verificationCodes[clean];
      for (const [k, v] of Object.entries(db.verificationCodes as Record<string, any>)) {
        if (isPhoneMatch(k, clean)) return v;
      }
    }
    return null;
  };

  const saveVerificationCode = (phone: string, code: string) => {
    const clean = normalizePhone(phone);
    const entry = { code, expiresAt: Date.now() + 15 * 60 * 1000 };
    verificationCodes[clean] = entry;
    const db = readDb();
    if (!db.verificationCodes) db.verificationCodes = {};
    db.verificationCodes[clean] = entry;
    writeDb(db);
  };

  // Default dynamic bonus configuration (editable from Admin Panel)
  const DEFAULT_BONUS_CONFIG = {
    bonusesEnabled: true,
    minDepositForBonusUSD: 5.00,
    welcomeBonusEnabled: true,
    welcomeBonusUSD: 1.00,
    depositBonusEnabled: false,
    depositBonusPercent: 0,
    weeklyBonusEnabled: true,
    weeklyBonusUSD: 0.50,
    monthlyBonusEnabled: true,
    monthlyBonusUSD: 1.00,
    referralBonusEnabled: true,
    referralBonusUSD: 0.50,
    referralMilestonesEnabled: true,
    referralMilestone5USD: 0.50,
    referralMilestone10USD: 1.00,
    referralMilestone20USD: 3.00,
    referralMilestone50USD: 5.00,
    referralMilestone100USD: 10.00,
    customPromoText: '',
  };

  const getBonusConfig = (db: any) => ({
    ...DEFAULT_BONUS_CONFIG,
    ...(db?.settings?.bonusConfig || {}),
  });

  // Ensure initial data such as demo account 01883239867 & default bonusConfig
  const ensureInitialData = () => {
    try {
      const db = readDb();
      let changed = false;

      if (!db.bets) {
        db.bets = [];
        changed = true;
      }
      if (!db.verificationCodes) {
        db.verificationCodes = {};
        changed = true;
      }
      if (!db.settings) {
        db.settings = {};
        changed = true;
      }
      if (!db.settings.bonusConfig) {
        db.settings.bonusConfig = { ...DEFAULT_BONUS_CONFIG };
        changed = true;
      } else {
        const mergedBonus = { ...DEFAULT_BONUS_CONFIG, ...db.settings.bonusConfig };
        if (JSON.stringify(mergedBonus) !== JSON.stringify(db.settings.bonusConfig)) {
          db.settings.bonusConfig = mergedBonus;
          changed = true;
        }
      }

      // Demo test user requested by user: 01883239867 / 635366
      const demoPhone = '01883239867';
      const demoUserIndex = db.users.findIndex((u: any) => isPhoneMatch(u.phone, demoPhone));
      if (demoUserIndex === -1) {
        db.users.push({
          id: 'usr_demo_01883239867',
          name: 'Demo Tester',
          phone: demoPhone,
          password: '635366',
          walletBalance: 25.00,
          frozenWithdrawal: 0,
          totalWon: 0,
          totalLost: 0,
          role: 'USER',
          nid: '19985672819401',
          securityQuestion: "What is your childhood nickname?",
          securityAnswer: "shanto",
          binancePayId: '1156528658',
          binanceAddress: '',
          referralCode: 'SP-DEMO88',
          referralCount: 0,
          referralBonusEarned: 0,
          isSuspended: false,
          firstDepositDone: false,
          lastWeeklyClaim: 0,
          lastMonthlyClaim: 0,
          createdAt: Date.now(),
        });
        changed = true;
      } else {
        const u = db.users[demoUserIndex];
        if (u.password !== '635366') {
          u.password = '635366';
          changed = true;
        }
        if (!u.nid) {
          u.nid = '19985672819401';
          changed = true;
        }
        if (!u.securityQuestion) {
          u.securityQuestion = "What is your childhood nickname?";
          changed = true;
        }
        if (!u.securityAnswer) {
          u.securityAnswer = "shanto";
          changed = true;
        }
      }

      // Ensure Alex Hunter has NID & security question
      const alex = db.users.find((u: any) => isPhoneMatch(u.phone, '01712345678'));
      if (alex) {
        if (!alex.nid) { alex.nid = '19954718294012'; changed = true; }
        if (!alex.securityQuestion) { alex.securityQuestion = "What is your mother's maiden name?"; changed = true; }
        if (!alex.securityAnswer) { alex.securityAnswer = 'khatun'; changed = true; }
      }

      if (changed) {
        writeDb(db);
      }
    } catch (e) {
      console.error('Error ensuring initial data:', e);
    }
  };

  ensureInitialData();

  // 1. SEND PHONE VERIFICATION CODE (SMS / OTP)
  app.post('/api/auth/send-verification-code', (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required.' });
      }

      const cleanPhone = normalizePhone(phone);
      if (cleanPhone.length < 8) {
        return res.status(400).json({ error: 'Please enter a valid phone number (at least 8 digits).' });
      }

      const db = readDb();
      const existing = db.users.find((u: any) => isPhoneMatch(u.phone, cleanPhone));
      if (existing) {
        return res.status(400).json({ 
          error: 'An account is already registered with this phone number. Please sign in or reset your password.' 
        });
      }

      // Generate 6-digit numeric verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      saveVerificationCode(cleanPhone, code);

      return res.json({
        success: true,
        message: `Verification code sent to ${phone}.`,
        code, // Returned for simulated SMS prompt in UI
        expiresInSeconds: 900,
      });
    } catch (err: any) {
      console.error('Send verification code error:', err);
      return res.status(500).json({ error: 'Failed to send verification code.' });
    }
  });

  // 2. VERIFY PHONE CODE
  app.post('/api/auth/verify-code', (req, res) => {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ error: 'Phone number and verification code are required.' });
      }

      const cleanPhone = normalizePhone(phone);
      const entry = getVerificationEntry(cleanPhone);

      if (!entry || Date.now() > entry.expiresAt) {
        return res.status(400).json({ error: 'Verification code has expired or does not exist. Please request a new code.' });
      }

      if (entry.code !== String(code).trim()) {
        return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check and try again.' });
      }

      return res.json({ success: true, message: 'Phone number verified successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Verification error.' });
    }
  });

  // 3. REGISTER: Phone verified + NID + Security Question & Answer + Exactly 1 account per phone & NID
  app.post('/api/auth/register', (req, res) => {
    try {
      const { 
        name, 
        phone, 
        password, 
        nid, 
        securityQuestion, 
        securityAnswer, 
        verificationCode, 
        binancePayId, 
        referralCode 
      } = req.body;

      if (!name || !phone || !password) {
        return res.status(400).json({ error: 'Name, phone number, and password are required.' });
      }

      if (!nid || String(nid).trim().length < 8) {
        return res.status(400).json({ error: 'A valid National ID (NID) number is required (min 8 digits).' });
      }

      if (!securityQuestion || !securityAnswer || String(securityAnswer).trim().length < 2) {
        return res.status(400).json({ error: 'Security question and answer are required for account security.' });
      }

      const cleanPhone = normalizePhone(phone);
      if (cleanPhone.length < 8) {
        return res.status(400).json({ error: 'Please enter a valid phone number.' });
      }

      // Check verification code
      const entry = getVerificationEntry(cleanPhone);
      if (!entry || Date.now() > entry.expiresAt) {
        return res.status(400).json({ error: 'Please request and verify your phone number with the 6-digit SMS code.' });
      }
      if (entry.code !== String(verificationCode).trim()) {
        return res.status(400).json({ error: 'Invalid verification code. Please enter the correct 6-digit code.' });
      }

      const db = readDb();

      // Check if phone already registered using bulletproof isPhoneMatch
      const existingPhone = db.users.find((u: any) => isPhoneMatch(u.phone, cleanPhone));
      if (existingPhone) {
        return res.status(400).json({ 
          error: 'An account is already registered with this phone number. Multiple accounts are not permitted.' 
        });
      }

      // Check if NID already registered
      const cleanNid = String(nid).trim();
      const existingNid = db.users.find((u: any) => String(u.nid || '').trim() === cleanNid);
      if (existingNid) {
        return res.status(400).json({ 
          error: 'An account is already registered with this NID number. Each user may only have one account.' 
        });
      }

      const cleanName = String(name).trim();
      const namePart = cleanName.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'SP';
      const myRefCode = `SP-${cleanPhone.slice(-4)}${namePart}`;

      const newUser = {
        id: `usr_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        name: cleanName,
        phone: cleanPhone,
        password: String(password).trim(),
        nid: cleanNid,
        securityQuestion: String(securityQuestion).trim(),
        securityAnswer: String(securityAnswer).trim().toLowerCase(),
        walletBalance: 0.00, // Starts at 0; $1.00 welcome bonus unlocks upon 1st approved deposit
        frozenWithdrawal: 0,
        totalWon: 0,
        totalLost: 0,
        role: 'USER',
        binancePayId: binancePayId ? String(binancePayId).trim() : '',
        binanceAddress: '',
        referralCode: myRefCode,
        referredBy: referralCode ? String(referralCode).trim().toUpperCase() : '',
        referralCount: 0,
        referralBonusEarned: 0,
        referralWagerRequirement: 0,
        totalWagered: 0,
        firstDepositDone: false,
        lastDailyClaim: 0,
        lastWeeklyClaim: 0,
        lastMonthlyClaim: 0,
        isSuspended: false,
        createdAt: Date.now(),
      };

      db.users.push(newUser);

      // Clean up used verification code
      delete verificationCodes[cleanPhone];
      if (db.verificationCodes) {
        delete db.verificationCodes[cleanPhone];
      }

      // Add a welcome notification using live Admin bonus settings
      const bonusCfg = getBonusConfig(db);
      const minDep = Number(bonusCfg.minDepositForBonusUSD ?? 5.00);
      const welcomeAmt = Number(bonusCfg.welcomeBonusUSD ?? 1.00);
      const welcomeMessage = (bonusCfg.bonusesEnabled && bonusCfg.welcomeBonusEnabled && welcomeAmt > 0)
        ? `Your account has been successfully created and verified with NID. Complete your 1st deposit (min $${minDep.toFixed(2)}) to receive your $${welcomeAmt.toFixed(2)} welcome signup bonus!`
        : 'Your account has been successfully created and verified with NID. Deposit funds via Binance Pay or USDT to start playing!';

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `notif_${Date.now()}_welcome`,
        userId: newUser.id,
        title: '🎉 Welcome to Shapla Poribar!',
        message: welcomeMessage,
        type: 'SYSTEM',
        badge: 'WELCOME',
        isRead: false,
        createdAt: Date.now(),
      });

      writeDb(db);

      const { password: _, securityAnswer: __, ...userSafe } = newUser;
      return res.json({ success: true, user: userSafe });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Internal registration error.' });
    }
  });

  // 4. LOGIN: Universal login with bulletproof isPhoneMatch
  app.post('/api/auth/login', (req, res) => {
    try {
      const { phone, password } = req.body;
      if (!phone || !password) {
        return res.status(400).json({ error: 'Please enter phone number and password.' });
      }

      const cleanPhone = normalizePhone(phone);
      const db = readDb();

      // Find user using bulletproof isPhoneMatch (handles 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX, etc.)
      const user = db.users.find((u: any) => isPhoneMatch(u.phone, cleanPhone));
      if (!user) {
        return res.status(401).json({ error: 'No account registered with this phone number. Please sign up.' });
      }

      if (user.password !== String(password).trim()) {
        return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
      }

      // Check if admin has suspended this user
      if (user.isSuspended) {
        return res.status(403).json({ 
          error: 'Your account has been suspended by administration. Contact Help Desk support for assistance.',
          isSuspended: true
        });
      }

      const { password: _, securityAnswer: __, ...userSafe } = user;
      return res.json({ success: true, user: userSafe });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal login error.' });
    }
  });

  // 5. SYNC LOCAL USER TO SERVER (Redundancy: if created locally, guarantee server persistence)
  app.post('/api/auth/sync-local-user', (req, res) => {
    try {
      const incoming = req.body;
      if (!incoming || !incoming.phone || !incoming.password) {
        return res.status(400).json({ error: 'Invalid user payload' });
      }
      const cleanPhone = normalizePhone(incoming.phone);
      const db = readDb();
      const existingIndex = db.users.findIndex((u: any) => isPhoneMatch(u.phone, cleanPhone));
      if (existingIndex !== -1) {
        db.users[existingIndex] = {
          ...db.users[existingIndex],
          password: String(incoming.password).trim(),
          name: incoming.name || db.users[existingIndex].name,
          nid: incoming.nid || db.users[existingIndex].nid,
          securityQuestion: incoming.securityQuestion || db.users[existingIndex].securityQuestion,
          securityAnswer: incoming.securityAnswer || db.users[existingIndex].securityAnswer,
        };
      } else {
        db.users.push({
          ...incoming,
          phone: cleanPhone,
          password: String(incoming.password).trim(),
        });
      }
      writeDb(db);
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Sync failed' });
    }
  });

  // 6. GET SECURITY QUESTION FOR FORGOT PASSWORD
  app.post('/api/auth/get-security-question', (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required.' });
      }

      const cleanPhone = normalizePhone(phone);
      const db = readDb();
      const user = db.users.find((u: any) => isPhoneMatch(u.phone, cleanPhone));

      if (!user) {
        return res.status(404).json({ error: 'No account found with this phone number. Please verify.' });
      }

      const question = user.securityQuestion || "What is your childhood nickname?";
      return res.json({ success: true, securityQuestion: question });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve security question.' });
    }
  });

  // 7. RESET PASSWORD WITH SECURITY QUESTION
  app.post('/api/auth/reset-with-security-question', (req, res) => {
    try {
      const { phone, securityQuestion, securityAnswer, newPassword } = req.body;
      if (!phone || !securityAnswer || !newPassword) {
        return res.status(400).json({ error: 'Phone number, security answer, and new password are required.' });
      }

      if (String(newPassword).length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }

      const cleanPhone = normalizePhone(phone);
      const db = readDb();
      const userIndex = db.users.findIndex((u: any) => isPhoneMatch(u.phone, cleanPhone));

      if (userIndex === -1) {
        return res.status(404).json({ error: 'No account found with this phone number.' });
      }

      const user = db.users[userIndex];

      // If user selected a security question, verify it matches
      if (securityQuestion && user.securityQuestion) {
        const normQ1 = String(user.securityQuestion).trim().toLowerCase();
        const normQ2 = String(securityQuestion).trim().toLowerCase();
        if (normQ1 !== normQ2) {
          return res.status(400).json({ 
            error: 'The selected security question does not match this account. Please select the question you chose during registration, or click "Forgot Security Question" below to recover via NID.' 
          });
        }
      }

      const storedAnswer = String(user.securityAnswer || '').trim().toLowerCase();
      const providedAnswer = String(securityAnswer).trim().toLowerCase();

      if (storedAnswer && storedAnswer !== providedAnswer) {
        return res.status(400).json({ 
          error: 'Incorrect security answer. If you forgot your answer, click "Forgot Security Question" below to recover using your NID.' 
        });
      }

      db.users[userIndex].password = String(newPassword).trim();
      writeDb(db);

      return res.json({ success: true, message: 'Password has been updated successfully. You can now log in.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to reset password.' });
    }
  });

  // 8. RECOVER SECURITY QUESTION WITH NID AND PHONE NUMBER
  app.post('/api/auth/recover-security-question', (req, res) => {
    try {
      const { phone, nid } = req.body;
      if (!phone || !nid) {
        return res.status(400).json({ error: 'Both phone number and registered NID number are required.' });
      }

      const cleanPhone = normalizePhone(phone);
      const cleanNid = String(nid).trim();

      const db = readDb();
      const user = db.users.find((u: any) => isPhoneMatch(u.phone, cleanPhone));

      if (!user) {
        return res.status(404).json({ error: 'No account registered with this phone number.' });
      }

      if (!user.nid || String(user.nid).trim() !== cleanNid) {
        return res.status(400).json({ error: 'NID number does not match our records for this account.' });
      }

      const question = user.securityQuestion || "What is your childhood nickname?";
      const answer = user.securityAnswer || "shanto";

      // Simulated SMS dispatched to user's phone
      const smsMessage = `📲 SMS to ${phone}: Security Recovery Notice: Your Security Question is "${question}" and Answer is "${answer}". Please use this to reset your password.`;

      return res.json({
        success: true,
        message: 'Security details verified. Your Security Question and Answer have been sent via SMS.',
        securityQuestion: question,
        securityAnswer: answer,
        smsMessage,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Recovery failed.' });
    }
  });

  // 8. BETS PERSISTENCE: Get, Create, and Settle Bets
  app.get('/api/bets', (req, res) => {
    try {
      const { userId } = req.query;
      const db = readDb();
      const bets = (db.bets || []).filter((b: any) => !userId || b.userId === userId);
      return res.json({ bets });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch bets.' });
    }
  });

  app.post('/api/bets', (req, res) => {
    try {
      const bet = req.body;
      if (!bet || !bet.id || !bet.userId) {
        return res.status(400).json({ error: 'Invalid bet object.' });
      }

      const db = readDb();
      if (!db.bets) db.bets = [];
      db.bets.unshift(bet);
      if (db.bets.length > 500) {
        db.bets = db.bets.slice(0, 500);
      }
      writeDb(db);
      return res.json({ success: true, bet });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to record bet.' });
    }
  });

  app.post('/api/bets/resolve', (req, res) => {
    try {
      const { roundId, winner, winningPayoutMultiplier } = req.body;
      const mult = winningPayoutMultiplier || 1.85;
      const db = readDb();
      if (db.bets) {
        db.bets = db.bets.map((b: any) => {
          if (b.roundId === roundId && b.status === 'PENDING') {
            if (b.option === winner) {
              const profit = Number((b.amount * 0.85).toFixed(2));
              const payout = Number((b.amount + profit).toFixed(2));
              return { ...b, status: 'WON', payout };
            } else {
              return { ...b, status: 'LOST', payout: 0 };
            }
          }
          return b;
        });
        writeDb(db);
      }
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to resolve bets.' });
    }
  });

  // 4. GET ALL USERS (for Admin and sync)
  app.get('/api/users', (req, res) => {
    try {
      const db = readDb();
      const usersSafe = db.users.map(({ password: _, ...u }: any) => u);
      return res.json({ users: usersSafe });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch users.' });
    }
  });

  // 5. ADMIN: Suspend or activate user
  app.post('/api/users/:id/suspend', (req, res) => {
    try {
      const { id } = req.params;
      const { suspended, reason } = req.body;
      const db = readDb();

      const userIndex = db.users.findIndex((u: any) => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      db.users[userIndex].isSuspended = Boolean(suspended);
      if (reason) {
        db.users[userIndex].suspensionReason = reason;
      }
      writeDb(db);

      const { password: _, ...userSafe } = db.users[userIndex];
      return res.json({ success: true, user: userSafe });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update suspension status.' });
    }
  });

  // 6. ADMIN / USER: Adjust or update user balance
  app.post('/api/users/:id/balance', (req, res) => {
    try {
      const { id } = req.params;
      const { walletBalance, lockedBonusBalance, totalWagered, referralWagerRequirement } = req.body;
      const db = readDb();

      const userIndex = db.users.findIndex((u: any) => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (walletBalance !== undefined) {
        db.users[userIndex].walletBalance = Number(Number(walletBalance).toFixed(2));
      }
      if (lockedBonusBalance !== undefined) {
        db.users[userIndex].lockedBonusBalance = Number(Number(lockedBonusBalance).toFixed(2));
      }
      if (totalWagered !== undefined) {
        db.users[userIndex].totalWagered = Number(Number(totalWagered).toFixed(2));
      }
      if (referralWagerRequirement !== undefined) {
        db.users[userIndex].referralWagerRequirement = Number(Number(referralWagerRequirement).toFixed(2));
      }

      writeDb(db);

      const { password: _, ...userSafe } = db.users[userIndex];
      return res.json({ success: true, user: userSafe });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update balance.' });
    }
  });

  // 6b. ADMIN: Directly grant a custom bonus amount to a user
  app.post('/api/users/:id/grant-bonus', (req, res) => {
    try {
      const { id } = req.params;
      const { amountUSD, note } = req.body;
      const amount = Number(Number(amountUSD).toFixed(2));
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Bonus amount must be greater than $0.00.' });
      }

      const db = readDb();
      const userIndex = db.users.findIndex((u: any) => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const user = db.users[userIndex];
      db.users[userIndex].walletBalance = Number(((user.walletBalance || 0) + amount).toFixed(2));
      db.users[userIndex].lockedBonusBalance = Number(((user.lockedBonusBalance || 0) + amount).toFixed(2));

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `notif_${Date.now()}_admin_bonus_${user.id}`,
        userId: user.id,
        title: `🎁 Special Bonus Received (+$${amount.toFixed(2)})!`,
        message: note && String(note).trim()
          ? `${String(note).trim()} ($${amount.toFixed(2)} USD added to your playable bonus balance)`
          : `Administration credited a special $${amount.toFixed(2)} USD bonus to your wallet! Wager it in predictions to unlock withdrawals.`,
        type: 'SIGNUP_BONUS',
        badge: 'BONUS',
        isRead: false,
        createdAt: Date.now(),
      });

      writeDb(db);
      const { password: _, ...userSafe } = db.users[userIndex];
      return res.json({ success: true, user: userSafe, bonusAdded: amount });
    } catch (err: any) {
      console.error('Grant bonus error:', err);
      return res.status(500).json({ error: 'Failed to grant bonus.' });
    }
  });

  // 7. USER: Claim Weekly or Monthly Free Bonus (Uses Admin bonusConfig, persistent on disk)
  app.post('/api/users/:id/claim-bonus', (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.body; // 'weekly' | 'monthly' | 'daily'
      const db = readDb();
      const bonusCfg = getBonusConfig(db);

      if (!bonusCfg.bonusesEnabled) {
        return res.status(400).json({ error: 'Bonus offers are currently paused by administration.' });
      }

      const userIndex = db.users.findIndex((u: any) => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const now = Date.now();
      const user = db.users[userIndex];
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
      const minDep = Number(bonusCfg.minDepositForBonusUSD ?? 5.00);

      // All bonuses work only after first deposit has been approved
      const userHasDeposited = Boolean(
        user.firstDepositDone ||
        (db.deposits && db.deposits.some((d: any) => d.userId === user.id && d.status === 'APPROVED'))
      );

      if (!userHasDeposited) {
        return res.status(400).json({ 
          error: `All bonuses unlock only after your 1st approved deposit (min $${minDep.toFixed(2)} USD).` 
        });
      }

      let bonusAmount = 0;
      if (type === 'weekly' || type === 'daily') {
        if (!bonusCfg.weeklyBonusEnabled || Number(bonusCfg.weeklyBonusUSD) <= 0) {
          return res.status(400).json({ error: 'Weekly bonus is currently disabled by administration.' });
        }
        const lastWeekly = user.lastWeeklyClaim || 0;
        if (now - lastWeekly < ONE_WEEK_MS) {
          return res.status(400).json({ error: 'Weekly bonus can only be claimed once every 7 days.' });
        }
        bonusAmount = Number(Number(bonusCfg.weeklyBonusUSD).toFixed(2));
        db.users[userIndex].lastWeeklyClaim = now;
      } else if (type === 'monthly') {
        if (!bonusCfg.monthlyBonusEnabled || Number(bonusCfg.monthlyBonusUSD) <= 0) {
          return res.status(400).json({ error: 'Monthly loyalty bonus is currently disabled by administration.' });
        }
        const lastMonthly = user.lastMonthlyClaim || 0;
        if (now - lastMonthly < ONE_MONTH_MS) {
          return res.status(400).json({ error: 'Monthly bonus can only be claimed once every 30 days.' });
        }
        bonusAmount = Number(Number(bonusCfg.monthlyBonusUSD).toFixed(2));
        db.users[userIndex].lastMonthlyClaim = now;
      } else {
        return res.status(400).json({ error: 'Invalid bonus type. Use weekly or monthly.' });
      }

      db.users[userIndex].walletBalance = Number(((user.walletBalance || 0) + bonusAmount).toFixed(2));
      db.users[userIndex].lockedBonusBalance = Number(((user.lockedBonusBalance || 0) + bonusAmount).toFixed(2));
      writeDb(db);

      const { password: _, ...userSafe } = db.users[userIndex];
      return res.json({ success: true, user: userSafe, bonusAdded: bonusAmount });
    } catch (err: any) {
      console.error('Claim bonus error:', err);
      return res.status(500).json({ error: 'Failed to claim bonus.' });
    }
  });

  // 8. DEPOSITS: Get all deposits
  app.get('/api/deposits', (req, res) => {
    try {
      const db = readDb();
      return res.json({ deposits: db.deposits || [] });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch deposits.' });
    }
  });

  // Helper to approve deposit and unlock dynamic welcome signup bonus, deposit %, & referral bonuses
  const approveDepositAndTriggerBonuses = (db: any, deposit: any) => {
    if (!deposit || deposit.status === 'APPROVED') return null;

    deposit.status = 'APPROVED';
    deposit.updatedAt = Date.now();

    const userIndex = db.users.findIndex((u: any) => u.id === deposit.userId);
    if (userIndex === -1) return null;

    const bonusCfg = getBonusConfig(db);
    const minDep = Number(bonusCfg.minDepositForBonusUSD ?? 5.00);
    const user = db.users[userIndex];
    const isFirstDeposit = !user.firstDepositDone;
    let creditAmount = deposit.amountUSD;
    let totalLockedBonusAdded = 0;

    if (!db.notifications) db.notifications = [];

    // Optional % deposit promo bonus on eligible deposits (first or recurring)
    let depositPctBonus = 0;
    if (
      bonusCfg.bonusesEnabled &&
      bonusCfg.depositBonusEnabled &&
      Number(bonusCfg.depositBonusPercent) > 0 &&
      deposit.amountUSD >= minDep
    ) {
      depositPctBonus = Number((deposit.amountUSD * (Number(bonusCfg.depositBonusPercent) / 100)).toFixed(2));
      if (depositPctBonus > 0) {
        creditAmount += depositPctBonus;
        totalLockedBonusAdded += depositPctBonus;
      }
    }

    if (isFirstDeposit) {
      user.firstDepositDone = true;

      let welcomeBonus = 0;
      if (
        bonusCfg.bonusesEnabled &&
        bonusCfg.welcomeBonusEnabled &&
        Number(bonusCfg.welcomeBonusUSD) > 0 &&
        deposit.amountUSD >= minDep
      ) {
        welcomeBonus = Number(Number(bonusCfg.welcomeBonusUSD).toFixed(2));
        creditAmount += welcomeBonus;
        totalLockedBonusAdded += welcomeBonus;
      }

      // Unlock any pending referral bonuses accumulated before 1st deposit
      if (user.pendingReferralBonus && user.pendingReferralBonus > 0) {
        creditAmount += user.pendingReferralBonus;
        totalLockedBonusAdded += user.pendingReferralBonus;
        db.notifications.unshift({
          id: `notif_${Date.now()}_pending_ref_${user.id}`,
          userId: user.id,
          title: '🎉 Referral Earnings Unlocked!',
          message: `Your $${user.pendingReferralBonus.toFixed(2)} accumulated referral bonuses have been unlocked and added to your wallet upon your 1st deposit!`,
          type: 'REFERRAL_BONUS',
          badge: 'BONUS',
          isRead: false,
          createdAt: Date.now(),
        });
        user.pendingReferralBonus = 0;
      }

      // Add notification for the newly deposited user
      if (welcomeBonus > 0 || depositPctBonus > 0) {
        const bonusParts = [];
        if (welcomeBonus > 0) bonusParts.push(`$${welcomeBonus.toFixed(2)} welcome signup bonus`);
        if (depositPctBonus > 0) bonusParts.push(`$${depositPctBonus.toFixed(2)} (${bonusCfg.depositBonusPercent}%) deposit promo bonus`);
        db.notifications.unshift({
          id: `notif_${Date.now()}_first_dep_${user.id}`,
          userId: user.id,
          title: `🎁 1st Deposit & $${(welcomeBonus + depositPctBonus).toFixed(2)} Bonus!`,
          message: `Your deposit of $${deposit.amountUSD.toFixed(2)} was successful! A ${bonusParts.join(' + ')} has been credited to your wallet!`,
          type: 'SIGNUP_BONUS',
          badge: 'BONUS',
          isRead: false,
          createdAt: Date.now(),
        });
      } else {
        db.notifications.unshift({
          id: `notif_${Date.now()}_first_dep_${user.id}`,
          userId: user.id,
          title: '✅ 1st Deposit Approved!',
          message: `Your deposit of $${deposit.amountUSD.toFixed(2)} has been verified and credited to your wallet balance.`,
          type: 'DEPOSIT_APPROVED',
          badge: 'DEPOSIT',
          isRead: false,
          createdAt: Date.now(),
        });
      }

      // Credit the referrer if user was referred
      if (user.referredBy && bonusCfg.bonusesEnabled && bonusCfg.referralBonusEnabled) {
        const refUpper = String(user.referredBy).trim().toUpperCase();
        const referrerIdx = db.users.findIndex((u: any) => 
          (u.referralCode && u.referralCode.toUpperCase() === refUpper) ||
          (u.phone && u.phone.endsWith(refUpper.replace('SP-', '')))
        );

        if (referrerIdx !== -1) {
          const referrer = db.users[referrerIdx];
          const newCount = (referrer.referralCount || 0) + 1;
          let bonusToAdd = Number(bonusCfg.referralBonusUSD || 0);

          if (bonusCfg.referralMilestonesEnabled) {
            if (newCount === 5) bonusToAdd += Number(bonusCfg.referralMilestone5USD || 0);
            else if (newCount === 10) bonusToAdd += Number(bonusCfg.referralMilestone10USD || 0);
            else if (newCount === 20) bonusToAdd += Number(bonusCfg.referralMilestone20USD || 0);
            else if (newCount === 50) bonusToAdd += Number(bonusCfg.referralMilestone50USD || 0);
            else if (newCount === 100) bonusToAdd += Number(bonusCfg.referralMilestone100USD || 0);
          }

          bonusToAdd = Number(bonusToAdd.toFixed(2));

          if (bonusToAdd > 0) {
            const referrerHasDeposited = Boolean(
              referrer.firstDepositDone ||
              (db.deposits && db.deposits.some((d: any) => d.userId === referrer.id && d.status === 'APPROVED'))
            );

            if (referrerHasDeposited) {
              db.users[referrerIdx].walletBalance = Number(((referrer.walletBalance || 0) + bonusToAdd).toFixed(2));
              db.users[referrerIdx].lockedBonusBalance = Number(((referrer.lockedBonusBalance || 0) + bonusToAdd).toFixed(2));
              db.users[referrerIdx].referralCount = newCount;
              db.users[referrerIdx].referralBonusEarned = Number(((referrer.referralBonusEarned || 0) + bonusToAdd).toFixed(2));

              db.notifications.unshift({
                id: `notif_${Date.now()}_ref_bonus_${referrer.id}`,
                userId: referrer.id,
                title: '🎉 Referral Bonus Received!',
                message: `Your referred friend (${user.name}) completed their 1st deposit of $${deposit.amountUSD.toFixed(2)}! A referral reward of $${bonusToAdd.toFixed(2)} has been credited to your wallet.`,
                type: 'REFERRAL_BONUS',
                badge: 'REFERRAL',
                isRead: false,
                createdAt: Date.now(),
              });
            } else {
              db.users[referrerIdx].pendingReferralBonus = Number(((referrer.pendingReferralBonus || 0) + bonusToAdd).toFixed(2));
              db.users[referrerIdx].referralCount = newCount;
              db.users[referrerIdx].referralBonusEarned = Number(((referrer.referralBonusEarned || 0) + bonusToAdd).toFixed(2));

              db.notifications.unshift({
                id: `notif_${Date.now()}_ref_pending_${referrer.id}`,
                userId: referrer.id,
                title: '🎁 Referral Bonus Waiting!',
                message: `Your referred friend (${user.name}) completed their 1st deposit! Make your 1st deposit (min $${minDep.toFixed(2)} USD) to unlock and receive your $${bonusToAdd.toFixed(2)} referral bonus!`,
                type: 'REFERRAL_BONUS',
                badge: 'REFERRAL',
                isRead: false,
                createdAt: Date.now(),
              });
            }
          }
        }
      }
    } else {
      // Regular deposit approved notification (plus optional deposit % promo bonus)
      if (depositPctBonus > 0) {
        db.notifications.unshift({
          id: `notif_${Date.now()}_dep_${deposit.id}`,
          userId: user.id,
          title: `✅ Deposit & +$${depositPctBonus.toFixed(2)} Promo Bonus!`,
          message: `Your deposit of $${deposit.amountUSD.toFixed(2)} + $${depositPctBonus.toFixed(2)} (${bonusCfg.depositBonusPercent}% deposit bonus) has been credited to your wallet!`,
          type: 'DEPOSIT_APPROVED',
          badge: 'BONUS',
          isRead: false,
          createdAt: Date.now(),
        });
      } else {
        db.notifications.unshift({
          id: `notif_${Date.now()}_dep_${deposit.id}`,
          userId: user.id,
          title: '✅ Deposit Approved!',
          message: `Your deposit of $${deposit.amountUSD.toFixed(2)} has been verified and credited to your wallet balance.`,
          type: 'DEPOSIT_APPROVED',
          badge: 'DEPOSIT',
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    user.walletBalance = Number(((user.walletBalance || 0) + creditAmount).toFixed(2));
    if (totalLockedBonusAdded > 0) {
      user.lockedBonusBalance = Number(((user.lockedBonusBalance || 0) + totalLockedBonusAdded).toFixed(2));
    }
    const { password: _, ...userSafe } = user;
    return userSafe;
  };

  // 9. DEPOSITS: Create new deposit (with instant AI auto-approval if valid)
  app.post('/api/deposits', (req, res) => {
    try {
      const depositData = req.body;
      const db = readDb();

      if (!db.deposits) db.deposits = [];

      const newDeposit = {
        id: depositData.id || `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: depositData.userId,
        userName: depositData.userName,
        amountUSD: Number(depositData.amountUSD),
        depositType: depositData.depositType || 'AI_BINANCE',
        supportMethodName: depositData.supportMethodName || '',
        binanceTxId: depositData.binanceTxId,
        senderBinanceId: depositData.senderBinanceId || 'N/A',
        network: depositData.network,
        screenshotUrl: depositData.screenshotUrl,
        userNote: depositData.userNote || '',
        status: depositData.status || 'PENDING',
        aiVerified: Boolean(depositData.aiVerified),
        aiReason: depositData.aiReason,
        createdAt: depositData.createdAt || Date.now(),
        updatedAt: depositData.updatedAt || Date.now(),
      };

      let updatedUser = null;

      // If automatically approved, trigger balance & bonuses
      if (newDeposit.status === 'APPROVED') {
        updatedUser = approveDepositAndTriggerBonuses(db, newDeposit);
      }

      db.deposits.unshift(newDeposit);
      writeDb(db);
      return res.json({ success: true, deposit: newDeposit, user: updatedUser });
    } catch (err: any) {
      console.error('Create deposit error:', err);
      return res.status(500).json({ error: 'Failed to create deposit.' });
    }
  });

  // 10. DEPOSITS: Admin approve deposit
  app.post('/api/deposits/:id/approve', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDb();

      if (!db.deposits) db.deposits = [];
      const depIndex = db.deposits.findIndex((d: any) => d.id === id);
      if (depIndex === -1) {
        return res.status(404).json({ error: 'Deposit not found.' });
      }

      const deposit = db.deposits[depIndex];
      const updatedUser = approveDepositAndTriggerBonuses(db, deposit);

      writeDb(db);
      return res.json({ success: true, deposit, user: updatedUser });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to approve deposit.' });
    }
  });

  // 11. DEPOSITS: Admin reject deposit
  app.post('/api/deposits/:id/reject', (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const db = readDb();

      if (!db.deposits) db.deposits = [];
      const depIndex = db.deposits.findIndex((d: any) => d.id === id);
      if (depIndex === -1) {
        return res.status(404).json({ error: 'Deposit not found.' });
      }

      db.deposits[depIndex].status = 'REJECTED';
      db.deposits[depIndex].adminNote = note;
      db.deposits[depIndex].updatedAt = Date.now();

      writeDb(db);
      return res.json({ success: true, deposit: db.deposits[depIndex] });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to reject deposit.' });
    }
  });

  // 12. WITHDRAWALS: Get all withdrawals
  app.get('/api/withdrawals', (req, res) => {
    try {
      const db = readDb();
      return res.json({ withdrawals: db.withdrawals || [] });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch withdrawals.' });
    }
  });

  // 13. WITHDRAWALS: Create withdrawal request
  app.post('/api/withdrawals', (req, res) => {
    try {
      const { userId, userName, amountUSD, binanceType, binanceTarget } = req.body;
      const db = readDb();

      if (!db.withdrawals) db.withdrawals = [];

      const userIndex = db.users.findIndex((u: any) => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const numAmount = Number(Number(amountUSD).toFixed(2));
      const currentBalance = db.users[userIndex].walletBalance || 0;

      if (numAmount > currentBalance) {
        return res.status(400).json({ error: 'Insufficient wallet balance.' });
      }

      // Deduct from balance and add to frozen
      db.users[userIndex].walletBalance = Number((currentBalance - numAmount).toFixed(2));
      db.users[userIndex].frozenWithdrawal = Number(((db.users[userIndex].frozenWithdrawal || 0) + numAmount).toFixed(2));

      const newWithdrawal = {
        id: `WTH-${Math.floor(5000 + Math.random() * 9000)}`,
        userId,
        userName,
        amountUSD: numAmount,
        binanceType,
        binanceTarget,
        status: 'PENDING',
        createdAt: Date.now(),
      };

      db.withdrawals.unshift(newWithdrawal);
      writeDb(db);

      const { password: _, ...userSafe } = db.users[userIndex];
      return res.json({ success: true, withdrawal: newWithdrawal, user: userSafe });
    } catch (err: any) {
      console.error('Create withdrawal error:', err);
      return res.status(500).json({ error: 'Failed to process withdrawal.' });
    }
  });

  // 14. WITHDRAWALS: Admin approve withdrawal
  app.post('/api/withdrawals/:id/approve', (req, res) => {
    try {
      const { id } = req.params;
      const { txHash } = req.body;
      const db = readDb();

      if (!db.withdrawals) db.withdrawals = [];
      const wthIndex = db.withdrawals.findIndex((w: any) => w.id === id);
      if (wthIndex === -1) {
        return res.status(404).json({ error: 'Withdrawal not found.' });
      }

      const wth = db.withdrawals[wthIndex];
      wth.status = 'APPROVED';
      wth.txHash = txHash || 'BINANCE-PAY-SUCCESS';
      wth.updatedAt = Date.now();

      // Clear from user's frozen balance
      const userIndex = db.users.findIndex((u: any) => u.id === wth.userId);
      if (userIndex !== -1) {
        db.users[userIndex].frozenWithdrawal = Math.max(0, Number(((db.users[userIndex].frozenWithdrawal || 0) - wth.amountUSD).toFixed(2)));
      }

      writeDb(db);
      return res.json({ success: true, withdrawal: wth });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to approve withdrawal.' });
    }
  });

  // 15. WITHDRAWALS: Admin reject withdrawal (Refund balance)
  app.post('/api/withdrawals/:id/reject', (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const db = readDb();

      if (!db.withdrawals) db.withdrawals = [];
      const wthIndex = db.withdrawals.findIndex((w: any) => w.id === id);
      if (wthIndex === -1) {
        return res.status(404).json({ error: 'Withdrawal not found.' });
      }

      const wth = db.withdrawals[wthIndex];
      wth.status = 'REJECTED';
      wth.adminNote = note;
      wth.updatedAt = Date.now();

      // Refund to user balance
      const userIndex = db.users.findIndex((u: any) => u.id === wth.userId);
      if (userIndex !== -1) {
        db.users[userIndex].walletBalance = Number(((db.users[userIndex].walletBalance || 0) + wth.amountUSD).toFixed(2));
        db.users[userIndex].frozenWithdrawal = Math.max(0, Number(((db.users[userIndex].frozenWithdrawal || 0) - wth.amountUSD).toFixed(2)));
      }

      writeDb(db);
      return res.json({ success: true, withdrawal: wth });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to reject withdrawal.' });
    }
  });

  // 16. NOTIFICATIONS: Get notifications for user or global
  app.get('/api/notifications', (req, res) => {
    try {
      const { userId } = req.query;
      const db = readDb();
      const notifs = db.notifications || [];
      if (!userId) {
        return res.json({ notifications: notifs });
      }
      const filtered = notifs.filter((n: any) => !n.userId || n.userId === 'all' || n.userId === userId);
      return res.json({ notifications: filtered });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
  });

  // 17. NOTIFICATIONS: Admin publish new notice or system notification
  app.post('/api/notifications', (req, res) => {
    try {
      const { title, message, badge, type, userId } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required.' });
      }

      const db = readDb();
      if (!db.notifications) db.notifications = [];

      const newNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: userId || 'all',
        title: String(title).trim(),
        message: String(message).trim(),
        badge: badge || 'NOTICE',
        type: type || 'ADMIN_NOTICE',
        isRead: false,
        createdAt: Date.now(),
      };

      db.notifications.unshift(newNotif);

      // If global notice, update db.settings.quickNotice too
      if (!userId || userId === 'all') {
        if (!db.settings) db.settings = {};
        db.settings.quickNotice = {
          enabled: true,
          title: newNotif.title,
          message: newNotif.message,
          badge: newNotif.badge,
          updatedAt: Date.now(),
        };
      }

      writeDb(db);
      return res.json({ success: true, notification: newNotif, quickNotice: db.settings?.quickNotice });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to publish notification.' });
    }
  });

  // 18. SETTINGS: Get current admin settings (quickNotice, supportPaymentMethods, etc.)
  app.get('/api/settings', (req, res) => {
    try {
      const db = readDb();
      return res.json({ settings: db.settings || null });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch settings.' });
    }
  });

  // 19. SETTINGS: Update admin settings (deep-merge bonusConfig)
  app.post('/api/settings', (req, res) => {
    try {
      const newSettings = req.body || {};
      const db = readDb();
      const prevBonusConfig = getBonusConfig(db);
      db.settings = {
        ...(db.settings || {}),
        ...newSettings,
        bonusConfig: newSettings.bonusConfig
          ? { ...prevBonusConfig, ...newSettings.bonusConfig }
          : prevBonusConfig,
      };
      writeDb(db);
      return res.json({ success: true, settings: db.settings });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update settings.' });
    }
  });

  // Mount Vite in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shapla Poribar Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
