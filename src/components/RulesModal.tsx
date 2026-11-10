import React from 'react';
import { X, Trophy, Coins, QrCode, ArrowUpCircle, CheckCircle2, Timer, ArrowLeft } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white">How to Play & Game Guide</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                Official Guide
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">USD Betting, 30-Second Rounds, and Fair Outcome Rules</p>
          </div>
        </div>

        {/* Content list */}
        <div className="mt-5 space-y-4 text-xs sm:text-sm">
          
          {/* Rule 1: Choose Side */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>1. Choose Shapla or Poribar (Min $0.20, Max Unlimited)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Place your prediction on either <strong>Shapla</strong> (Water Lily) or <strong>Poribar</strong> (Family). The minimum bet is only <strong>$0.20 USD</strong>, with unlimited maximum betting capacity.
            </p>
          </div>

          {/* Rule 2: 30-second rounds */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Timer className="w-4 h-4 text-indigo-400" />
              <span>2. Rapid 30-Second Rounds</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Every round lasts exactly <strong>30 seconds</strong>. Watch the real 3D coin toss flip and tumble through the air to reveal the winning side.
            </p>
          </div>

          {/* Rule 3: 1.85x Multiplier */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>3. 1.85x Instant Win Payout</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Winning predictions instantly receive a <strong>1.85x multiplier payout</strong> (+85% profit) credited immediately to your wallet balance.
            </p>
          </div>

          {/* Rule 4: Binance USD Deposits and Withdrawals */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>4. Binance Deposits & Withdrawals Policy</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Deposit via Binance Pay or USDT, attach your transaction screenshot, and admin will verify and approve your balance. Withdrawals are processed daily between <strong>10:00 AM and 10:00 PM</strong> (off from 10:00 PM to 10:00 AM).
            </p>
          </div>

          {/* Rule 5: Bonus Wagering & Withdrawal Policy */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>5. Bonus Wagering & Cashout Policy</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Bonus dollars (signup welcome bonus, referral bonuses, weekly and monthly bonuses) cannot be withdrawn directly. You must wager your bonus dollars in predictions/bets first to unlock them into withdrawable cash balance.
            </p>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
          >
            Got it, Let's Play
          </button>
        </div>

      </div>
    </div>
  );
};
