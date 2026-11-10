export type OptionType = 'SHAPLA' | 'PORIBAR';

export type RoundStatus = 'BETTING' | 'FLIPPING' | 'RESULT';

export interface Bet {
  id: string;
  roundId: number;
  userId: string;
  userName: string;
  option: OptionType;
  amount: number; // in USD ($)
  timestamp: number;
  status: 'PENDING' | 'WON' | 'LOST';
  payout?: number;
}

export interface Round {
  id: number;
  startTime: number;
  endTime: number;
  status: RoundStatus;
  winner: OptionType | null;
  shaplaTotal: number; // in USD ($)
  poribarTotal: number; // in USD ($)
  platformFeePercent: number; // 15%
  winnerMultiplier: number; // 1.85 (100% stake + 85% profit)
  totalBetsCount: number;
  settled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  password?: string;
  walletBalance: number; // in USD ($)
  lockedBonusBalance?: number; // in USD ($) - bonus amount that must be wagered before withdrawal
  frozenWithdrawal: number;
  totalWon: number;
  totalLost: number;
  role: 'USER' | 'ADMIN';
  binancePayId?: string;
  binanceAddress?: string;
  isSuspended?: boolean;
  suspensionReason?: string;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  referralBonusEarned?: number;
  referralWagerRequirement?: number;
  totalWagered?: number;
  lastDailyClaim?: number;
  lastWeeklyClaim?: number;
  lastMonthlyClaim?: number;
  firstDepositDone?: boolean;
  pendingReferralBonus?: number;
  createdAt?: number;
}

export interface AppNotification {
  id: string;
  userId?: string; // empty string or 'all' means global broadcast
  title: string;
  message: string;
  type: 'ADMIN_NOTICE' | 'REFERRAL_BONUS' | 'SIGNUP_BONUS' | 'DEPOSIT_APPROVED' | 'WITHDRAWAL_STATUS' | 'SYSTEM';
  badge?: string;
  isRead?: boolean;
  createdAt: number;
}

export interface QuickNotice {
  enabled: boolean;
  title: string;
  message: string;
  badge?: string; // 'NOTICE' | 'BONUS' | 'URGENT' | 'DEPOSIT' | 'UPDATE'
  updatedAt?: number;
}

export interface SupportPaymentMethod {
  id: string;
  name: string; // e.g. 'Binance Pay ID', 'USDT (TRC-20)', 'USDT (BEP-20)'
  accountNumber: string;
  accountType?: string; // 'Personal' | 'Merchant' | 'Agent' | 'Binance Pay' | 'Crypto'
  instructions: string;
  isActive: boolean;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  amountUSD: number;
  depositType?: 'AI_BINANCE' | 'SUPPORT_AGENT';
  supportMethodName?: string;
  binanceTxId: string;
  senderBinanceId: string;
  network?: string;
  screenshotUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  aiVerified?: boolean;
  aiReason?: string;
  userNote?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amountUSD: number;
  binanceType: 'PAY_ID' | 'BEP20' | 'TRC20';
  binanceTarget: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  txHash?: string;
  adminNote?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface AdminSettings {
  binancePayId: string;
  binancePayEmail: string;
  usdtBep20Address: string;
  usdtTrc20Address: string;
  minBetUSD: number; // 0.20
  minWithdrawalUSD: number; // 10.00
  minDepositUSD: number; // 5.00
  platformFeePercent: number; // 15%
  winnerProfitPercent: number; // 85%
  roundDurationSeconds: number; // exactly 30s as requested
  flippingDurationSeconds: number; // 3.5s realistic toss
  resultDisplaySeconds: number; // 4.5s
  forcedOutcome: 'AUTO' | 'FORCE_SHAPLA' | 'FORCE_PORIBAR';
  quickNotice: QuickNotice;
  supportPaymentMethods: SupportPaymentMethod[];
  supportContactWhatsapp?: string;
  supportContactTelegram?: string;
}

export interface RankedPlayer {
  id: string;
  name: string;
  avatarSeed: string;
  totalEarning: number; // in USD ($)
  dailyEarning: number;
  weeklyEarning: number;
  monthlyEarning: number;
  roundsWon: number;
  winRate: number;
}
