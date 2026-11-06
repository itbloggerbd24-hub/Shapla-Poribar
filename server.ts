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

  // 6. ADMIN: Adjust user balance
  app.post('/api/users/:id/balance', (req, res) => {
    try {
      const { id } = req.params;
      const { walletBalance } = req.body;
      const db = readDb();

      const userIndex = db.users.findIndex((u: any) => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      db.users[userIndex].walletBalance = Number(Number(walletBalance).toFixed(2));
      writeDb(db);

      return res.json({ success: true, walletBalance: db.users[userIndex].walletBalance });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update balance.' });
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
