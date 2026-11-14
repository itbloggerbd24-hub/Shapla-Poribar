import { AdminSettings, BonusConfig, DepositRequest, UserProfile, WithdrawalRequest, Round, RankedPlayer } from '../types/game';

export const OFFICIAL_BINANCE_PAY_ID = '1156528658';
export const OFFICIAL_USDT_BEP20_ADDRESS = '0xd1194126385ab996d60542f54e5d8f1372a4cc3e';
export const OFFICIAL_USDT_TRC20_ADDRESS = 'TPHsdQU9EzZYMkQRuaqYA9UkrD25h86gNU';

export const DEFAULT_BONUS_CONFIG: BonusConfig = {
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
  festivalBonusEnabled: false,
  festivalBonusMode: 'FIXED_CASH',
  festivalBonusId: 'fest_special_1',
  festivalBonusTitle: 'Eid / Puja Special Festival Offer',
  festivalBonusDescription: 'Celebrating the festive season with Shapla Poribar! Claim this special occasion bonus credit and enjoy your predictions.',
  festivalBonusAmountUSD: 2.00,
  festivalBonusPercent: 15,
  customPromoText: '',
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  binancePayId: OFFICIAL_BINANCE_PAY_ID,
  binancePayEmail: 'admin.binance@paycrypto.com',
  usdtBep20Address: OFFICIAL_USDT_BEP20_ADDRESS,
  usdtTrc20Address: OFFICIAL_USDT_TRC20_ADDRESS,
  minBetUSD: 0.20, // minimum bet $0.20 as requested
  minWithdrawalUSD: 10.00, // minimum withdrawal $10.00
  minDepositUSD: 5.00, // minimum deposit $5.00 as requested
  platformFeePercent: 15,
  winnerProfitPercent: 85,
  roundDurationSeconds: 30, // exactly 30 seconds as requested
  flippingDurationSeconds: 3.5,
  resultDisplaySeconds: 4.5,
  forcedOutcome: 'AUTO',
  quickNotice: {
    enabled: true,
    title: 'Official Announcement',
    message: 'Welcome to Shapla Poribar! To deposit instantly, use Binance Pay or USDT (TRC-20 / BEP-20) via Live Support. Minimum deposit is $5.00 USD with a $1.00 instant signup bonus on your 1st deposit!',
    badge: 'NOTICE',
    updatedAt: Date.now(),
  },
  supportPaymentMethods: [
    {
      id: 'sp_binance_pay',
      name: 'Binance Pay ID (Official Admin)',
      accountNumber: '1156528658',
      accountType: 'Binance Pay ID',
      instructions: 'Open your Binance App, go to Pay > Send, enter Recipient ID 1156528658 and transfer USD/USDT. Submit your TxID and payment screenshot.',
      isActive: true,
    },
    {
      id: 'sp_usdt_trc20',
      name: 'USDT (TRC-20 Network)',
      accountNumber: 'TPHsdQU9EzZYMkQRuaqYA9UkrD25h86gNU',
      accountType: 'Crypto TRC-20',
      instructions: 'Send USDT on TRON (TRC-20) network to the address above. Submit your Transaction ID (TxID) and screenshot.',
      isActive: true,
    },
    {
      id: 'sp_usdt_bep20',
      name: 'USDT (BEP-20 Network)',
      accountNumber: '0xd1194126385ab996d60542f54e5d8f1372a4cc3e',
      accountType: 'Crypto BEP-20',
      instructions: 'Send USDT on BNB Smart Chain (BEP-20) network to the address above. Submit your transaction hash (TxID) and screenshot.',
      isActive: true,
    }
  ],
  supportContactWhatsapp: '+8801899999999',
  supportContactTelegram: 'ShaplaPoribarSupport',
  bonusConfig: DEFAULT_BONUS_CONFIG,
};

export const INITIAL_USER: UserProfile = {
  id: 'usr_player_1',
  name: 'Alex Hunter',
  phone: '01712345678',
  password: '123456',
  walletBalance: 1.00, // starting welcome bonus $1.00 USD
  lockedBonusBalance: 1.00, // locked until wagered in bets
  frozenWithdrawal: 0,
  totalWon: 0,
  totalLost: 0,
  role: 'USER',
  binancePayId: '749102381',
  binanceAddress: '0xd1194126385ab996d60542f54e5d8f1372a4cc3e',
  isSuspended: false,
  referralCode: 'SP-ALEX77',
  referralCount: 3,
  referralBonusEarned: 1.50,
  createdAt: Date.now() - 86400000 * 5,
};

export const INITIAL_ADMIN: UserProfile = {
  id: 'usr_admin',
  name: 'Super Admin',
  phone: '01899999999',
  password: 't$5yB1qu4mEa3gR',
  walletBalance: 15000.00,
  lockedBonusBalance: 0,
  frozenWithdrawal: 0,
  totalWon: 0,
  totalLost: 0,
  role: 'ADMIN',
  binancePayId: '1156528658',
  binanceAddress: '0xd1194126385ab996d60542f54e5d8f1372a4cc3e',
  isSuspended: false,
  createdAt: Date.now() - 86400000 * 30,
};

export const INITIAL_DEPOSITS: DepositRequest[] = [
  {
    id: 'DEP-8021',
    userId: 'usr_player_1',
    userName: 'Alex Hunter',
    amountUSD: 25.00,
    binanceTxId: 'BNP94820194821',
    senderBinanceId: '749102381',
    network: 'BINANCE_PAY',
    screenshotUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260' fill='%23181a20'><rect width='400' height='260' rx='16' fill='%23181a20'/><circle cx='200' cy='45' r='22' fill='%230ecb81'/><path d='M192 45l5 5 11-11' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/><text x='200' y='95' fill='%23ffffff' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='middle'>Payment Successful</text><text x='200' y='125' fill='%23f0b90b' font-family='monospace' font-size='22' font-weight='bold' text-anchor='middle'>+25.00 USDT</text><line x1='30' y1='145' x2='370' y2='145' stroke='%232b313a' stroke-dasharray='4'/><text x='40' y='175' fill='%23848e9c' font-family='sans-serif' font-size='12'>Recipient ID:</text><text x='360' y='175' fill='%23ffffff' font-family='monospace' font-size='12' text-anchor='end'>1156528658 (Admin)</text><text x='40' y='200' fill='%23848e9c' font-family='sans-serif' font-size='12'>TxID / Order ID:</text><text x='360' y='200' fill='%23ffffff' font-family='monospace' font-size='12' text-anchor='end'>BNP94820194821</text><text x='200' y='238' fill='%230ecb81' font-family='sans-serif' font-size='11' text-anchor='middle'>Verified by Binance Pay System</text></svg>",
    status: 'APPROVED',
    adminNote: 'Verified on Binance Pay. Balance credited.',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 1.8,
  },
  {
    id: 'DEP-8024',
    userId: 'usr_tanvir_9',
    userName: 'David Miller',
    amountUSD: 50.00,
    binanceTxId: 'BNP30491823901',
    senderBinanceId: '592019482',
    network: 'BINANCE_PAY',
    screenshotUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260' fill='%23181a20'><rect width='400' height='260' rx='16' fill='%23181a20'/><circle cx='200' cy='45' r='22' fill='%230ecb81'/><path d='M192 45l5 5 11-11' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/><text x='200' y='95' fill='%23ffffff' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='middle'>Payment Successful</text><text x='200' y='125' fill='%23f0b90b' font-family='monospace' font-size='22' font-weight='bold' text-anchor='middle'>+50.00 USDT</text><line x1='30' y1='145' x2='370' y2='145' stroke='%232b313a' stroke-dasharray='4'/><text x='40' y='175' fill='%23848e9c' font-family='sans-serif' font-size='12'>Recipient ID:</text><text x='360' y='175' fill='%23ffffff' font-family='monospace' font-size='12' text-anchor='end'>1156528658 (Admin)</text><text x='40' y='200' fill='%23848e9c' font-family='sans-serif' font-size='12'>TxID / Order ID:</text><text x='360' y='200' fill='%23ffffff' font-family='monospace' font-size='12' text-anchor='end'>BNP30491823901</text><text x='200' y='238' fill='%230ecb81' font-family='sans-serif' font-size='11' text-anchor='middle'>Verified by Binance Pay System</text></svg>",
    status: 'PENDING',
    createdAt: Date.now() - 60000 * 14,
  },
  {
    id: 'DEP-8025',
    userId: 'usr_arif_4',
    userName: 'James Wilson',
    amountUSD: 20.00,
    binanceTxId: '0x7b88f341902882aef',
    senderBinanceId: 'USDT_BEP20',
    network: 'USDT_BEP20',
    screenshotUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260' fill='%23181a20'><rect width='400' height='260' rx='16' fill='%23181a20'/><circle cx='200' cy='45' r='22' fill='%230ecb81'/><path d='M192 45l5 5 11-11' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/><text x='200' y='95' fill='%23ffffff' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='middle'>Transfer Confirmed</text><text x='200' y='125' fill='%23f0b90b' font-family='monospace' font-size='22' font-weight='bold' text-anchor='middle'>+20.00 USDT</text><line x1='30' y1='145' x2='370' y2='145' stroke='%232b313a' stroke-dasharray='4'/><text x='40' y='175' fill='%23848e9c' font-family='sans-serif' font-size='12'>Network:</text><text x='360' y='175' fill='%23ffffff' font-family='monospace' font-size='12' text-anchor='end'>USDT (BEP-20)</text><text x='40' y='200' fill='%23848e9c' font-family='sans-serif' font-size='12'>TxID / Hash:</text><text x='360' y='200' fill='%23ffffff' font-family='monospace' font-size='12' text-anchor='end'>0x7b88f341902882aef</text><text x='200' y='238' fill='%230ecb81' font-family='sans-serif' font-size='11' text-anchor='middle'>Confirmed on BSC Blockchain</text></svg>",
    status: 'PENDING',
    createdAt: Date.now() - 60000 * 5,
  }
];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'WTH-5011',
    userId: 'usr_player_1',
    userName: 'Alex Hunter',
    amountUSD: 10.00,
    binanceType: 'PAY_ID',
    binanceTarget: '749102381',
    status: 'APPROVED',
    txHash: 'PAY-OUT-9948201',
    adminNote: 'Transferred via Binance Pay ID successfully.',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 23,
  },
  {
    id: 'WTH-5012',
    userId: 'usr_sumon_3',
    userName: 'Ryan Cooper',
    amountUSD: 15.00,
    binanceType: 'BEP20',
    binanceTarget: '0x16Fa72e382BbC992E389140',
    status: 'PENDING',
    createdAt: Date.now() - 60000 * 20,
  }
];

export const INITIAL_ROUNDS_HISTORY: Round[] = [
  {
    id: 1042,
    startTime: Date.now() - 180000,
    endTime: Date.now() - 150000,
    status: 'RESULT',
    winner: 'SHAPLA',
    shaplaTotal: 42.50,
    poribarTotal: 78.00,
    platformFeePercent: 15,
    winnerMultiplier: 1.85,
    totalBetsCount: 18,
    settled: true,
  },
  {
    id: 1043,
    startTime: Date.now() - 150000,
    endTime: Date.now() - 120000,
    status: 'RESULT',
    winner: 'PORIBAR',
    shaplaTotal: 94.00,
    poribarTotal: 51.20,
    platformFeePercent: 15,
    winnerMultiplier: 1.85,
    totalBetsCount: 24,
    settled: true,
  },
  {
    id: 1044,
    startTime: Date.now() - 120000,
    endTime: Date.now() - 90000,
    status: 'RESULT',
    winner: 'SHAPLA',
    shaplaTotal: 38.60,
    poribarTotal: 65.40,
    platformFeePercent: 15,
    winnerMultiplier: 1.85,
    totalBetsCount: 15,
    settled: true,
  }
];

// Top 50 Ranked Players with Daily, Weekly, Monthly, and Total Earnings in USD ($)
const PLAYER_NAMES = [
  'Michael Vance', 'David Miller', 'Liam Scott', 'Robert Hayes', 'James Wilson',
  'Arthur King', 'Ethan Ross', 'Chris Becker', 'Lucas Reed', 'Oliver Vance',
  'Leo Armstrong', 'Samuel Green', 'Daniel Craig', 'Marcus Shaw', 'Victor Stone',
  'Noah Bennett', 'Alexander Wright', 'Benjamin Cole', 'Henry Adams', 'Sebastian Ward',
  'Jackson Brooks', 'Mateo Hughes', 'Jack Turner', 'Owen Foster', 'Carter Powell',
  'Wyatt Jenkins', 'Julian Perry', 'Gabriel Butler', 'Anthony Simmons', 'Dylan Russell',
  'Thomas Griffin', 'Caleb Hayes', 'Mason Diaz', 'Isaiah Myers', 'Andrew Ford',
  'Joshua Hamilton', 'Nathan Graham', 'Christian Sullivan', 'Hunter Wallace', 'Eli Woods',
  'Aaron Cole', 'Landon West', 'Jonathan Jordan', 'Nolan Reynolds', 'Adrian Fisher',
  'Cameron Ellis', 'Colton Harrison', 'Austin Gibson', 'Evan McDonald', 'Ian Cruz'
];

export const INITIAL_RANKINGS: RankedPlayer[] = PLAYER_NAMES.map((name, idx) => {
  const rank = idx + 1;
  const parts = name.split(' ');
  const avatarSeed = parts[0][0] + (parts[1] ? parts[1][0] : '');
  const decay = Math.pow(0.95, idx);
  
  return {
    id: `rank_${rank}`,
    name,
    avatarSeed,
    dailyEarning: Number((260 * decay + 18.5).toFixed(2)),
    weeklyEarning: Number((1500 * decay + 95).toFixed(2)),
    monthlyEarning: Number((6200 * decay + 380).toFixed(2)),
    totalEarning: Number((9800 * decay + 750).toFixed(2)),
    roundsWon: Math.max(12, Math.floor(145 * decay + 10)),
    winRate: Math.max(51, Math.floor(75 - (idx * 0.45))),
  };
});

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(`sp_${key}`);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.error('Storage read error', e);
  }
  return fallback;
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`sp_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

// Ensure official admin settings and payment credentials are always updated even across cached browser storage
export function sanitizeAdminSettings(settings?: Partial<AdminSettings>): AdminSettings {
  const base = { ...DEFAULT_ADMIN_SETTINGS, ...(settings || {}) };
  base.binancePayId = OFFICIAL_BINANCE_PAY_ID;
  base.usdtBep20Address = OFFICIAL_USDT_BEP20_ADDRESS;
  base.usdtTrc20Address = OFFICIAL_USDT_TRC20_ADDRESS;

  base.bonusConfig = {
    ...DEFAULT_BONUS_CONFIG,
    ...(settings?.bonusConfig || {}),
  };

  base.quickNotice = {
    ...DEFAULT_ADMIN_SETTINGS.quickNotice,
    ...(settings?.quickNotice || {}),
  };

  base.supportPaymentMethods = [
    {
      id: 'sp_binance_pay',
      name: 'Binance Pay ID (Official Admin)',
      accountNumber: OFFICIAL_BINANCE_PAY_ID,
      accountType: 'Binance Pay ID',
      instructions: `Open your Binance App, go to Pay > Send, enter Recipient ID ${OFFICIAL_BINANCE_PAY_ID} and transfer USD/USDT. Submit your TxID and payment screenshot.`,
      isActive: true,
    },
    {
      id: 'sp_usdt_trc20',
      name: 'USDT (TRC-20 Network)',
      accountNumber: OFFICIAL_USDT_TRC20_ADDRESS,
      accountType: 'Crypto TRC-20',
      instructions: 'Send USDT on TRON (TRC-20) network to the address above. Submit your Transaction ID (TxID) and screenshot.',
      isActive: true,
    },
    {
      id: 'sp_usdt_bep20',
      name: 'USDT (BEP-20 Network)',
      accountNumber: OFFICIAL_USDT_BEP20_ADDRESS,
      accountType: 'Crypto BEP-20',
      instructions: 'Send USDT on BNB Smart Chain (BEP-20) network to the address above. Submit your transaction hash (TxID) and screenshot.',
      isActive: true,
    }
  ];

  return base;
}

// Bot player names for internal round simulations
export const BOT_PLAYERS = [
  { name: 'Michael Vance', id: 'bot_1' },
  { name: 'David Miller', id: 'bot_2' },
  { name: 'Liam S.', id: 'bot_3' },
  { name: 'Robert Hayes', id: 'bot_4' },
  { name: 'James Wilson', id: 'bot_5' },
  { name: 'Arthur King', id: 'bot_6' },
  { name: 'Ethan Ross', id: 'bot_7' },
  { name: 'Chris Becker', id: 'bot_8' },
  { name: 'Lucas Scott', id: 'bot_9' },
  { name: 'Oliver Reed', id: 'bot_10' },
  { name: 'Leo Vance', id: 'bot_11' },
  { name: 'Samuel Green', id: 'bot_12' },
];
