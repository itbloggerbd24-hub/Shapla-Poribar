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
  createdAt?: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  amountUSD: number;
  binanceTxId: string;
  senderBinanceId: string;
  network: 'BINANCE_PAY' | 'USDT_BEP20' | 'USDT_TRC20';
  screenshotUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  aiVerified?: boolean;
  aiReason?: string;
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
  minDepositUSD: number; // 1.00
  platformFeePercent: number; // 15%
  winnerProfitPercent: number; // 85%
  roundDurationSeconds: number; // exactly 30s as requested
  flippingDurationSeconds: number; // 3.5s realistic toss
  resultDisplaySeconds: number; // 4.5s
  forcedOutcome: 'AUTO' | 'FORCE_SHAPLA' | 'FORCE_PORIBAR';
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
