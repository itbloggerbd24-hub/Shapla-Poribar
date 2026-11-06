import React from 'react';
import { X, Trophy, Coins, QrCode, ArrowUpCircle, CheckCircle2, Timer } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">How to Play & Game Guide</h2>
              <p className="text-xs text-slate-400">USD Betting, 30-Second Rounds, and Rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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
