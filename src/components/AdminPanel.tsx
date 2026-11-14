import React, { useState, useEffect } from 'react';
import { 
  AdminSettings, 
  BonusConfig,
  DepositRequest, 
  Round, 
  UserProfile, 
  WithdrawalRequest,
  Bet
} from '../types/game';
import { DEFAULT_BONUS_CONFIG } from '../utils/storage';
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Settings, 
  Users, 
  Clock, 
  ShieldCheck, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Sparkles,
  Save,
  Search,
  Award,
  Eye,
  Image as ImageIcon,
  X,
  UserX,
  UserCheck,
  ShieldAlert,
  Megaphone,
  Bell,
  Smartphone,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Wallet,
  Activity,
  Gift,
  Flame,
  RotateCcw
} from 'lucide-react';

interface AdminPanelProps {
  settings: AdminSettings;
  onUpdateSettings: (newSettings: AdminSettings) => void | Promise<void>;
  deposits: DepositRequest[];
  onApproveDeposit: (depositId: string) => void;
  onRejectDeposit: (depositId: string, note?: string) => void;
  withdrawals: WithdrawalRequest[];
  onApproveWithdrawal: (withdrawalId: string, txHash?: string) => void;
  onRejectWithdrawal: (withdrawalId: string, note?: string) => void;
  roundsHistory: Round[];
  currentRound: Round;
  users: UserProfile[];
  onAdjustUserBalance: (userId: string, newBalance: number) => void;
  onGrantUserBonus?: (userId: string, amountUSD: number, note?: string) => Promise<boolean | void>;
  onToggleSuspendUser?: (userId: string, isSuspended: boolean, reason?: string) => void;
  onPublishNotice?: (title: string, message: string, badge?: string, type?: 'ADMIN_NOTICE' | 'FESTIVAL_BONUS') => Promise<boolean | void>;
  onCloseAdmin: () => void;
  allBets?: Bet[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  onUpdateSettings,
  deposits,
  onApproveDeposit,
  onRejectDeposit,
  withdrawals,
  onApproveWithdrawal,
  onRejectWithdrawal,
  roundsHistory,
  users,
  onAdjustUserBalance,
  onGrantUserBonus,
  onToggleSuspendUser,
  onPublishNotice,
  onCloseAdmin,
  allBets = [],
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSITS' | 'WITHDRAWALS' | 'BONUSES' | 'NOTICES' | 'SETTINGS' | 'USERS'>('DEPOSITS');
  const [editableSettings, setEditableSettings] = useState<AdminSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);
  const [bonusesSaved, setBonusesSaved] = useState<boolean>(false);
  const [festivalNoticeSent, setFestivalNoticeSent] = useState<boolean>(false);
  const [noticePublished, setNoticePublished] = useState<boolean>(false);
  
  useEffect(() => {
    setEditableSettings(settings);
  }, [settings]);

  // User balance & bonus adjustment state
  const [userSearch, setUserSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [grantBonusUserId, setGrantBonusUserId] = useState<string | null>(null);
  const [grantBonusAmount, setGrantBonusAmount] = useState<number>(1.00);
  const [grantBonusNote, setGrantBonusNote] = useState<string>('');
  const [bonusGrantedBanner, setBonusGrantedBanner] = useState<string | null>(null);
  const [viewingDepositSlip, setViewingDepositSlip] = useState<DepositRequest | null>(null);

  const bonusCfg: BonusConfig = {
    ...DEFAULT_BONUS_CONFIG,
    ...(editableSettings.bonusConfig || {}),
  };

  const updateBonusField = <K extends keyof BonusConfig>(field: K, value: BonusConfig[K]) => {
    setEditableSettings((prev) => ({
      ...prev,
      bonusConfig: {
        ...DEFAULT_BONUS_CONFIG,
        ...(prev.bonusConfig || {}),
        [field]: value,
      },
    }));
  };

  // Time Boundaries for Reporting (Accurate local day/week/month/year)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  // Financial Calculations in USD
  const pendingDeposits = deposits.filter((d) => d.status === 'PENDING');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'PENDING');

  const approvedDeposits = deposits.filter((d) => d.status === 'APPROVED');
  const realTotalDeposit = approvedDeposits.reduce((sum, d) => sum + d.amountUSD, 0);
  const realTodayDeposit = approvedDeposits
    .filter((d) => (d.updatedAt || d.createdAt) >= startOfToday)
    .reduce((sum, d) => sum + d.amountUSD, 0);
  const realWeekDeposit = approvedDeposits
    .filter((d) => (d.updatedAt || d.createdAt) >= startOfWeek)
    .reduce((sum, d) => sum + d.amountUSD, 0);
  const realMonthDeposit = approvedDeposits
    .filter((d) => (d.updatedAt || d.createdAt) >= startOfMonth)
    .reduce((sum, d) => sum + d.amountUSD, 0);
  const realYearDeposit = approvedDeposits
    .filter((d) => (d.updatedAt || d.createdAt) >= startOfYear)
    .reduce((sum, d) => sum + d.amountUSD, 0);

  const approvedWithdrawals = withdrawals.filter((w) => w.status === 'APPROVED');
  const realTotalPayout = approvedWithdrawals.reduce((sum, w) => sum + w.amountUSD, 0);
  const realTodayPayout = approvedWithdrawals
    .filter((w) => (w.updatedAt || w.createdAt) >= startOfToday)
    .reduce((sum, w) => sum + w.amountUSD, 0);
  const realWeekPayout = approvedWithdrawals
    .filter((w) => (w.updatedAt || w.createdAt) >= startOfWeek)
    .reduce((sum, w) => sum + w.amountUSD, 0);
  const realMonthPayout = approvedWithdrawals
    .filter((w) => (w.updatedAt || w.createdAt) >= startOfMonth)
    .reduce((sum, w) => sum + w.amountUSD, 0);
  const realYearPayout = approvedWithdrawals
    .filter((w) => (w.updatedAt || w.createdAt) >= startOfYear)
    .reduce((sum, w) => sum + w.amountUSD, 0);

  // Super Admin 100% Original Genuine Deposit Breakdown (No artificial floor)
  const depositStats = {
    total: realTotalDeposit,
    today: realTodayDeposit,
    thisWeek: realWeekDeposit,
    thisMonth: realMonthDeposit,
    thisYear: realYearDeposit,
  };

  // Super Admin 100% Original Genuine Payout Breakdown (Approved Withdrawals)
  const payoutStats = {
    total: realTotalPayout,
    today: realTodayPayout,
    thisWeek: realWeekPayout,
    thisMonth: realMonthPayout,
    thisYear: realYearPayout,
    count: approvedWithdrawals.length,
  };

  // Platform Net Profit Calculations across settled REAL bets (100% Genuine Original Ledger):
  let totalHouseProfit = 0;
  let todayHouseProfit = 0;
  let weekHouseProfit = 0;
  let monthHouseProfit = 0;
  let yearHouseProfit = 0;

  (allBets || []).forEach((b) => {
    const betTime = b.timestamp || 0;
    if (b.status === 'WON') {
      const profitPaid = (b.payout && b.payout > b.amount) ? (b.payout - b.amount) : Number((b.amount * 0.85).toFixed(2));
      totalHouseProfit -= profitPaid;
      if (betTime >= startOfToday) todayHouseProfit -= profitPaid;
      if (betTime >= startOfWeek) weekHouseProfit -= profitPaid;
      if (betTime >= startOfMonth) monthHouseProfit -= profitPaid;
      if (betTime >= startOfYear) yearHouseProfit -= profitPaid;
    } else if (b.status === 'LOST') {
      totalHouseProfit += b.amount;
      if (betTime >= startOfToday) todayHouseProfit += b.amount;
      if (betTime >= startOfWeek) weekHouseProfit += b.amount;
      if (betTime >= startOfMonth) monthHouseProfit += b.amount;
      if (betTime >= startOfYear) yearHouseProfit += b.amount;
    }
  });

  // Net Cash Balance Flow (Approved Deposits - Approved Withdrawals)
  const netCashMargin = realTotalDeposit - realTotalPayout;

  // Super Admin 100% Original Genuine Platform Profit Breakdown
  const profitStats = {
    total: totalHouseProfit,
    today: todayHouseProfit,
    thisWeek: weekHouseProfit,
    thisMonth: monthHouseProfit,
    thisYear: yearHouseProfit,
    netCashMargin,
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(editableSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSaveBonusOffers = async (e: React.FormEvent) => {
    e.preventDefault();
    const wasFestivalOn = Boolean(settings.bonusConfig?.festivalBonusEnabled);
    const isNowFestivalOn = Boolean(editableSettings.bonusConfig?.festivalBonusEnabled);
    await onUpdateSettings(editableSettings);
    if (!wasFestivalOn && isNowFestivalOn && onPublishNotice) {
      const cfg = { ...DEFAULT_BONUS_CONFIG, ...(editableSettings.bonusConfig || {}) };
      const titleText = cfg.festivalBonusTitle?.trim() || 'Special Festival Bonus Offer';
      const descText = cfg.festivalBonusDescription?.trim() || 'Celebrate this special occasion with an exclusive bonus reward!';
      const amtText = Number(cfg.festivalBonusAmountUSD || 0).toFixed(2);
      await onPublishNotice(
        `🎉 ${titleText} (+$${amtText} USD)`,
        `${descText}\n\nOffer Amount: +$${amtText} USD • Open the Reward Center to claim this special occasion bonus!`,
        'FESTIVAL OFFER',
        'FESTIVAL_BONUS'
      );
      setFestivalNoticeSent(true);
    }
    setBonusesSaved(true);
    setTimeout(() => {
      setBonusesSaved(false);
      setFestivalNoticeSent(false);
    }, 2500);
  };

  const handleResetDefaultBonuses = () => {
    setEditableSettings((prev) => ({
      ...prev,
      bonusConfig: { ...DEFAULT_BONUS_CONFIG },
    }));
  };

  const handleSaveAndBroadcastFestival = async () => {
    const cfg = {
      ...DEFAULT_BONUS_CONFIG,
      ...(editableSettings.bonusConfig || {}),
      festivalBonusEnabled: true,
    };
    const nextSettings: AdminSettings = {
      ...editableSettings,
      bonusConfig: cfg,
    };
    setEditableSettings(nextSettings);
    await onUpdateSettings(nextSettings);
    if (onPublishNotice) {
      const titleText = cfg.festivalBonusTitle?.trim() || 'Special Festival Bonus Offer';
      const descText = cfg.festivalBonusDescription?.trim() || 'Celebrate this special occasion with an exclusive bonus reward!';
      const amtText = Number(cfg.festivalBonusAmountUSD || 0).toFixed(2);
      await onPublishNotice(
        `🎉 ${titleText} (+$${amtText} USD)`,
        `${descText}\n\nOffer Amount: +$${amtText} USD • Open the Reward Center to claim this special occasion bonus!`,
        'FESTIVAL OFFER',
        'FESTIVAL_BONUS'
      );
    }
    setBonusesSaved(true);
    setFestivalNoticeSent(true);
    setTimeout(() => {
      setBonusesSaved(false);
      setFestivalNoticeSent(false);
    }, 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Top Admin Navigation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Super Admin Management Console</h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                SUPER ADMIN CONFIDENTIAL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Financial overview, deposit reports, platform profit analytics, and user approvals in USD ($)
            </p>
          </div>
        </div>

        <button
          onClick={onCloseAdmin}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition cursor-pointer"
        >
          Close Admin Console
        </button>
      </div>

      {/* SECTION 1: SUPER ADMIN DEPOSIT ANALYTICS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              Super Admin Deposit Analytics (USD)
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Real-time Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Total Deposit */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Deposit</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-300 font-mono">
              ${depositStats.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">All-time approved</span>
          </div>

          {/* Today Deposit */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition">
            <div className="flex items-center justify-between text-teal-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Today Deposit</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-teal-300 font-mono">
              ${depositStats.today.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Today 00:00 - now</span>
          </div>

          {/* This Week Deposit */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition">
            <div className="flex items-center justify-between text-cyan-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Week Deposit</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-cyan-300 font-mono">
              ${depositStats.thisWeek.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Current week</span>
          </div>

          {/* This Month Deposit */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition">
            <div className="flex items-center justify-between text-blue-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Month Deposit</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-blue-300 font-mono">
              ${depositStats.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Current calendar month</span>
          </div>

          {/* This Year Deposit */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-indigo-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Year Deposit</span>
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-indigo-300 font-mono">
              ${depositStats.thisYear.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Annual {now.getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: SUPER ADMIN PAYOUT ANALYTICS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              Super Admin Payout Analytics (USD)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              {payoutStats.count} Paid Withdrawals
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              100% Genuine Ledger
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Total Payout */}
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-rose-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Payout</span>
              <ArrowUpCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-300 font-mono">
              ${payoutStats.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">All-time approved payouts</span>
          </div>

          {/* Today Payout */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition">
            <div className="flex items-center justify-between text-pink-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Today Payout</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-pink-300 font-mono">
              ${payoutStats.today.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Today 00:00 - now</span>
          </div>

          {/* This Week Payout */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition">
            <div className="flex items-center justify-between text-orange-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Week Payout</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-orange-300 font-mono">
              ${payoutStats.thisWeek.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Current week</span>
          </div>

          {/* This Month Payout */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Month Payout</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
              ${payoutStats.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Current calendar month</span>
          </div>

          {/* This Year Payout */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-purple-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Year Payout</span>
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-300 font-mono">
              ${payoutStats.thisYear.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Annual {now.getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: SUPER ADMIN PLATFORM PROFIT ANALYTICS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              Super Admin Platform Profit Analytics (USD)
            </h3>
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            House Edge (15% + Margin)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Total Platform Profit */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Profit</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
              ${profitStats.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-amber-400/80 mt-1 block">All-time net profit</span>
          </div>

          {/* Today Platform Profit */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition">
            <div className="flex items-center justify-between text-yellow-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Today Profit</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-yellow-300 font-mono">
              ${profitStats.today.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Today 00:00 - now</span>
          </div>

          {/* This Week Platform Profit */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition">
            <div className="flex items-center justify-between text-orange-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Week Profit</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-orange-300 font-mono">
              ${profitStats.thisWeek.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Current week</span>
          </div>

          {/* This Month Platform Profit */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Month Profit</span>
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-300 font-mono">
              ${profitStats.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Current calendar month</span>
          </div>

          {/* This Year Platform Profit */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-sm transition col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-purple-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Year Profit</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-300 font-mono">
              ${profitStats.thisYear.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Annual {now.getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: OPERATIONAL QUEUE STATUS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Deposit Requests */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Deposits</span>
            <ArrowDownCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {pendingDeposits.length}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Awaiting verification
          </span>
        </div>

        {/* Pending Withdrawal Requests */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Withdrawals</span>
            <ArrowUpCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono">
            {pendingWithdrawals.length}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Min $10.00 payouts
          </span>
        </div>

        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Players</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            {users.length}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Registered accounts
          </span>
        </div>

        {/* Platform Fee Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">House Margin</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            {settings.platformFeePercent}% + Edge
          </div>
          <span className="text-[11px] text-emerald-400/80 font-medium mt-1 block">
            Auto-calculated per round
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('DEPOSITS')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'DEPOSITS'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>Deposit Requests</span>
          {pendingDeposits.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
              {pendingDeposits.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('WITHDRAWALS')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'WITHDRAWALS'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          <span>Withdrawal Requests</span>
          {pendingWithdrawals.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('BONUSES')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'BONUSES'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Bonus Offers</span>
          {bonusCfg.bonusesEnabled ? (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
              LIVE
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-bold">
              OFF
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('NOTICES')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'NOTICES'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Quick Notice</span>
          {editableSettings.quickNotice?.enabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'SETTINGS'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Binance & Payout Config</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Wallets</span>
        </button>
      </div>

      {/* Tab 1: DEPOSITS VERIFICATION */}
      {activeTab === 'DEPOSITS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Binance Deposit Verification (USD)</h3>
              <p className="text-xs text-slate-400">
                Click "Approve & Credit Balance" to immediately credit USD funds into player wallets upon confirming Binance transfer.
              </p>
            </div>
          </div>

          {deposits.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No deposit requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Player / Request ID</th>
                    <th className="py-3 px-3">Amount ($ USD)</th>
                    <th className="py-3 px-3">Payment Slip / Proof</th>
                    <th className="py-3 px-3">Network & Sender</th>
                    <th className="py-3 px-3">Transaction ID (TxID)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">{dep.userName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{dep.id}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-sm">
                        ${dep.amountUSD.toFixed(2)} USD
                      </td>
                      <td className="py-3 px-3">
                        {dep.screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() => setViewingDepositSlip(dep)}
                            className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-amber-300 hover:text-white transition cursor-pointer group"
                            title="Click to inspect receipt screenshot"
                          >
                            <img
                              src={dep.screenshotUrl}
                              alt="Receipt"
                              className="w-8 h-8 rounded object-cover border border-slate-600 shrink-0"
                            />
                            <span className="text-[10px] font-bold flex items-center gap-1 pr-1">
                              <Eye className="w-3 h-3 text-amber-400 group-hover:scale-110 transition" />
                              Inspect Slip
                            </span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No slip attached</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold block w-fit ${
                            dep.depositType === 'SUPPORT_AGENT'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {dep.depositType === 'SUPPORT_AGENT' ? '👨‍💼 Support Agent' : dep.network}
                          </span>
                          {dep.supportMethodName && (
                            <span className="text-[10px] font-bold text-amber-300 block">
                              {dep.supportMethodName}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          Sender: {dep.senderBinanceId}
                        </span>
                        {dep.userNote && (
                          <span className="text-[10px] text-slate-300 italic block mt-0.5 bg-slate-950/80 px-1.5 py-0.5 rounded">
                            "{dep.userNote}"
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-300 select-all">
                        {dep.binanceTxId}
                      </td>
                      <td className="py-3 px-3">
                        {dep.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {dep.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {dep.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {dep.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onApproveDeposit(dep.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Credit</span>
                            </button>
                            <button
                              onClick={() => onRejectDeposit(dep.id, 'Transaction not found on Binance')}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: WITHDRAWALS VERIFICATION */}
      {activeTab === 'WITHDRAWALS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Binance Withdrawal Processing (Min $10.00 USD)</h3>
              <p className="text-xs text-slate-400">
                Send USD/USDT to the player's Binance destination, then mark as Paid. Rejecting automatically refunds the player's balance.
              </p>
            </div>
          </div>

          {withdrawals.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No withdrawal requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Player / ID</th>
                    <th className="py-3 px-3">Amount ($ USD)</th>
                    <th className="py-3 px-3">Binance Destination</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {withdrawals.map((wth) => (
                    <tr key={wth.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">{wth.userName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{wth.id}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-300 text-sm">
                        ${wth.amountUSD.toFixed(2)} USD
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {wth.binanceType}
                        </span>
                        <span className="text-xs text-slate-200 font-mono block mt-1 select-all">
                          {wth.binanceTarget}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {wth.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {wth.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        )}
                        {wth.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Refunded
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {wth.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const hash = prompt('Binance transfer transaction reference / TxID:', 'PAY-OUT-OK');
                                onApproveWithdrawal(wth.id, hash || undefined);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Paid</span>
                            </button>
                            <button
                              onClick={() => onRejectWithdrawal(wth.id, 'Invalid Binance details provided')}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs transition cursor-pointer"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {wth.txHash || 'Paid'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: BONUS OFFERS MANAGEMENT */}
      {activeTab === 'BONUSES' && (
        <form onSubmit={handleSaveBonusOffers} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">All Bonus Offers & Promotions Control</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize every bonus amount, percentage promo, and milestone reward across the entire platform.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {bonusesSaved && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">
                  ✓ Bonus offers saved & live!
                </span>
              )}
              <button
                type="button"
                onClick={handleResetDefaultBonuses}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Master Switch & Global Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-black text-white block">Master Bonus Program</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Turn all platform bonuses on or off globally.
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateBonusField('bonusesEnabled', !bonusCfg.bonusesEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition shrink-0 ${
                  bonusCfg.bonusesEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Min 1st Deposit to Unlock Bonuses ($ USD):
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={bonusCfg.minDepositForBonusUSD}
                onChange={(e) => updateBonusField('minDepositForBonusUSD', Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-amber-300 font-mono font-bold focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Welcome Signup Bonus & Deposit Promo Bonus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Welcome / 1st Deposit Signup Bonus */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Welcome / 1st Deposit Bonus</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Credited automatically on user's 1st approved deposit</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateBonusField('welcomeBonusEnabled', !bonusCfg.welcomeBonusEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition shrink-0 ${
                    bonusCfg.welcomeBonusEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow" />
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Welcome Bonus Amount ($ USD):</label>
                <input
                  type="number"
                  min="0"
                  step="0.10"
                  value={bonusCfg.welcomeBonusUSD}
                  onChange={(e) => updateBonusField('welcomeBonusUSD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-emerald-300 font-mono font-bold focus:border-emerald-400 outline-none"
                />
              </div>
            </div>

            {/* Extra % Deposit Promo Bonus */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>Deposit Percentage Offer (%)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Extra % bonus on every approved deposit (optional promo)</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateBonusField('depositBonusEnabled', !bonusCfg.depositBonusEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition shrink-0 ${
                    bonusCfg.depositBonusEnabled ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow" />
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Extra Deposit Bonus Percentage (%):</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  step="1"
                  value={bonusCfg.depositBonusPercent}
                  onChange={(e) => updateBonusField('depositBonusPercent', Math.max(0, Math.min(200, Number(e.target.value))))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-amber-300 font-mono font-bold focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Weekly & Monthly Loyalty Bonuses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Bonus */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Weekly Free Bonus</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Claimable once every 7 days by deposited players</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateBonusField('weeklyBonusEnabled', !bonusCfg.weeklyBonusEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition shrink-0 ${
                    bonusCfg.weeklyBonusEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow" />
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Weekly Bonus Amount ($ USD):</label>
                <input
                  type="number"
                  min="0"
                  step="0.10"
                  value={bonusCfg.weeklyBonusUSD}
                  onChange={(e) => updateBonusField('weeklyBonusUSD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-amber-300 font-mono font-bold focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Monthly Bonus */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Monthly Loyalty Bonus</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Claimable once every 30 days by deposited players</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateBonusField('monthlyBonusEnabled', !bonusCfg.monthlyBonusEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition shrink-0 ${
                    bonusCfg.monthlyBonusEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow" />
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Monthly Bonus Amount ($ USD):</label>
                <input
                  type="number"
                  min="0"
                  step="0.10"
                  value={bonusCfg.monthlyBonusUSD}
                  onChange={(e) => updateBonusField('monthlyBonusUSD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-emerald-300 font-mono font-bold focus:border-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Referral & Milestone Cash Bonuses */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Referral Rewards & Milestone Cash Bonuses</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Set per-friend referral reward and extra cash milestones (5, 10, 20, 50, 100 invited friends)
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={bonusCfg.referralBonusEnabled}
                    onChange={(e) => updateBonusField('referralBonusEnabled', e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>Per-Friend Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={bonusCfg.referralMilestonesEnabled}
                    onChange={(e) => updateBonusField('referralMilestonesEnabled', e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <span>Milestones Active</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Per Friend ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.10"
                  value={bonusCfg.referralBonusUSD}
                  onChange={(e) => updateBonusField('referralBonusUSD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-amber-500/40 rounded-xl py-2 px-2.5 text-sm text-amber-300 font-mono font-bold focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">5 Friends ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.10"
                  value={bonusCfg.referralMilestone5USD}
                  onChange={(e) => updateBonusField('referralMilestone5USD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-sm text-white font-mono font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">10 Friends ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.10"
                  value={bonusCfg.referralMilestone10USD}
                  onChange={(e) => updateBonusField('referralMilestone10USD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-sm text-white font-mono font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">20 Friends ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={bonusCfg.referralMilestone20USD}
                  onChange={(e) => updateBonusField('referralMilestone20USD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-sm text-white font-mono font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">50 Friends ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={bonusCfg.referralMilestone50USD}
                  onChange={(e) => updateBonusField('referralMilestone50USD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-sm text-white font-mono font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">100 Friends ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1.00"
                  value={bonusCfg.referralMilestone100USD}
                  onChange={(e) => updateBonusField('referralMilestone100USD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-sm text-white font-mono font-bold focus:border-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Special Festival / Occasion Bonus (Eid, Puja, Holidays) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-fuchsia-950/35 via-amber-950/20 to-slate-950 border border-fuchsia-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-fuchsia-500/20">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <h4 className="text-sm font-black text-fuchsia-200">
                    Special Festival & Occasion Bonus (Eid, Puja & Holidays)
                  </h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    bonusCfg.festivalBonusEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {bonusCfg.festivalBonusEnabled ? 'LIVE OFFER' : 'OFFLINE'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Activate special festival rewards for Eid, Durga Puja, New Year, or national holidays. Players see your occasion notice inside Notifications & can claim once per event.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateBonusField('festivalBonusEnabled', !bonusCfg.festivalBonusEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition shrink-0 ${
                  bonusCfg.festivalBonusEnabled ? 'bg-fuchsia-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow" />
              </button>
            </div>

            {/* Quick Occasion Preset Chips */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Quick Occasion Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    label: 'Eid-ul-Fitr',
                    title: 'Eid-ul-Fitr Special Bonus Offer',
                    desc: 'Eid Mubarak! Celebrating Eid-ul-Fitr with a special festive cash gift from Shapla Poribar. Claim your Eid Salami bonus now!',
                  },
                  {
                    label: 'Eid-ul-Adha',
                    title: 'Eid-ul-Adha Special Bonus Offer',
                    desc: 'Eid-ul-Adha Mubarak! Enjoy this special occasion bonus reward from Shapla Poribar in celebration of Eid.',
                  },
                  {
                    label: 'Durga Puja',
                    title: 'Durga Puja Festive Bonus Offer',
                    desc: 'Sharadiya Shubhechha! Celebrating Durga Puja with a special festive bonus gift for all Shapla Poribar members.',
                  },
                  {
                    label: 'Pohela Boishakh',
                    title: 'Pohela Boishakh New Year Offer',
                    desc: 'Shubho Noboborsho! Welcome the Bengali New Year with a special celebration bonus from Shapla Poribar.',
                  },
                  {
                    label: 'Holiday Special',
                    title: 'Special Celebration Bonus Offer',
                    desc: 'Celebrating a special occasion today! Claim this limited-time festival bonus offer credited straight to your wallet.',
                  },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setEditableSettings((prev) => ({
                        ...prev,
                        bonusConfig: {
                          ...DEFAULT_BONUS_CONFIG,
                          ...(prev.bonusConfig || {}),
                          festivalBonusTitle: preset.title,
                          festivalBonusDescription: preset.desc,
                        },
                      }));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-fuchsia-500/20 border border-slate-700 hover:border-fuchsia-400/50 text-[11px] font-bold text-slate-300 hover:text-fuchsia-200 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Festival / Occasion Offer Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eid-ul-Fitr Special Bonus or Durga Puja Offer"
                  value={bonusCfg.festivalBonusTitle || ''}
                  onChange={(e) => updateBonusField('festivalBonusTitle', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-fuchsia-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Special Bonus Amount ($ USD):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={bonusCfg.festivalBonusAmountUSD}
                  onChange={(e) => updateBonusField('festivalBonusAmountUSD', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-fuchsia-300 font-mono font-bold focus:border-fuchsia-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Occasion Notice / Description (Shown in Player Notifications & Reward Center):
              </label>
              <textarea
                rows={3}
                placeholder="Write why this special offer is being given (e.g. Celebrating Eid-ul-Fitr / Durga Puja with an exclusive bonus for all players!)"
                value={bonusCfg.festivalBonusDescription || ''}
                onChange={(e) => updateBonusField('festivalBonusDescription', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-fuchsia-400 outline-none leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => updateBonusField('festivalBonusId', `fest_${Date.now()}`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                  title="Generate a new campaign ID so players who claimed a previous festival offer can claim this new festival offer"
                >
                  <RotateCcw className="w-3 h-3 text-fuchsia-400" />
                  <span>Start New Festival Round (Allow Re-claim)</span>
                </button>
                <span className="text-[10px] font-mono text-slate-500">
                  ID: {bonusCfg.festivalBonusId || 'fest_special_1'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {festivalNoticeSent && (
                  <span className="text-[11px] text-emerald-400 font-bold">
                    ✓ Notice pushed to Notifications!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveAndBroadcastFestival}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 text-white font-black text-xs shadow flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Activate & Push Festival Notification</span>
                </button>
              </div>
            </div>
          </div>

          {/* Optional Promo Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Optional Promotional Bonus Banner Note (Shown to Players):
            </label>
            <input
              type="text"
              placeholder="e.g. Weekend Mega Bonus Event: Claim extra rewards on every deposit!"
              value={bonusCfg.customPromoText || ''}
              onChange={(e) => updateBonusField('customPromoText', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-white focus:border-amber-400 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save All Bonus Offers</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: QUICK NOTICES & ANNOUNCEMENT BOARD */}
      {activeTab === 'NOTICES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Quick Notification & Announcement Board</h3>
              </div>
              <p className="text-xs text-slate-400">
                Publish announcements and notice alerts instantly to all connected users and notification modals.
              </p>
            </div>
            {noticePublished && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
                ✓ Notice published successfully!
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Banner Toggle Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">
                  Show Notice Banner on Website
                </span>
                <span className="text-[11px] text-slate-400 block">
                  When enabled, an animated announcement bar is shown below the navigation header.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditableSettings((prev) => ({
                    ...prev,
                    quickNotice: {
                      ...(prev.quickNotice || { title: '', message: '', badge: 'NOTICE' }),
                      enabled: !prev.quickNotice?.enabled,
                      updatedAt: Date.now(),
                    },
                  }));
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                  editableSettings.quickNotice?.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow" />
              </button>
            </div>

            {/* Badge Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Notice Badge / Category:
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {['NOTICE', 'BONUS OFFER', 'URGENT', 'MAINTENANCE', 'DEPOSIT UPDATE'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setEditableSettings((prev) => ({
                        ...prev,
                        quickNotice: {
                          ...(prev.quickNotice || { title: '', message: '', enabled: true }),
                          badge: b,
                          updatedAt: Date.now(),
                        },
                      }));
                    }}
                    className={`py-1.5 px-3 rounded-xl font-bold border transition cursor-pointer ${
                      (editableSettings.quickNotice?.badge || 'NOTICE') === b
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Notice Title:
              </label>
              <input
                type="text"
                placeholder="e.g. Important Deposit Instructions or Special Weekend Bonus!"
                value={editableSettings.quickNotice?.title || ''}
                onChange={(e) => {
                  setEditableSettings((prev) => ({
                    ...prev,
                    quickNotice: {
                      ...(prev.quickNotice || { enabled: true, badge: 'NOTICE' }),
                      title: e.target.value,
                      updatedAt: Date.now(),
                    },
                  }));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* Message Details */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Notice Message:
              </label>
              <textarea
                rows={4}
                placeholder="Enter detailed notice message here..."
                value={editableSettings.quickNotice?.message || ''}
                onChange={(e) => {
                  setEditableSettings((prev) => ({
                    ...prev,
                    quickNotice: {
                      ...(prev.quickNotice || { enabled: true, badge: 'NOTICE', title: '' }),
                      message: e.target.value,
                      updatedAt: Date.now(),
                    },
                  }));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-400 outline-none leading-relaxed"
              />
            </div>

            {/* Live Preview Card */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                User Live Preview:
              </span>
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                    {editableSettings.quickNotice?.badge || 'NOTICE'}
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    {editableSettings.quickNotice?.title || 'Notice Title'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pt-1">
                  {editableSettings.quickNotice?.message || 'Your notice message will appear here...'}
                </p>
              </div>
            </div>

            {/* Publish Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  onUpdateSettings(editableSettings);
                  if (onPublishNotice && editableSettings.quickNotice) {
                    await onPublishNotice(
                      editableSettings.quickNotice.title || 'Official Notice',
                      editableSettings.quickNotice.message || '',
                      editableSettings.quickNotice.badge || 'NOTICE'
                    );
                  }
                  setNoticePublished(true);
                  setTimeout(() => setNoticePublished(false), 3000);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transition cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                <span>Publish Notice to Website</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SETTINGS & CONFIG */}
      {activeTab === 'SETTINGS' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white">Binance Payment & Round Settings</h3>
              <p className="text-xs text-slate-400">
                Official Binance details and game limits in USD ($)
              </p>
            </div>
            {settingsSaved && (
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/20 px-3 py-1 rounded-lg">
                ✓ Settings saved successfully!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Binance Pay ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Binance Pay ID:
              </label>
              <input
                type="text"
                value={editableSettings.binancePayId}
                onChange={(e) => setEditableSettings({ ...editableSettings, binancePayId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
              />
            </div>

            {/* Binance Pay Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Binance Pay Email:
              </label>
              <input
                type="text"
                value={editableSettings.binancePayEmail}
                onChange={(e) => setEditableSettings({ ...editableSettings, binancePayEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
              />
            </div>

            {/* USDT BEP20 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin USDT (BEP-20) Address:
              </label>
              <input
                type="text"
                value={editableSettings.usdtBep20Address}
                onChange={(e) => setEditableSettings({ ...editableSettings, usdtBep20Address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono focus:border-amber-400 outline-none"
              />
            </div>

            {/* USDT TRC20 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin USDT (TRC-20) Address:
              </label>
              <input
                type="text"
                value={editableSettings.usdtTrc20Address}
                onChange={(e) => setEditableSettings({ ...editableSettings, usdtTrc20Address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono focus:border-amber-400 outline-none"
              />
            </div>

            {/* Minimum Bet */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Minimum Bet ($ USD):
              </label>
              <input
                type="number"
                step="0.01"
                value={editableSettings.minBetUSD}
                onChange={(e) => setEditableSettings({ ...editableSettings, minBetUSD: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
              />
            </div>

            {/* Min Withdrawal */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Minimum Withdrawal ($ USD):
              </label>
              <input
                type="number"
                step="1"
                value={editableSettings.minWithdrawalUSD}
                onChange={(e) => setEditableSettings({ ...editableSettings, minWithdrawalUSD: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
              />
            </div>

            {/* Round Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Round Duration (Seconds):
              </label>
              <input
                type="number"
                value={editableSettings.roundDurationSeconds}
                onChange={(e) => setEditableSettings({ ...editableSettings, roundDurationSeconds: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Default: 30 seconds per round
              </span>
            </div>

          </div>

          {/* Support Agent Payment Accounts Section */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                  Support Payment Accounts & Deposit Methods:
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newMethod = {
                    id: `sp_custom_${Date.now()}`,
                    name: 'New Binance / USDT Method',
                    accountNumber: '1156528658',
                    accountType: 'Binance Pay ID',
                    instructions: 'Transfer funds to this account and submit your TxID and screenshot.',
                    isActive: true,
                  };
                  setEditableSettings((prev) => ({
                    ...prev,
                    supportPaymentMethods: [...(prev.supportPaymentMethods || []), newMethod],
                  }));
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Account</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Users will see these active Binance and USDT addresses and instructions when opening Live Support Deposit.
            </p>

            <div className="space-y-3">
              {(editableSettings.supportPaymentMethods || []).map((method, idx) => (
                <div
                  key={method.id || idx}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={method.name}
                      onChange={(e) => {
                        const updated = [...(editableSettings.supportPaymentMethods || [])];
                        updated[idx].name = e.target.value;
                        setEditableSettings({ ...editableSettings, supportPaymentMethods: updated });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-bold text-white text-xs flex-1 focus:border-emerald-400 outline-none"
                    />

                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={method.isActive}
                        onChange={(e) => {
                          const updated = [...(editableSettings.supportPaymentMethods || [])];
                          updated[idx].isActive = e.target.checked;
                          setEditableSettings({ ...editableSettings, supportPaymentMethods: updated });
                        }}
                        className="rounded accent-emerald-500"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = (editableSettings.supportPaymentMethods || []).filter((_, i) => i !== idx);
                        setEditableSettings({ ...editableSettings, supportPaymentMethods: updated });
                      }}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-slate-900 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Account Number / Pay ID:</span>
                      <input
                        type="text"
                        value={method.accountNumber}
                        onChange={(e) => {
                          const updated = [...(editableSettings.supportPaymentMethods || [])];
                          updated[idx].accountNumber = e.target.value;
                          setEditableSettings({ ...editableSettings, supportPaymentMethods: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono text-amber-300 text-xs focus:border-emerald-400 outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Type:</span>
                      <input
                        type="text"
                        value={method.accountType || ''}
                        placeholder="Binance Pay / Crypto TRC-20 / BEP-20"
                        onChange={(e) => {
                          const updated = [...(editableSettings.supportPaymentMethods || [])];
                          updated[idx].accountType = e.target.value;
                          setEditableSettings({ ...editableSettings, supportPaymentMethods: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs focus:border-emerald-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Payment Instructions:</span>
                    <input
                      type="text"
                      value={method.instructions}
                      onChange={(e) => {
                        const updated = [...(editableSettings.supportPaymentMethods || [])];
                        updated[idx].instructions = e.target.value;
                        setEditableSettings({ ...editableSettings, supportPaymentMethods: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs focus:border-emerald-400 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Support Agent Helpline Links */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Admin WhatsApp Helpline:
                </label>
                <input
                  type="text"
                  placeholder="+8801899999999"
                  value={editableSettings.supportContactWhatsapp || ''}
                  onChange={(e) => setEditableSettings({ ...editableSettings, supportContactWhatsapp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Admin Telegram Username / Link:
                </label>
                <input
                  type="text"
                  placeholder="ShaplaPoribarSupport"
                  value={editableSettings.supportContactTelegram || ''}
                  onChange={(e) => setEditableSettings({ ...editableSettings, supportContactTelegram: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:border-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Secret Algorithm Mode Override */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase">
                Underlying Outcome Engine:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditableSettings({ ...editableSettings, forcedOutcome: 'AUTO' })}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  editableSettings.forcedOutcome === 'AUTO'
                    ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-amber-300">Auto Mode (Lesser Pool Wins)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  The side with the lesser pool amount always wins, ensuring house profits.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditableSettings({ ...editableSettings, forcedOutcome: 'FORCE_SHAPLA' })}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  editableSettings.forcedOutcome === 'FORCE_SHAPLA'
                    ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-emerald-300">Force Shapla Win</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Overrides next outcome to Shapla for testing.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditableSettings({ ...editableSettings, forcedOutcome: 'FORCE_PORIBAR' })}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  editableSettings.forcedOutcome === 'FORCE_PORIBAR'
                    ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-amber-300">Force Poribar Win</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Overrides next outcome to Poribar for testing.
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 6: USERS & BALANCE MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white">Player Wallets, Balances & Custom Bonuses ($ USD)</h3>
              <p className="text-xs text-slate-400">
                Adjust any player balance, inspect locked bonus wagering, or grant an instant special bonus
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {bonusGrantedBanner && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              ✓ {bonusGrantedBanner}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Player / Phone</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Balance ($ USD)</th>
                  <th className="py-3 px-3">Locked Bonus</th>
                  <th className="py-3 px-3">Binance ID</th>
                  <th className="py-3 px-3 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users
                  .filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.id.includes(userSearch) || u.phone.includes(userSearch))
                  .map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">{usr.name}</span>
                        <span className="text-[10px] text-amber-300 font-mono block">📞 {usr.phone}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{usr.id}</span>
                      </td>
                      <td className="py-3 px-3">
                        {usr.isSuspended ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] inline-flex items-center gap-1 border border-rose-500/30">
                            <UserX className="w-3 h-3 text-rose-400" />
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] inline-flex items-center gap-1 border border-emerald-500/30">
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          usr.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-300 text-sm">
                        ${usr.walletBalance.toFixed(2)} USD
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-300 text-xs">
                        ${(usr.lockedBonusBalance || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400 text-xs">
                        {usr.binancePayId || 'Not set'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {editingUserId === usr.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={adjustAmount}
                              onChange={(e) => setAdjustAmount(Number(e.target.value))}
                              className="w-24 bg-slate-950 border border-amber-400 rounded-lg px-2 py-1 text-xs text-white font-mono"
                            />
                            <button
                              onClick={() => {
                                onAdjustUserBalance(usr.id, Number(adjustAmount.toFixed(2)));
                                setEditingUserId(null);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : grantBonusUserId === usr.id ? (
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <input
                              type="number"
                              min="0.10"
                              step="0.10"
                              value={grantBonusAmount}
                              onChange={(e) => setGrantBonusAmount(Number(e.target.value))}
                              placeholder="$ Bonus"
                              className="w-20 bg-slate-950 border border-emerald-400 rounded-lg px-2 py-1 text-xs text-emerald-300 font-mono"
                            />
                            <input
                              type="text"
                              value={grantBonusNote}
                              onChange={(e) => setGrantBonusNote(e.target.value)}
                              placeholder="Note (optional)"
                              className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <button
                              onClick={async () => {
                                if (grantBonusAmount > 0 && onGrantUserBonus) {
                                  await onGrantUserBonus(usr.id, Number(grantBonusAmount.toFixed(2)), grantBonusNote.trim() || undefined);
                                  setBonusGrantedBanner(`Credited $${grantBonusAmount.toFixed(2)} bonus to ${usr.name}!`);
                                  setTimeout(() => setBonusGrantedBanner(null), 3500);
                                }
                                setGrantBonusUserId(null);
                                setGrantBonusNote('');
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Send
                            </button>
                            <button
                              onClick={() => setGrantBonusUserId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {usr.role !== 'ADMIN' && (
                              <button
                                onClick={() => onToggleSuspendUser?.(usr.id, !usr.isSuspended)}
                                className={`px-2 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                                  usr.isSuspended
                                    ? 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
                                    : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/30'
                                }`}
                                title={usr.isSuspended ? 'Click to restore user access' : 'Click to suspend user'}
                              >
                                {usr.isSuspended ? (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Activate</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3 h-3" />
                                    <span>Suspend</span>
                                  </>
                                )}
                              </button>
                            )}
                            {onGrantUserBonus && (
                              <button
                                onClick={() => {
                                  setEditingUserId(null);
                                  setGrantBonusUserId(usr.id);
                                  setGrantBonusAmount(1.00);
                                  setGrantBonusNote('');
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold cursor-pointer flex items-center gap-1"
                              >
                                <Gift className="w-3 h-3" />
                                <span>+ Bonus</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setGrantBonusUserId(null);
                                setEditingUserId(usr.id);
                                setAdjustAmount(usr.walletBalance);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer"
                            >
                              Edit Balance
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Screenshot Verification Lightbox Modal */}
      {viewingDepositSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Deposit Slip Verification</h3>
                  <p className="text-xs text-slate-400">Cross-check transaction details with the uploaded screenshot</p>
                </div>
              </div>

              <button
                onClick={() => setViewingDepositSlip(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Image & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slip Image View */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 flex items-center justify-center overflow-hidden min-h-[220px]">
                {viewingDepositSlip.screenshotUrl ? (
                  <img
                    src={viewingDepositSlip.screenshotUrl}
                    alt="Payment Slip Proof"
                    className="max-h-72 w-full object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <span className="text-xs text-slate-500">No image available</span>
                )}
              </div>

              {/* Data Summary */}
              <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Player Name:</span>
                  <span className="text-white font-bold text-sm">{viewingDepositSlip.userName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-y border-slate-800/80">
                  <span className="text-slate-400">Claimed Amount:</span>
                  <span className="text-emerald-400 font-mono font-black text-base">
                    ${viewingDepositSlip.amountUSD.toFixed(2)} USD
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Binance TxID:</span>
                  <span className="text-amber-300 font-mono font-bold select-all break-all block bg-slate-900 p-1.5 rounded border border-slate-800">
                    {viewingDepositSlip.binanceTxId}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sender Account / Pay ID:</span>
                  <span className="text-slate-200 font-mono">{viewingDepositSlip.senderBinanceId}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Network:</span>
                  <span className="text-slate-200 font-bold">{viewingDepositSlip.network}</span>
                </div>

                <div className="pt-2">
                  <span className="text-slate-500 text-[10px]">
                    Submitted: {new Date(viewingDepositSlip.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              {viewingDepositSlip.status === 'PENDING' ? (
                <>
                  <button
                    onClick={() => {
                      onRejectDeposit(viewingDepositSlip.id, 'Slip does not match Binance transaction');
                      setViewingDepositSlip(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs transition cursor-pointer"
                  >
                    Reject Deposit
                  </button>
                  <button
                    onClick={() => {
                      onApproveDeposit(viewingDepositSlip.id);
                      setViewingDepositSlip(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Credit ${viewingDepositSlip.amountUSD.toFixed(2)} USD</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setViewingDepositSlip(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
