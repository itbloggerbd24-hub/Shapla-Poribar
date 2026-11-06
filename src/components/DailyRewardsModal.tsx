import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/game';
import { 
  X, 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Calendar,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onClaimDaily: () => void;
  onClaimWeekly: () => void;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  user,
  onClaimDaily,
  onClaimWeekly,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const lastDaily = user.lastDailyClaim || 0;
  const lastWeekly = user.lastWeeklyClaim || 0;

  const dailyEligible = (now - lastDaily) >= ONE_DAY_MS;
  const weeklyEligible = (now - lastWeekly) >= ONE_WEEK_MS;

  const dailyRemainingMs = Math.max(0, ONE_DAY_MS - (now - lastDaily));
  const weeklyRemainingMs = Math.max(0, ONE_WEEK_MS - (now - lastWeekly));

  const formatRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClaimDailyClick = () => {
    if (!dailyEligible) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });
    soundManager.playWin();
    onClaimDaily();
  };

  const handleClaimWeeklyClick = () => {
    if (!weeklyEligible) return;
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
    });
    soundManager.playWin();
    onClaimWeekly();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Gift className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-1.5">
                <span>Free Reward Center</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">Claim your recurring daily & weekly free prediction cash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          
          {/* Card 1: Daily Free Bonus ($0.50 USD) */}
          <div className={`p-4 rounded-2xl border transition ${
            dailyEligible
              ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Daily Bonus</h3>
                  <span className="text-[10px] text-slate-400">Resets every 24 hours</span>
                </div>
              </div>
              <div className="text-base font-black text-amber-300 font-mono">
                +$0.50 USD
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Free credit added straight to your balance for placing coin toss bets.
            </p>

            {dailyEligible ? (
              <button
                type="button"
                onClick={handleClaimDailyClick}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Claim $0.50 Daily Free Bonus</span>
              </button>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center justify-between font-mono">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Next claim in:
                </span>
                <span className="font-bold text-amber-400">
                  {formatRemaining(dailyRemainingMs)}
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Weekly Free Bonus ($1.00 USD) */}
          <div className={`p-4 rounded-2xl border transition ${
            weeklyEligible
              ? 'bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/30'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Weekly Loyalty Bonus</h3>
                  <span className="text-[10px] text-slate-400">Resets every 7 days</span>
                </div>
              </div>
              <div className="text-base font-black text-emerald-400 font-mono">
                +$1.00 USD
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Weekly loyalty gift awarded to all active Shapla Poribar players.
            </p>

            {weeklyEligible ? (
              <button
                type="button"
                onClick={handleClaimWeeklyClick}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Claim $1.00 Weekly Bonus</span>
              </button>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center justify-between font-mono">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Next claim in:
                </span>
                <span className="font-bold text-emerald-400">
                  {formatRemaining(weeklyRemainingMs)}
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
