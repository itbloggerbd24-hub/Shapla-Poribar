import React, { useState, useEffect } from 'react';
import { AdminSettings, UserProfile } from '../types/game';
import { DEFAULT_BONUS_CONFIG } from '../utils/storage';
import { 
  X, 
  Gift, 
  Sparkles, 
  Clock, 
  Calendar, 
  Flame, 
  Lock, 
  ArrowRight, 
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  adminSettings?: AdminSettings;
  onClaimWeekly: () => void;
  onClaimMonthly: () => void;
  onClaimDaily?: () => void;
  hasDeposited?: boolean;
  onOpenDeposit?: () => void;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  user,
  adminSettings,
  onClaimWeekly,
  onClaimMonthly,
  hasDeposited,
  onOpenDeposit,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const bonusCfg = {
    ...DEFAULT_BONUS_CONFIG,
    ...(adminSettings?.bonusConfig || {}),
  };

  const weeklyAmt = Number(bonusCfg.weeklyBonusUSD ?? 0.50);
  const monthlyAmt = Number(bonusCfg.monthlyBonusUSD ?? 1.00);
  const welcomeAmt = Number(bonusCfg.welcomeBonusUSD ?? 1.00);
  const minDepAmt = Number(bonusCfg.minDepositForBonusUSD ?? adminSettings?.minDepositUSD ?? 5.00);

  const isWeeklyActive = bonusCfg.bonusesEnabled && bonusCfg.weeklyBonusEnabled && weeklyAmt > 0;
  const isMonthlyActive = bonusCfg.bonusesEnabled && bonusCfg.monthlyBonusEnabled && monthlyAmt > 0;

  // All bonuses work only after 1st deposit is approved
  const isDepositUnlocked = Boolean(hasDeposited ?? user.firstDepositDone);

  const lastWeekly = user.lastWeeklyClaim || 0;
  const lastMonthly = user.lastMonthlyClaim || 0;

  const weeklyEligible = isWeeklyActive && isDepositUnlocked && (now - lastWeekly) >= ONE_WEEK_MS;
  const monthlyEligible = isMonthlyActive && isDepositUnlocked && (now - lastMonthly) >= ONE_MONTH_MS;

  const weeklyRemainingMs = Math.max(0, ONE_WEEK_MS - (now - lastWeekly));
  const monthlyRemainingMs = Math.max(0, ONE_MONTH_MS - (now - lastMonthly));

  const formatRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClaimWeeklyClick = () => {
    if (!isDepositUnlocked) {
      onClose();
      onOpenDeposit?.();
      return;
    }
    if (!weeklyEligible) return;
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });
    soundManager.playWin();
    onClaimWeekly();
  };

  const handleClaimMonthlyClick = () => {
    if (!isDepositUnlocked) {
      onClose();
      onOpenDeposit?.();
      return;
    }
    if (!monthlyEligible) return;
    confetti({
      particleCount: 140,
      spread: 95,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
    });
    soundManager.playWin();
    onClaimMonthly();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 py-2 sm:py-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-100 space-y-5">
        
        {/* Back Symbol at the very corner */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700 hover:border-amber-500/50 shadow-md group"
          title="Back to Arena"
          aria-label="Back to Arena"
        >
          <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Page Header in a single column with text under the symbol */}
        <div className="pb-4 sm:pb-6 border-b border-slate-800 pr-14 flex flex-col gap-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white">Free Reward Center</h1>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Claim your free recurring Weekly & Monthly Bonuses</p>
          </div>
        </div>

        {/* Optional Admin Promo Banner */}
        {bonusCfg.customPromoText && bonusCfg.customPromoText.trim() && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{bonusCfg.customPromoText}</span>
          </div>
        )}

        {/* 1st Deposit Locked Warning Banner */}
        {!isDepositUnlocked && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-slate-950 border border-amber-500/40 flex items-start gap-3 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>1st Deposit Required to Unlock Bonuses</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                All bonuses (Weekly ${weeklyAmt.toFixed(2)} & Monthly ${monthlyAmt.toFixed(2)}
                {bonusCfg.welcomeBonusEnabled && welcomeAmt > 0 ? ` + $${welcomeAmt.toFixed(2)} Signup Bonus` : ''}) become active immediately after your 1st approved deposit (min ${minDepAmt.toFixed(2)} USD).
              </p>
              {onOpenDeposit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="mt-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-[11px] inline-flex items-center gap-1.5 shadow-md cursor-pointer transition transform active:scale-95"
                >
                  <span>Deposit Now to Unlock All Bonuses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-4">
          
          {/* Card 1: Weekly Free Bonus */}
          <div className={`p-4 rounded-2xl border transition ${
            !isWeeklyActive || !isDepositUnlocked
              ? 'bg-slate-950/60 border-slate-800 opacity-90'
              : weeklyEligible
              ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">Weekly Bonus</h3>
                    {!isWeeklyActive ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] font-bold">
                        Paused by Admin
                      </span>
                    ) : !isDepositUnlocked && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[9px] font-bold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">Can be claimed once every 7 days</span>
                </div>
              </div>
              <div className="text-base font-black text-amber-300 font-mono">
                +${weeklyAmt.toFixed(2)} USD
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Weekly free wagering credits credited directly to your playable balance.
            </p>

            {!isWeeklyActive ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold text-center">
                Weekly bonus offer is currently paused by administration.
              </div>
            ) : !isDepositUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit?.();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-amber-500/30 text-amber-300 font-bold text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Make 1st Deposit to Unlock (${weeklyAmt.toFixed(2)})</span>
              </button>
            ) : weeklyEligible ? (
              <button
                type="button"
                onClick={handleClaimWeeklyClick}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Claim ${weeklyAmt.toFixed(2)} Weekly Free Bonus</span>
              </button>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center justify-between font-mono">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Next claim in:
                </span>
                <span className="font-bold text-amber-400">
                  {formatRemaining(weeklyRemainingMs)}
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Monthly Free Bonus */}
          <div className={`p-4 rounded-2xl border transition ${
            !isMonthlyActive || !isDepositUnlocked
              ? 'bg-slate-950/60 border-slate-800 opacity-90'
              : monthlyEligible
              ? 'bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/30'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">Monthly Loyalty Bonus</h3>
                    {!isMonthlyActive ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] font-bold">
                        Paused by Admin
                      </span>
                    ) : !isDepositUnlocked && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[9px] font-bold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">Can be claimed once every 30 days</span>
                </div>
              </div>
              <div className="text-base font-black text-emerald-400 font-mono">
                +${monthlyAmt.toFixed(2)} USD
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Monthly loyalty gift accessible to all active players.
            </p>

            {!isMonthlyActive ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold text-center">
                Monthly bonus offer is currently paused by administration.
              </div>
            ) : !isDepositUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit?.();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-emerald-500/30 text-emerald-300 font-bold text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Make 1st Deposit to Unlock (${monthlyAmt.toFixed(2)})</span>
              </button>
            ) : monthlyEligible ? (
              <button
                type="button"
                onClick={handleClaimMonthlyClick}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Claim ${monthlyAmt.toFixed(2)} Monthly Bonus</span>
              </button>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center justify-between font-mono">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Next claim in:
                </span>
                <span className="font-bold text-emerald-400">
                  {formatRemaining(monthlyRemainingMs)}
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
