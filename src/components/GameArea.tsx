import React, { useState } from 'react';
import { Bet, OptionType, Round } from '../types/game';
import { CoinFlipper } from './CoinFlipper';
import { 
  Zap,
  ShieldAlert,
  Coins
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameAreaProps {
  currentRound: Round;
  timeLeft: number;
  totalDuration: number;
  userBalance: number;
  userCurrentBets: Bet[];
  onPlaceBet: (option: OptionType, amount: number) => void;
  onOpenDeposit: () => void;
}

// Preset chips in USD starting from minimum $0.20
const CHIP_PRESETS = [0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 25.00, 50.00];

export const GameArea: React.FC<GameAreaProps> = ({
  currentRound,
  timeLeft,
  totalDuration,
  userBalance,
  userCurrentBets,
  onPlaceBet,
  onOpenDeposit,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(1.00);
  const [customInput, setCustomInput] = useState<string>('');
  const [betError, setBetError] = useState<string | null>(null);

  const isBettingActive = currentRound.status === 'BETTING';

  // Total pool combined in USD
  const totalPool = currentRound.shaplaTotal + currentRound.poribarTotal;

  // User's active bets for this round in USD
  const userShaplaBet = userCurrentBets
    .filter((b) => b.option === 'SHAPLA')
    .reduce((sum, b) => sum + b.amount, 0);

  const userPoribarBet = userCurrentBets
    .filter((b) => b.option === 'PORIBAR')
    .reduce((sum, b) => sum + b.amount, 0);

  const handleSelectChip = (amount: number) => {
    soundManager.playChip();
    setSelectedAmount(amount);
    setCustomInput('');
    setBetError(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    if ((val.match(/\./g) || []).length > 1) return;
    setCustomInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedAmount(parsed);
      setBetError(null);
    }
  };

  const currentBetAmount = customInput ? parseFloat(customInput) || selectedAmount : selectedAmount;

  const executeBet = (option: OptionType) => {
    const amount = currentBetAmount;
    
    // Strict rule: cannot bet on both sides in the same round
    if (option === 'SHAPLA' && userPoribarBet > 0) {
      setBetError('Cannot bet on both options in the same round! You have already bet on Poribar.');
      return;
    }
    if (option === 'PORIBAR' && userShaplaBet > 0) {
      setBetError('Cannot bet on both options in the same round! You have already bet on Shapla.');
      return;
    }

    // Minimum bet is $0.20
    if (!amount || amount < 0.20) {
      setBetError('Minimum bet is $0.20 USD.');
      return;
    }

    if (amount > userBalance) {
      setBetError('Insufficient balance! Please deposit to continue.');
      return;
    }

    setBetError(null);
    soundManager.playChip();
    onPlaceBet(option, amount);
  };

  // Potential payout calculation: 1.85x (+85% profit)
  const potentialWinProfit = Number((currentBetAmount * 0.85).toFixed(2));
  const totalPayout = Number((currentBetAmount + potentialWinProfit).toFixed(2));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      
      {/* Top Round Bar: Compact Single Row */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between gap-2 shadow-sm">
        
        {/* Live Pool Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white text-xs">
              Live Arena
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-emerald-400 text-[11px] sm:text-xs font-mono">
              Pool: ${totalPool.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
              {currentRound.totalBetsCount.toLocaleString()} Bets
            </span>
          </div>
        </div>

        {/* Payout Rate Badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-semibold">
          <Coins className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Win: <strong className="text-amber-200">1.85x</strong></span>
        </div>
      </div>

      {/* Main Arena Box (Optimized Viewport Height) */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-2 sm:p-4 shadow-xl overflow-hidden">
        
        {/* Ambient background glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Compact 3D Coin Flipper & 30s Countdown */}
        <CoinFlipper
          status={currentRound.status}
          winner={currentRound.winner}
          displaySide={'SHAPLA'}
          timeLeft={timeLeft}
          totalDuration={totalDuration}
          userShaplaBet={userShaplaBet}
          userPoribarBet={userPoribarBet}
        />

        {/* 2. COMPACT AMOUNT CHANGER DIRECTLY ABOVE THE BUTTONS */}
        <div className="my-2 pt-1.5 pb-1.5 border-t border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
                Amount:
              </span>
              <button
                type="button"
                onClick={() => {
                  if (userBalance >= 0.20) {
                    setSelectedAmount(Number(userBalance.toFixed(2)));
                    setCustomInput(userBalance.toFixed(2));
                  }
                }}
                className="text-[9px] sm:text-[10px] text-amber-400 hover:underline font-bold px-1 py-0.2 rounded bg-amber-500/10"
              >
                Max (${userBalance.toFixed(2)})
              </button>
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-emerald-400">
              Win Return: <strong className="font-mono font-bold">${totalPayout.toFixed(2)}</strong>
            </div>
          </div>

          {/* Chips Grid (Compact & Tappable on all screens) */}
          <div className="grid grid-cols-5 sm:grid-cols-9 gap-1 sm:gap-1.5">
            {CHIP_PRESETS.map((amt) => {
              const isSelected = selectedAmount === amt && !customInput;
              return (
                <button
                  key={amt}
                  onClick={() => handleSelectChip(amt)}
                  className={`py-1 sm:py-1.5 px-0.5 rounded-lg text-[11px] sm:text-xs font-black font-mono transition-all transform active:scale-95 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-sm ring-1 ring-amber-400'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700/80'
                  }`}
                >
                  ${amt < 1 ? amt.toFixed(2) : amt}
                </button>
              );
            })}
            
            {/* Custom Input */}
            <div className="col-span-2 sm:col-span-1 relative">
              <input
                type="text"
                placeholder="$ Custom"
                value={customInput}
                onChange={handleCustomChange}
                className={`w-full py-1 sm:py-1.5 px-1 text-[11px] sm:text-xs text-center font-bold rounded-lg bg-slate-950 border transition ${
                  customInput
                    ? 'border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                    : 'border-slate-700 text-slate-300 focus:border-slate-500'
                } outline-none font-mono`}
              />
            </div>
          </div>
        </div>

        {/* 3. DUAL BETTING BUTTONS SIDE-BY-SIDE (grid-cols-2) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2">
          
          {/* LEFT BUTTON & CARD: SHAPLA */}
          <div className={`relative rounded-xl p-2 sm:p-3 border transition-all duration-300 flex flex-col justify-between ${
            currentRound.winner === 'SHAPLA'
              ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-emerald-400 tracking-wider">
                  SHAPLA
                </h3>
              </div>

              <span className="text-[9px] sm:text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                1.85x
              </span>
            </div>

            {/* User's own bet on Shapla */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-1 sm:p-2 my-1 flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                Your Bet:
              </span>
              <span className="text-xs sm:text-sm font-black text-white font-mono">
                {userShaplaBet > 0 ? `$${userShaplaBet.toFixed(2)}` : '$0.00'}
              </span>
            </div>

            {/* Shapla Side-by-Side Action Button */}
            <button
              disabled={!isBettingActive || userPoribarBet > 0}
              onClick={() => executeBet('SHAPLA')}
              className={`w-full mt-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-black text-[11px] sm:text-sm flex items-center justify-center gap-1 shadow transition-all ${
                !isBettingActive || userPoribarBet > 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40 transform active:scale-95 cursor-pointer'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-200" />
              <span className="truncate">
                {userPoribarBet > 0 ? 'Locked' : `Bet $${currentBetAmount.toFixed(2)} Shapla`}
              </span>
            </button>
          </div>

          {/* RIGHT BUTTON & CARD: PORIBAR */}
          <div className={`relative rounded-xl p-2 sm:p-3 border transition-all duration-300 flex flex-col justify-between ${
            currentRound.winner === 'PORIBAR'
              ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-amber-400 tracking-wider">
                  PORIBAR
                </h3>
              </div>

              <span className="text-[9px] sm:text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                1.85x
              </span>
            </div>

            {/* User's own bet on Poribar */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-1 sm:p-2 my-1 flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                Your Bet:
              </span>
              <span className="text-xs sm:text-sm font-black text-white font-mono">
                {userPoribarBet > 0 ? `$${userPoribarBet.toFixed(2)}` : '$0.00'}
              </span>
            </div>

            {/* Poribar Side-by-Side Action Button */}
            <button
              disabled={!isBettingActive || userShaplaBet > 0}
              onClick={() => executeBet('PORIBAR')}
              className={`w-full mt-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-black text-[11px] sm:text-sm flex items-center justify-center gap-1 shadow transition-all ${
                !isBettingActive || userShaplaBet > 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-950/40 transform active:scale-95 cursor-pointer'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-slate-950" />
              <span className="truncate">
                {userShaplaBet > 0 ? 'Locked' : `Bet $${currentBetAmount.toFixed(2)} Poribar`}
              </span>
            </button>
          </div>

        </div>

        {/* Error notification if balance low */}
        {betError && (
          <div className="mt-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{betError}</span>
            </div>
            {userBalance < currentBetAmount && (
              <button
                onClick={onOpenDeposit}
                className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
              >
                Deposit
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
