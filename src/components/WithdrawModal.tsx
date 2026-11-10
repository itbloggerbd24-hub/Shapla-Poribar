import React, { useState, useEffect } from 'react';
import { AdminSettings, UserProfile, WithdrawalRequest } from '../types/game';
import { 
  X, 
  ArrowLeft,
  ArrowUpCircle, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Send,
  Clock,
  Lock
} from 'lucide-react';
import { checkWithdrawalHours, WithdrawalHoursStatus } from '../utils/withdrawalHours';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  user: UserProfile;
  userWithdrawals?: WithdrawalRequest[];
  onSubmitWithdrawal: (data: {
    amountUSD: number;
    binanceType: 'PAY_ID' | 'BEP20' | 'TRC20';
    binanceTarget: string;
  }) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  user,
  onSubmitWithdrawal,
}) => {
  const [usdAmount, setUsdAmount] = useState<number>(10.00);
  const [binanceType, setBinanceType] = useState<'PAY_ID' | 'BEP20' | 'TRC20'>('PAY_ID');
  const [targetAddress, setTargetAddress] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalBalance = user.walletBalance;
  const lockedBonus = user.lockedBonusBalance || 0;
  const withdrawableBalance = Math.max(0, Number((totalBalance - lockedBonus).toFixed(2)));
  
  // Real-time withdrawal hours check (Off 10:00 PM to 10:00 AM)
  const [hoursStatus, setHoursStatus] = useState<WithdrawalHoursStatus>(() => checkWithdrawalHours());

  useEffect(() => {
    if (isOpen) {
      setHoursStatus(checkWithdrawalHours());
      const interval = setInterval(() => {
        setHoursStatus(checkWithdrawalHours());
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minWithdrawal = adminSettings.minWithdrawalUSD || 10.00;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hoursStatus.isOpen) {
      setError('Withdrawal service is currently closed (10:00 PM to 10:00 AM). Service resumes daily at 10:00 AM.');
      return;
    }

    if (!usdAmount || usdAmount < minWithdrawal) {
      setError(`Minimum withdrawal amount is $${minWithdrawal.toFixed(2)} USD.`);
      return;
    }

    if (usdAmount > withdrawableBalance) {
      if (lockedBonus > 0 && usdAmount <= totalBalance) {
        setError(`Bonus funds cannot be withdrawn directly! You must wager your bonus in bets first. Locked Bonus: $${lockedBonus.toFixed(2)} USD. Available for withdrawal: $${withdrawableBalance.toFixed(2)} USD.`);
      } else {
        setError(`Insufficient withdrawable balance! Available: $${withdrawableBalance.toFixed(2)} USD.`);
      }
      return;
    }

    if (!targetAddress.trim()) {
      setError('Please provide your Binance Pay ID or destination wallet address.');
      return;
    }

    setError(null);
    onSubmitWithdrawal({
      amountUSD: Number(usdAmount.toFixed(2)),
      binanceType,
      binanceTarget: targetAddress.trim(),
    });

    setSubmittedSuccess(true);
    setTargetAddress('');
    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 4000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 py-2 sm:py-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-100 space-y-4">
        
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
            <ArrowUpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white">Binance Withdrawal (USD)</h1>
              {hoursStatus.isOpen ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  Open
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                  Closed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Daily processing window: 10:00 AM to 10:00 PM • Min $10.00 USD</p>
          </div>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-emerald-300">Withdrawal Request Received!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your withdrawal of ${usdAmount.toFixed(2)} USD has been queued for verification and will be transferred to your Binance account.
            </p>
            <button
              onClick={() => setSubmittedSuccess(false)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-200 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            
            {/* Operational Hours Notice */}
            {!hoursStatus.isOpen ? (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 font-black text-xs text-rose-300">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Withdrawal Service is Currently Closed (10:00 PM – 10:00 AM)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Withdrawal requests are processed between <strong className="text-white">10:00 AM and 10:00 PM</strong> daily. The service is closed for the night and resumes at <strong className="text-amber-300">10:00 AM</strong>.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-rose-300/80 font-mono pt-1">
                  <Clock className="w-3 h-3" />
                  <span>Current system time: {hoursStatus.formattedTime}</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Withdrawal is Open (10:00 AM – 10:00 PM)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {hoursStatus.nextOpenNotice}
                </span>
              </div>
            )}

            {/* Balance Card with Bonus Wager Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Withdrawable Balance:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    ${withdrawableBalance.toFixed(2)} USD
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Min $10.00
                  </span>
                </div>
              </div>

              {/* Sub-breakdown: Total & Locked Bonus */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Balance</span>
                  <span className="font-mono font-bold text-white text-xs">${totalBalance.toFixed(2)} USD</span>
                </div>
                <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                  <span className="text-[10px] text-amber-400/90 block font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                    Locked Bonus
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-xs">${lockedBonus.toFixed(2)} USD</span>
                </div>
              </div>

              {lockedBonus > 0 && (
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] flex items-start gap-1.5 leading-snug">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Bonus funds cannot be withdrawn directly. Play bets with your bonus in the arena to unlock it into cash!
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Method Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Withdrawal Method:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setBinanceType('PAY_ID')}
                    className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer ${
                      binanceType === 'PAY_ID'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    Binance Pay ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setBinanceType('BEP20')}
                    className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer ${
                      binanceType === 'BEP20'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    USDT (BEP-20)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBinanceType('TRC20')}
                    className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer ${
                      binanceType === 'TRC20'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    USDT (TRC-20)
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Withdrawal Amount ($ USD):
                  </label>
                  <button
                    type="button"
                    onClick={() => setUsdAmount(Number(withdrawableBalance.toFixed(2)))}
                    className="text-xs text-amber-400 hover:underline font-bold cursor-pointer"
                  >
                    Max (${withdrawableBalance.toFixed(2)})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-amber-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min={minWithdrawal}
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-8 pr-3 text-white font-mono font-bold text-base focus:border-amber-400 outline-none"
                    placeholder="10.00"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setUsdAmount(amt)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition cursor-pointer ${
                        usdAmount === amt
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Address / Pay ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {binanceType === 'PAY_ID'
                    ? 'Your Binance Pay ID / Email: *'
                    : `Your ${binanceType} Wallet Address: *`}
                </label>
                <input
                  type="text"
                  required
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder={
                    binanceType === 'PAY_ID'
                      ? 'e.g. 84920194 or email'
                      : binanceType === 'BEP20'
                      ? '0x...'
                      : 'T...'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Withdrawals operate daily between 10:00 AM and 10:00 PM. Minimum withdrawal is $10.00 USD.
                </span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!hoursStatus.isOpen}
                className={`w-full py-3 rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition transform active:scale-98 ${
                  hoursStatus.isOpen
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-950/40 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {hoursStatus.isOpen ? (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Request Withdrawal (${usdAmount.toFixed(2)} USD)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Withdrawal Closed (Resumes 10:00 AM)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
