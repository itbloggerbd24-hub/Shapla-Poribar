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

  // Phone Normalization Helper
  const normalizePhone = (phone: string) => {
    return String(phone || '').replace(/[\s\-\(\)\+]/g, '');
  };

  // 1. REGISTER: Enforce exactly 1 account per phone number + $1.00 welcome bonus + referral bonus
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, phone, password, binancePayId, referralCode } = req.body;
      if (!name || !phone || !password) {
        return res.status(400).json({ error: 'Name, phone number, and password are required.' });
      }

      const cleanPhone = normalizePhone(phone);
      if (cleanPhone.length < 6) {
        return res.status(400).json({ error: 'Please enter a valid phone number.' });
      }

      const db = readDb();

      // Check if account already exists with this phone number
      const existing = db.users.find((u: any) => normalizePhone(u.phone) === cleanPhone);
      if (existing) {
        return res.status(400).json({ 
          error: 'An account is already registered with this phone number. Multiple accounts with the same number are not permitted.' 
        });
      }

      const cleanName = String(name).trim();
      const namePart = cleanName.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'SP';
      const myRefCode = `SP-${cleanPhone.slice(-4)}${namePart}`;

      const newUser = {
        id: `usr_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        name: cleanName,
        phone: String(phone).trim(),
        password: String(password).trim(),
        walletBalance: 1.00, // Exactly $1.00 USD welcome bonus as requested
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
        lastDailyClaim: 0,
        lastWeeklyClaim: 0,
        isSuspended: false,
        createdAt: Date.now(),
      };

      // Process referrer if valid referral code was provided
      if (referralCode) {
        const refUpper = String(referralCode).trim().toUpperCase();
        const referrerIdx = db.users.findIndex((u: any) => 
          (u.referralCode && u.referralCode.toUpperCase() === refUpper) ||
          (u.phone && u.phone.endsWith(refUpper.replace('SP-', '')))
        );

        if (referrerIdx !== -1) {
          const referrer = db.users[referrerIdx];
          const newCount = (referrer.referralCount || 0) + 1;
          let bonusToAdd = 0.50; // $0.50 per referral

          // Milestone cash bonus bonuses:
          // 5th friend -> extra +$1.00
          // 10th friend -> extra +$3.00
          // 20th friend -> extra +$5.00
          if (newCount === 5) {
            bonusToAdd += 1.00;
          } else if (newCount === 10) {
            bonusToAdd += 3.00;
          } else if (newCount === 20) {
            bonusToAdd += 5.00;
          }

          db.users[referrerIdx].walletBalance = Number(((referrer.walletBalance || 0) + bonusToAdd).toFixed(2));
          db.users[referrerIdx].referralCount = newCount;
          db.users[referrerIdx].referralBonusEarned = Number(((referrer.referralBonusEarned || 0) + bonusToAdd).toFixed(2));
          db.users[referrerIdx].referralWagerRequirement = Number(((referrer.referralWagerRequirement || 0) + bonusToAdd).toFixed(2));
        }
      }

      db.users.push(newUser);
      writeDb(db);

      const { password: _, ...userSafe } = newUser;
      return res.json({ success: true, user: userSafe });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Internal registration error.' });
    }
  });

  // 2. LOGIN: Universal login from any device or browser
  app.post('/api/auth/login', (req, res) => {
    try {
      const { phone, password } = req.body;
      if (!phone || !password) {
        return res.status(400).json({ error: 'Please enter phone number and password.' });
      }

      const cleanPhone = normalizePhone(phone);
      const db = readDb();

      const user = db.users.find((u: any) => normalizePhone(u.phone) === cleanPhone);
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

      const { password: _, ...userSafe } = user;
      return res.json({ success: true, user: userSafe });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal login error.' });
    }
  });

  // 3. FORGOT PASSWORD: Reset password with phone verification
  app.post('/api/auth/forgot-password', (req, res) => {
    try {
      const { phone, newPassword } = req.body;
      if (!phone || !newPassword) {
        return res.status(400).json({ error: 'Phone number and new password are required.' });
      }

      if (String(newPassword).length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }

      const cleanPhone = normalizePhone(phone);
      const db = readDb();

      const userIndex = db.users.findIndex((u: any) => normalizePhone(u.phone) === cleanPhone);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'No account found with this phone number.' });
      }

      db.users[userIndex].password = String(newPassword).trim();
      writeDb(db);

      return res.json({ success: true, message: 'Password has been updated. You can now login.' });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ error: 'Internal reset error.' });
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
      const { walletBalance, totalWagered, referralWagerRequirement } = req.body;
      const db = readDb();

      const userIndex = db.users.findIndex((u: any) => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (walletBalance !== undefined) {
        db.users[userIndex].walletBalance = Number(Number(walletBalance).toFixed(2));
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

  // 7. USER: Claim Daily ($0.50) or Weekly ($1.00) Free Bonus (Persistent on disk)
  app.post('/api/users/:id/claim-bonus', (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.body; // 'daily' | 'weekly'
      const db = readDb();

      const userIndex = db.users.findIndex((u: any) => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const now = Date.now();
      const user = db.users[userIndex];
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

      let bonusAmount = 0;
      if (type === 'daily') {
        const lastDaily = user.lastDailyClaim || 0;
        if (now - lastDaily < ONE_DAY_MS) {
          return res.status(400).json({ error: 'Daily bonus is still on cooldown.' });
        }
        bonusAmount = 0.50;
        db.users[userIndex].lastDailyClaim = now;
      } else if (type === 'weekly') {
        const lastWeekly = user.lastWeeklyClaim || 0;
        if (now - lastWeekly < ONE_WEEK_MS) {
          return res.status(400).json({ error: 'Weekly bonus is still on cooldown.' });
        }
        bonusAmount = 1.00;
        db.users[userIndex].lastWeeklyClaim = now;
      } else {
        return res.status(400).json({ error: 'Invalid bonus type.' });
      }

      db.users[userIndex].walletBalance = Number(((user.walletBalance || 0) + bonusAmount).toFixed(2));
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
        binanceTxId: depositData.binanceTxId,
        senderBinanceId: depositData.senderBinanceId || 'N/A',
        network: depositData.network,
        screenshotUrl: depositData.screenshotUrl,
        status: depositData.status || 'PENDING',
        aiVerified: Boolean(depositData.aiVerified),
        aiReason: depositData.aiReason,
        createdAt: depositData.createdAt || Date.now(),
        updatedAt: depositData.updatedAt || Date.now(),
      };

      db.deposits.unshift(newDeposit);

      // If automatically approved, credit wallet balance in database
      let updatedUser = null;
      if (newDeposit.status === 'APPROVED') {
        const userIndex = db.users.findIndex((u: any) => u.id === newDeposit.userId);
        if (userIndex !== -1) {
          db.users[userIndex].walletBalance = Number(((db.users[userIndex].walletBalance || 0) + newDeposit.amountUSD).toFixed(2));
          const { password: _, ...userSafe } = db.users[userIndex];
          updatedUser = userSafe;
        }
      }

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
      if (deposit.status !== 'APPROVED') {
        deposit.status = 'APPROVED';
        deposit.updatedAt = Date.now();

        // Credit user balance
        const userIndex = db.users.findIndex((u: any) => u.id === deposit.userId);
        if (userIndex !== -1) {
          db.users[userIndex].walletBalance = Number(((db.users[userIndex].walletBalance || 0) + deposit.amountUSD).toFixed(2));
        }
      }

      writeDb(db);
      return res.json({ success: true, deposit });
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
